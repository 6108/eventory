import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET() {
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

  const { data, error } = await supabase
    .from("order_requests")
    .select(
      `
      id,
      booth_id,
      customer_id,
      status,
      order_id,
      created_at,
      updated_at,

      booths (
        booth_name
      ),

      order_request_items (
        id,
        order_request_id,
        product_id,
        option_id,
        product_name,
        option_name,
        quantity
      ),

      orders (
        id,
        total_amount,
        total_quantity,
        status,
        created_at,
        order_items (
          product_name,
          option_name,
          unit_price,
          quantity,
          subtotal
        )
      )
      `
    )
    .eq("customer_id", user.id)
    .neq("status", "cancelled")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("내 주문 요청 조회 실패:", error);

    return NextResponse.json(
      {
        error: "주문내역을 불러오지 못했습니다.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    requests: data ?? [],
  });
}