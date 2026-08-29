// src/app/api/booth/[boothId]/order-requests/complete/route.ts
import { NextResponse } from "next/server";
import { requireBoothArtist } from "@/src/lib/auth/requireBoothArtist";

// 결제(판매 완료) 성공 직후 호출됨.
// 이 결제에 반영된 손님 주문 요청들을 completed로 바꾸고 영수증(orderId)과 연결해서
// 손님이 자기 주문내역에서 "보낸 주문 → 결제 완료"로 이어진 걸 볼 수 있게 함.
// 참고: 수량이 결제 시점에 조정됐을 수 있어 완전한 금액 대사는 아니고
// "이 요청이 이 영수증으로 이어졌다"는 참조 수준의 연결.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;
  const { requestIds, orderId } = (await request.json()) as {
    requestIds: string[];
    orderId: string;
  };

  if (!Array.isArray(requestIds) || requestIds.length === 0 || !orderId) {
    // 손님 주문 요청 없이 부스러가 직접 담아 판매한 경우엔 호출 자체가 안 되므로
    // 정상 케이스. 에러로 취급하지 않음.
    return NextResponse.json({ success: true, updated: 0 });
  }

  const authResult = await requireBoothArtist(boothId);
  if (authResult instanceof NextResponse) return authResult;
  const { supabase } = authResult;

  const { error } = await supabase
    .from("order_requests")
    .update({ order_id: orderId })
    .eq("booth_id", boothId)
    .in("id", requestIds);

  if (error) {
    console.error("주문 요청 completed 처리 실패:", error);
    // 결제 자체는 이미 성공했으므로 500으로 막지 않고, 연결만 실패했음을 알림
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }

  return NextResponse.json({ success: true, updated: requestIds.length });
}