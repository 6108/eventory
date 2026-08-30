// src/app/api/products/category-counts/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import {
  getFollowedBoothCategoryCounts,
  getProductCategoryCounts,
  ProductListFilter,
} from "@/src/lib/data/product";
import { ProductCategory } from "@/src/types/product";

// 카테고리/서브카테고리별 상품 개수만 조회. 상품 목록(/api/products)과 완전히
// 분리된 엔드포인트라, 페이지를 더 불러오는 것과는 무관하게 필터 칩이 필요한
// 시점에만 따로 호출하면 된다 (보통 첫 진입 시 1번, category가 바뀔 때 1번).
// GET /api/products/category-counts?boothId=&following=true&category=
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const boothId = searchParams.get("boothId");
  const following = searchParams.get("following") === "true";

  const category =
    (searchParams.get("category") as ProductCategory | null) ?? "ALL";

  const filter: ProductListFilter = { category };

  if (following) {
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

    const result = await getFollowedBoothCategoryCounts(user.id, filter);

    return NextResponse.json(result);
  }

  const result = await getProductCategoryCounts(
    boothId ? { ...filter, boothIds: [boothId] } : filter
  );

  return NextResponse.json(result);
}