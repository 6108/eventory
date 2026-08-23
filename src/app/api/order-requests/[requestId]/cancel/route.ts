// src/app/api/order-requests/[requestId]/cancel/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

// 부스 소유권과 무관 — 손님 본인이 보낸 요청만 취소 가능.
// 이미 부스러가 확인(checked)해서 POS에 담아버린 뒤에는 취소를 막음 —
// 이미 처리가 시작된 걸 손님이 뒤에서 조용히 없애버리면 부스러가 헷갈리기 때문.
// 이 경우엔 부스 앞에서 직접 말로 정정해야 함.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const { requestId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: existing } = await supabase
    .from("order_requests")
    .select("id, customer_id, status")
    .eq("id", requestId)
    .maybeSingle();

  if (!existing || existing.customer_id !== user.id) {
    return NextResponse.json({ error: "취소 권한이 없습니다." }, { status: 403 });
  }

  if (existing.status !== "requested") {
    return NextResponse.json(
      {
        error:
          existing.status === "checked"
            ? "취소할 수 없는 상태입니다."
            : "취소할 수 없는 상태입니다.",
      },
      { status: 409 }
    );
  }

  const { error } = await supabase
    .from("order_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId);

  if (error) {
    console.error("주문 요청 취소 실패:", error);
    return NextResponse.json({ error: "취소에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}