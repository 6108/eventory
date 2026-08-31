import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";

// 장바구니에 담긴 상품들의 최신 구매제한/재고 조회

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

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, remaining_quantity, purchase_limit,
      product_options ( id, remaining_quantity )`
    )
    .in("id", productIds);

  if (error) {
    console.error("구매제한/재고 조회 실패:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const limits = [];

  for (const product of data ?? []) {
    const options = product.product_options ?? [];

    if (options.length === 0) {
      limits.push({
        productId: product.id,
        optionId: null,
        purchaseLimit: product.purchase_limit,
        remainingQuantity: product.remaining_quantity,
      });

      continue;
    }

    for (const option of options) {
      limits.push({
        productId: product.id,
        optionId: option.id,
        purchaseLimit: product.purchase_limit,
        remainingQuantity: option.remaining_quantity,
      });
    }
  }

  return NextResponse.json({ limits });
}