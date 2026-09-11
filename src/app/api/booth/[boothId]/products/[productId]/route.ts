// src/app/api/booth/[boothId]/products/[productId]/route.ts

import { NextResponse } from "next/server";
import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

type ProductOptionInput = {
  id?: string;
  name: string;
  initialQuantity: number;
};

// 재고 수정 시 remaining_quantity를 무조건 initial_quantity로 리셋하면
// 이미 판매된(차감된) 수량까지 되살아나 오버셀이 발생한다.
// 대신 "이미 팔린 수량(sold) = old initial - old remaining"을 구해서
// 새 initial_quantity에서 그만큼만 뺀 값을 remaining으로 사용한다.
// null은 "무제한 재고"를 의미하므로 null <-> 숫자 전환도 함께 처리한다.
function computeRemainingOnQuantityUpdate(
  oldInitial: number | null,
  oldRemaining: number | null,
  newInitial: number | null
): number | null {
  if (newInitial === null) {
    // 무제한으로 전환
    return null;
  }

  if (oldInitial === null || oldRemaining === null) {
    // 이전에 무제한이었거나(기존 재고 개념이 없었음) 값이 비어있었던 경우,
    // 팔린 수량을 알 수 없으므로 새 초기 수량을 그대로 남은 수량으로 사용
    return newInitial;
  }

  const sold = Math.max(oldInitial - oldRemaining, 0);
  return Math.max(newInitial - sold, 0);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ boothId: string; productId: string }> }
) {
  const { boothId, productId } = await params;
  const body = await request.json();

  const {
    name,
    mainImageUrl,
    sampleImageUrls,
    price,
    category,
    subCategory,
    initialQuantity,
    purchaseLimit,
    description,
    artistIds,
    options,
    visible,
  } = body;

  // =========================
  // 기본 유효성 검사
  // =========================

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "작품명을 입력해주세요." },
      { status: 400 }
    );
  }

  if (!category || !subCategory) {
    return NextResponse.json(
      { error: "작품 카테고리를 선택해주세요." },
      { status: 400 }
    );
  }

  if (price === undefined || price === null || Number(price) < 0) {
    return NextResponse.json(
      { error: "가격을 올바르게 입력해주세요." },
      { status: 400 }
    );
  }

  if (!mainImageUrl?.trim()) {
    return NextResponse.json(
      { error: "대표 이미지를 업로드해주세요." },
      { status: 400 }
    );
  }

  if (!Array.isArray(artistIds) || artistIds.length === 0) {
    return NextResponse.json(
      { error: "작품 작가를 선택해주세요." },
      { status: 400 }
    );
  }

  if (!Array.isArray(options)) {
    return NextResponse.json(
      { error: "작품 옵션이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  // =========================
  // 인증
  // =========================

  const authResult = await requireBoothArtist(boothId);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { supabase } = authResult;

  // =========================
  // 작품 존재 여부 확인
  // =========================

  const { data: existing, error: existingError } = await supabase
    .from("products")
    .select("id, initial_quantity, remaining_quantity")
    .eq("id", productId)
    .eq("booth_id", boothId)
    .single();

  if (existingError || !existing) {
    return NextResponse.json(
      { error: "작품을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  // =========================
  // 작가 정보 조회
  // =========================

  const { data: artistData, error: artistError } = await supabase
    .from("users")
    .select("id, name")
    .in("id", artistIds);

  if (
    artistError ||
    !artistData ||
    artistData.length !== artistIds.length
  ) {
    return NextResponse.json(
      { error: "유효하지 않은 작가가 포함되어 있습니다." },
      { status: 400 }
    );
  }

  const nameMap = new Map(
    artistData.map((artist) => [artist.id, artist.name])
  );

  const artistNames = artistIds.map(
    (id: string) => nameMap.get(id)!
  );

  // =========================
  // 옵션 여부
  // =========================

  const hasOptions = options.length > 0;

  const productInitialQuantity = hasOptions
    ? null
    : initialQuantity === null || initialQuantity === ""
      ? null
      : Number(initialQuantity);

  const productRemainingQuantity = computeRemainingOnQuantityUpdate(
    existing.initial_quantity,
    existing.remaining_quantity,
    productInitialQuantity
  );

  // =========================
  // 상품 수정
  // =========================

  const { data: product, error: productError } = await supabase
    .from("products")
    .update({
      main_image: mainImageUrl.trim(),
      sample_images: Array.isArray(sampleImageUrls)
        ? sampleImageUrls
        : [],
      name: name.trim(),
      price: Number(price),
      category,
      sub_category: subCategory,

      initial_quantity: productInitialQuantity,
      remaining_quantity: productRemainingQuantity,

      purchase_limit:
        purchaseLimit === null || purchaseLimit === ""
          ? null
          : Number(purchaseLimit),

      description: description?.trim() ?? "",
      artist_ids: artistIds,
      artist_names: artistNames,
      visible: visible ?? true,
    })
    .eq("id", productId)
    .eq("booth_id", boothId)
    .select(
      `
        id,
        booth_id,
        main_image,
        sample_images,
        name,
        price,
        category,
        sub_category,
        initial_quantity,
        purchase_limit,
        description,
        remaining_quantity,
        artist_ids,
        artist_names,
        visible
      `
    )
    .single();

  if (productError) {
    console.error(productError);

    return NextResponse.json(
      { error: "작품 수정에 실패했습니다." },
      { status: 500 }
    );
  }

  // ============================================================
  // 옵션 수정
  // ============================================================

  // 기존 옵션 조회
  const {
    data: existingOptions,
    error: existingOptionsError,
  } = await supabase
    .from("product_options")
    .select(
      `
        id,
        product_id,
        name,
        initial_quantity,
        remaining_quantity
      `
    )
    .eq("product_id", productId);

  if (existingOptionsError) {
    console.error(existingOptionsError);

    return NextResponse.json(
      { error: "기존 작품 옵션을 불러오지 못했습니다." },
      { status: 500 }
    );
  }

  const currentOptions = existingOptions ?? [];

  // 기존 옵션을 ID로 빠르게 찾기 위한 Map
  const existingOptionMap = new Map(
    currentOptions.map((option) => [option.id, option])
  );

  // 현재 요청에 포함된 기존 옵션 ID
  const incomingOptionIds = new Set(
    (options as ProductOptionInput[])
      .map((option) => option.id)
      .filter((id): id is string => Boolean(id))
  );

  // ============================================================
  // 1. 기존 옵션 수정
  // ============================================================

  for (const option of options as ProductOptionInput[]) {
    // id가 없으면 새 옵션이므로 여기서는 건너뜀
    if (!option.id) {
      continue;
    }

    // 이 상품의 기존 옵션인지 확인
    const existingOption = existingOptionMap.get(option.id);

    if (!existingOption) {
      return NextResponse.json(
        { error: "유효하지 않은 작품 옵션이 포함되어 있습니다." },
        { status: 400 }
      );
    }

    if (!option.name?.trim()) {
      return NextResponse.json(
        { error: "옵션명을 입력해주세요." },
        { status: 400 }
      );
    }

    if (
      option.initialQuantity === undefined ||
      option.initialQuantity === null ||
      Number(option.initialQuantity) < 0
    ) {
      return NextResponse.json(
        { error: "옵션 재고를 올바르게 입력해주세요." },
        { status: 400 }
      );
    }

    const newOptionInitialQuantity = Number(option.initialQuantity);

    const newOptionRemainingQuantity = computeRemainingOnQuantityUpdate(
      existingOption.initial_quantity,
      existingOption.remaining_quantity,
      newOptionInitialQuantity
    );

    const { error: updateOptionError } = await supabase
      .from("product_options")
      .update({
        name: option.name.trim(),
        initial_quantity: newOptionInitialQuantity,
        remaining_quantity: newOptionRemainingQuantity,
      })
      .eq("id", option.id)
      .eq("product_id", productId);

    if (updateOptionError) {
      console.error(updateOptionError);

      return NextResponse.json(
        { error: "작품 옵션 수정에 실패했습니다." },
        { status: 500 }
      );
    }
  }

  // ============================================================
  // 2. 새 옵션 추가
  // ============================================================

  const newOptions = (options as ProductOptionInput[])
    .filter((option) => !option.id)
    .map((option) => ({
      product_id: productId,
      name: option.name.trim(),
      initial_quantity: Number(option.initialQuantity),
      remaining_quantity: Number(option.initialQuantity),
    }));

  if (newOptions.length > 0) {
    const { error: insertOptionError } = await supabase
      .from("product_options")
      .insert(newOptions);

    if (insertOptionError) {
      console.error(insertOptionError);

      return NextResponse.json(
        { error: "새 작품 옵션 추가에 실패했습니다." },
        { status: 500 }
      );
    }
  }

  // ============================================================
  // 3. 삭제된 기존 옵션 처리
  // ============================================================
  // QA: 예전에는 주문(order_items)에서 한 번이라도 쓰인 옵션은 삭제를
  // 건너뛰었음(FK가 ON DELETE NO ACTION이라 삭제 시 에러가 났기 때문).
  // 하지만 order_items가 product_name/option_name/unit_price/subtotal을
  // 자체 컬럼으로 이미 저장해두는 스냅샷 구조라, 옵션을 지워도 과거 주문
  // 표시에는 전혀 영향이 없음. order_items_option_id_fkey를
  // ON DELETE SET NULL로 마이그레이션한 뒤에는 이 체크가 필요 없어져서
  // 제거함 — 이제 아티스트가 옵션을 자유롭게 삭제할 수 있음.

  const deletedOptions = currentOptions.filter(
    (option) => !incomingOptionIds.has(option.id)
  );

  if (deletedOptions.length > 0) {
    const { error: deleteOptionError } = await supabase
      .from("product_options")
      .delete()
      .in(
        "id",
        deletedOptions.map((option) => option.id)
      )
      .eq("product_id", productId);

    if (deleteOptionError) {
      console.error(deleteOptionError);

      return NextResponse.json(
        { error: "삭제된 작품 옵션 처리에 실패했습니다." },
        { status: 500 }
      );
    }
  }

  // ============================================================
  // 완료
  // ============================================================

  return NextResponse.json({
    product,
  });
}

// ================================================================
// DELETE PRODUCT
// ================================================================

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ boothId: string; productId: string }> }
) {
  const { boothId, productId } = await params;

  const authResult = await requireBoothArtist(boothId);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { supabase } = authResult;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("booth_id", boothId);

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "작품 삭제에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}