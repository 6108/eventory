// src/app/api/booth/[boothId]/products/[productId]/route.ts
import { NextResponse } from "next/server";
import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

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
  } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "작품명을 입력해주세요." }, { status: 400 });
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

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

  // 수정 대상 작품이 이 부스 소유가 맞는지 확인
  const { data: existing, error: existingError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("booth_id", boothId)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: "작품을 찾을 수 없습니다." }, { status: 404 });
  }

  // 작가 이름 스냅샷 재생성 — 클라이언트가 보낸 이름을 믿지 않고 서버에서 직접 조회
  const { data: artistData, error: artistError } = await supabase
    .from("users")
    .select("id, name")
    .in("id", artistIds);

  if (artistError || !artistData || artistData.length !== artistIds.length) {
    return NextResponse.json(
      { error: "유효하지 않은 작가가 포함되어 있습니다." },
      { status: 400 }
    );
  }

  const nameMap = new Map(artistData.map((a) => [a.id, a.name]));
  const artistNames = artistIds.map((id: string) => nameMap.get(id)!);

  const hasOptions = options.length > 0;

  const productInitialQuantity = hasOptions
    ? null
    : initialQuantity === null || initialQuantity === ""
      ? null
      : Number(initialQuantity);

  const { data: product, error } = await supabase
    .from("products")
    .update({
      main_image: mainImageUrl.trim(),
      sample_images: Array.isArray(sampleImageUrls) ? sampleImageUrls : [],
      name: name.trim(),
      price: Number(price),
      category,
      sub_category: subCategory,

      initial_quantity: productInitialQuantity,
      remaining_quantity: productInitialQuantity,

      purchase_limit:
        purchaseLimit === null || purchaseLimit === "" ? null : Number(purchaseLimit),

      description: description?.trim() ?? "",
      artist_ids: artistIds,
      artist_names: artistNames,
    })
    .eq("id", productId)
    .eq("booth_id", boothId)
    .select(
      "id, booth_id, main_image, sample_images, name, price, category, sub_category, initial_quantity, purchase_limit, description, remaining_quantity, artist_ids, artist_names"
    )
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "작품 수정에 실패했습니다." }, { status: 500 });
  }

  // 기존 옵션 전체 삭제 후 재생성 (옵션 구성 자체가 바뀔 수 있으므로)
  const { error: deleteOptionsError } = await supabase
    .from("product_options")
    .delete()
    .eq("product_id", productId);

  if (deleteOptionsError) {
    console.error(deleteOptionsError);
    return NextResponse.json(
      { error: "작품 옵션 수정에 실패했습니다." },
      { status: 500 }
    );
  }

  if (hasOptions) {
    const optionRows = options.map(
      (option: { name: string; initialQuantity: number }) => ({
        product_id: productId,
        name: option.name.trim(),
        initial_quantity: Number(option.initialQuantity),
        remaining_quantity: Number(option.initialQuantity),
      })
    );

    const { error: optionError } = await supabase
      .from("product_options")
      .insert(optionRows);

    if (optionError) {
      console.error(optionError);
      return NextResponse.json(
        { error: "작품 옵션 추가에 실패했습니다." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ product });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ boothId: string; productId: string }> }
) {
  const { boothId, productId } = await params;

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("booth_id", boothId);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "작품 삭제에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}