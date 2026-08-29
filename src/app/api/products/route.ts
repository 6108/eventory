// src/app/api/products/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import {
  getFollowedBoothProductsPaged,
  getProductSummariesPaged,
  ProductListFilter,
} from "@/src/lib/data/product";
import { ProductCategory, ProductSubCategory } from "@/src/types/product";

// 전체 상품 목록 / 팔로우한 부스 상품 목록을 무한스크롤용으로 페이지 단위 조회.
// GET /api/products?boothId=&following=true&category=&subCategory=&page=0
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const boothId = searchParams.get("boothId");
  const following = searchParams.get("following") === "true";

  const category =
    (searchParams.get("category") as ProductCategory | null) ?? "ALL";
  const subCategory =
    (searchParams.get("subCategory") as ProductSubCategory | null) ?? "ALL";

  const pageParam = Number(searchParams.get("page") ?? "0");
  const page = Number.isFinite(pageParam) && pageParam >= 0 ? pageParam : 0;

  const filter: ProductListFilter = { category, subCategory };

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

    const result = await getFollowedBoothProductsPaged(
      user.id,
      page,
      filter
    );

    return NextResponse.json(result);
  }

  const result = await getProductSummariesPaged(
    page,
    boothId ? { ...filter, boothIds: [boothId] } : filter
  );

  return NextResponse.json(result);
}