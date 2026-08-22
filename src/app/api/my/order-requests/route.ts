// src/app/api/my/order-requests/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

// 로그인한 고객이 지금까지 보낸 모든 주문 요청 조회 (모든 부스 통틀어서).
// completed인 건 연결된 orders 정보까지 같이 붙여서 "결제 완료" 섹션에 보여줄 수 있게 함.
// RLS가 customer_id = auth.uid()로 이미 걸러주지만, 명시적으로도 필터링.
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("order_requests")
    .select(
      `id, booth_id, status, created_at, updated_at,
      booths ( name ),
      order_request_items (
        id,
        order_request_id,
        product_id,
        option_id,
        product_name,
        option_name,
        quantity
      ),
      orders ( id, total_amount, total_quantity, status, created_at )`
    )
    .eq("customer_id", user.id)
    .neq("status", "cancelled")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("내 주문내역 조회 실패:", error);
    return NextResponse.json({ error: "주문내역을 불러오지 못했습니다." }, { status: 500 });
  }

  return NextResponse.json({ requests: data ?? [] });
}