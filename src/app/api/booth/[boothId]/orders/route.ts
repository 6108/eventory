// src/app/api/booth/[boothId]/orders/route.ts
import { NextResponse } from "next/server";
import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

type OrderPayload = {
  productId: string;
  quantity: number;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;
  const body = await request.json();
  const { clientTransactionId, items } = body as {
    clientTransactionId: string;
    items: OrderPayload[];
  };

  if (!clientTransactionId || !items || items.length === 0) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

  const productIds = items.map((item) => item.productId);

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, price")
    .eq("booth_id", boothId)
    .in("id", productIds);

  if (productsError || !products || products.length !== new Set(productIds).size) {
    return NextResponse.json({ error: "잘못된 상품이 포함되어 있습니다." }, { status: 400 });
  }

  const priceMap = new Map(products.map((p) => [p.id, p.price]));

  let totalAmount = 0;
  let totalQuantity = 0;
  const orderItems = items.map((item) => {
    const unitPrice = priceMap.get(item.productId)!;
    totalAmount += unitPrice * item.quantity;
    totalQuantity += item.quantity;
    return {
      product_id: item.productId,
      option_id: null, // product_options 미반영 상태 — 추후 옵션 기능 추가 시 처리
      quantity: item.quantity,
      unit_price: unitPrice,
    };
  });

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      booth_id: boothId,
      client_transaction_id: clientTransactionId,
      total_amount: totalAmount,
      total_quantity: totalQuantity,
    })
    .select("id")
    .single();

  if (orderError) {
    if (orderError.code === "23505") {
      return NextResponse.json({ success: true, duplicate: true });
    }
    console.error(orderError);
    return NextResponse.json({ error: "주문 생성에 실패했습니다." }, { status: 500 });
  }


  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  if (itemsError) {
    console.error(itemsError);
    await supabase.from("orders").delete().eq("id", order.id);
    return NextResponse.json(
      { error: "주문 상품 저장에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, orderId: order.id });
}