// src/lib/data/orderRequest.ts

import { createClient } from "@/src/lib/supabase/server";
import { OrderRequest, OrderRequestItem, OrderRequestStatus } from "@/src/types/request";

// 부스로 온 주문 요청 목록 (최신순 = updated_at 기준)
// cancelled는 굳이 부스러 화면에 보여줄 필요 없어서 제외

export async function getBoothOrderRequests(
  boothId: string
): Promise<OrderRequest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_requests")
    .select(`
      id,
      booth_id,
      customer_id,
      customer_nickname,
      status,
      order_id,
      created_at,
      updated_at,
      order_request_items (
        id,
        order_request_id,
        product_id,
        option_id,
        product_name,
        option_name,
        quantity
      )
    `)
    .eq("booth_id", boothId)
    .neq("status", "cancelled")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("주문 요청 조회 실패:", error);
    return [];
  }

  return (data ?? []).map((row): OrderRequest => ({
    id: row.id,
    boothId: row.booth_id,
    customerId: row.customer_id,
    customerNickname: row.customer_nickname,
    status: row.status as OrderRequestStatus,
    orderId: row.order_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: (row.order_request_items ?? []).map(
      (item): OrderRequestItem => ({
        id: item.id,
        orderRequestId: item.order_request_id,
        productId: item.product_id,
        optionId: item.option_id,
        productName: item.product_name,
        optionName: item.option_name,
        quantity: item.quantity,
      })
    ),
  }));
}