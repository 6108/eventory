// src/app/api/products/limits/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getProductLimits } from "@/src/lib/data/product";

// 장바구니 화면 진입 시 호출해서, 담긴 상품들의 최신 구매제한/재고를 가져온다.
// GET /api/products/limits?ids=productId1,productId2,...
export async function GET(req: NextRequest) {
  const idsParam = req.nextUrl.searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ limits: [] });
  }

  const productIds = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (productIds.length === 0) {
    return NextResponse.json({ limits: [] });
  }

  const limits = await getProductLimits(productIds);

  return NextResponse.json({ limits });
}