import { NextResponse } from "next/server";
import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boothId: string; orderId: string }> }
) {
  const { boothId } = await params;
  const { orderItemId, quantity } = await request.json();

  if (!orderItemId || !quantity || quantity <= 0) {
    return NextResponse.json(
      { error: "취소 항목과 수량을 확인해주세요." },
      { status: 400 }
    );
  }

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

  const { data, error } = await supabase.rpc("cancel_order_item", {
    p_order_item_id: orderItemId,
    p_cancel_quantity: quantity,
    p_booth_id: boothId,
  });

  if (error) {
    console.error(error);

    // unauthorized: order_item이 이 부스 소속이 아닌 경우 (권한 우회 시도 방어)
    // invalid order item: order_item_id 자체가 잘못된 경우
    if (error.message === "unauthorized" || error.message === "invalid order item") {
      return NextResponse.json({ error: "취소 권한이 없습니다." }, { status: 403 });
    }

    const message =
      error.message === "invalid cancel quantity"
        ? "취소 가능한 수량을 초과했습니다."
        : error.message === "order already cancelled"
          ? "이미 취소된 주문입니다."
          : "취소 처리에 실패했습니다.";

    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json(data);
}