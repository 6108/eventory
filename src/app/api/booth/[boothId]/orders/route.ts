// src/app/api/booth/[boothId]/orders/route.ts
import { NextResponse } from "next/server";
import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";
import { getBoothOrders } from "@/src/lib/data/order";

type OrderPayload = {
  productId: string;
  optionId?: string | null;
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

  const { data: orderId, error } = await supabase.rpc("create_order", {
    p_booth_id: boothId,
    p_client_transaction_id: clientTransactionId,
    p_items: items.map((item) => ({
      product_id: item.productId,
      option_id: item.optionId ?? null,
      quantity: item.quantity,
    })),
  });

  if (error) {
    console.error(error);

    if (error.message?.startsWith("out of stock")) {
      return NextResponse.json({ error: "재고가 부족합니다." }, { status: 409 });
    }
    if (error.message?.startsWith("invalid product")) {
      return NextResponse.json(
        { error: "잘못된 상품이 포함되어 있습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "주문 생성에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true, orderId });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;

  const orders = await getBoothOrders(boothId);

  return NextResponse.json({ orders });
}