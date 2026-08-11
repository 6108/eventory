import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

// 로그인한 부스 참여자가 자신의 부스에 상품을 추가하는 API
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

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  // 현재 로그인한 사용자가 해당 부스의 참여자인지 확인
  const { data: artist } = await supabase
    .from("booth_artists")
    .select("booth_id")
    .eq("booth_id", boothId)
    .eq("artist_id", user.id)
    .maybeSingle();

  if (!artist) {
    return NextResponse.json(
      { error: "상품을 추가할 권한이 없습니다." },
      { status: 403 }
    );
  }

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
    })
    .select(
      "id, booth_id, main_image_url, name, price, category, sub_category, total_quantity, purchase_limit, description"
    )
    .single();

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "상품 추가에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { product },
    { status: 201 }
  );
}