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

  const {
    clientTransactionId,
    items,
    orderRequestIds,
  } = body as {
    clientTransactionId: string;
    items: OrderPayload[];
    orderRequestIds?: string[];
  };

  if (!clientTransactionId || !items || items.length === 0) {
    return NextResponse.json(
      { error: "잘못된 요청입니다." },
      { status: 400 }
    );
  }

  const authResult = await requireBoothArtist(boothId);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { supabase } = authResult;

  const { data: orderId, error } = await supabase.rpc("create_order", {
    p_booth_id: boothId,
    p_client_transaction_id: clientTransactionId,
    p_items: items.map((item) => ({
      product_id: item.productId,
      option_id: item.optionId ?? null,
      quantity: item.quantity,
    })),
    p_order_request_ids: orderRequestIds ?? [],
  });

  if (error) {
    console.error(error);

    // 클라이언트가 같은 clientTransactionId로 재시도한 경우 (예: 결제는
    // 서버에서 성공했지만 와이파이가 끊겨 응답을 못 받아 재시도한 케이스).
    // orders.client_transaction_id UNIQUE 제약 위반(23505)이면 이미 처리된
    // 주문이 있다는 뜻이므로, 에러로 취급하지 않고 그 주문을 그대로 반환한다.
    if (error.code === "23505") {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("client_transaction_id", clientTransactionId)
        .maybeSingle();

      if (existingOrder) {
        return NextResponse.json({
          success: true,
          orderId: existingOrder.id,
        });
      }
    }

    if (error.message?.startsWith("out of stock")) {
      return NextResponse.json(
        { error: "재고가 부족합니다." },
        { status: 409 }
      );
    }

    if (error.message?.startsWith("invalid product")) {
      return NextResponse.json(
        { error: "잘못된 작품이 포함되어 있습니다." },
        { status: 400 }
      );
    }

    if (error.message?.startsWith("invalid option")) {
      return NextResponse.json(
        { error: "잘못된 옵션이 포함되어 있습니다." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "주문 생성에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    orderId,
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;

  const authResult = await requireBoothArtist(boothId);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const orders = await getBoothOrders(boothId);

  return NextResponse.json({ orders });
}