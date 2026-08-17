// src/app/api/booth/[boothId]/products/route.ts
import { NextResponse } from "next/server";
import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;
  const body = await request.json();

  const {
    name,
    mainImageUrl,
    price,
    category,
    subCategory,
    totalQuantity,
    purchaseLimit,
    description,
    artistIds,
  } = body;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "상품명을 입력해주세요." },
      { status: 400 }
    );
  }

  if (!category || !subCategory) {
    return NextResponse.json(
      { error: "상품 카테고리를 선택해주세요." },
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
      { error: "상품 작가를 선택해주세요." },
      { status: 400 }
    );
  }

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

  // 작가 이름 스냅샷 생성 — 클라이언트가 보낸 이름을 믿지 않고 서버에서 직접 조회
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

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      booth_id: boothId,
      main_image_url: mainImageUrl.trim(),
      name: name.trim(),
      price: Number(price),
      category,
      sub_category: subCategory,
      total_quantity:
        totalQuantity === null || totalQuantity === ""
          ? null
          : Number(totalQuantity),
      purchase_limit:
        purchaseLimit === null || purchaseLimit === ""
          ? null
          : Number(purchaseLimit),
      description: description?.trim() ?? "",
      artist_ids: artistIds,
      artist_names: artistNames,
    })
    .select(
      "id, booth_id, main_image_url, sample_images, name, price, category, sub_category, total_quantity, purchase_limit, description, options, artist_ids, artist_names"
    )
    .single();

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "상품 추가에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ product }, { status: 201 });
}