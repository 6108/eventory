// src/lib/data/order.ts
import { createClient } from "@/src/lib/supabase/server";
import { Order, OrderItem, ReceiptOrder } from "@/src/types/order";

// 부스의 주문 목록 조회 (최신순)
export async function getBoothOrders(boothId: string): Promise<Order[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, booth_id, client_transaction_id, total_amount, total_quantity,
      status, cancelled_at, created_at,
      order_items ( id, product_id, option_id, product_name, option_name,
        unit_price, quantity, cancelled_quantity, subtotal )`
    )
    .eq("booth_id", boothId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("주문 조회 실패:", error);
    return [];
  }

  return (data ?? []).map((order): Order => ({
    id: order.id,
    boothId: order.booth_id,
    clientTransactionId: order.client_transaction_id,
    totalAmount: order.total_amount,
    totalQuantity: order.total_quantity,
    status: order.status,
    cancelledAt: order.cancelled_at,
    createdAt: order.created_at,
    items: (order.order_items ?? []).map((item): OrderItem => ({
      id: item.id,
      productId: item.product_id,
      optionId: item.option_id,
      productName: item.product_name,
      optionName: item.option_name,
      unitPrice: item.unit_price,
      quantity: item.quantity,
      cancelledQuantity: item.cancelled_quantity,
      subtotal: item.subtotal,
    })),
  }));
}

// 유저의 주문 목록 조회 (최신순)
export async function getUserOrders(
  userId: string
): Promise<ReceiptOrder[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("order_requests")
    .select(`
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
    `)
    .eq("customer_id", userId)
    .not("order_id", "is", null);

  if (error) {
    console.error("유저 주문 조회 실패:", error);
    return [];
  }

  return (data ?? [])
    .filter((request) => request.orders !== null)
    .map((request) => {
      const order = request.orders!;

      return {
        id: order.id,
        totalAmount: order.total_amount,
        totalQuantity: order.total_quantity,
        status: order.status,
        createdAt: order.created_at,
        items: (order.order_items ?? []).map((item) => ({
          productName: item.product_name,
          optionName: item.option_name,
          unitPrice: item.unit_price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      };
    });
}