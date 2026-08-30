"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Order } from "@/src/types/order";

export type { Order, OrderItem } from "@/src/types/order";

// OrderPanel(판매 화면)에서 결제가 성공하면 이 키를 invalidate해서
// ReceiptList(영수증 탭)에 바로 반영되게 한다. 두 컴포넌트가 이전에는
// 서로 독립된 fetch 상태를 갖고 있어서, 결제 직후 영수증 탭에 방금 판
// 주문이 안 보이는 문제가 있었다 (router.refresh()는 서버 컴포넌트만
// 갱신할 뿐, 이 클라이언트 쿼리 캐시는 건드리지 않았음).
export const ordersKey = (boothId: string) => ["orders", boothId] as const;

async function fetchOrders(boothId: string): Promise<Order[]> {
  const res = await fetch(`/api/booth/${boothId}/orders`);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "주문 목록을 불러오지 못했습니다.");
  }

  const data = await res.json();
  return data.orders ?? [];
}

export function useOrders(boothId: string) {
  const queryClient = useQueryClient();
  const key = ordersKey(boothId);

  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: key,
    queryFn: () => fetchOrders(boothId),
  });

  const cancelMutation = useMutation({
    mutationFn: async ({
      orderId,
      orderItemId,
      quantity,
    }: {
      orderId: string;
      orderItemId: string;
      quantity: number;
    }) => {
      const res = await fetch(`/api/booth/${boothId}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId, quantity }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "취소 처리에 실패했습니다.");
      }
    },
    onMutate: async ({ orderId, orderItemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<Order[]>(key) ?? [];

      queryClient.setQueryData<Order[]>(key, (current) =>
        (current ?? []).map((order) =>
          order.id !== orderId
            ? order
            : {
              ...order,
              items: order.items.map((item) =>
                item.id === orderItemId
                  ? { ...item, cancelledQuantity: item.cancelledQuantity + quantity }
                  : item
              ),
            }
        )
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) queryClient.setQueryData(key, ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },
  });

  async function cancelItem(orderId: string, orderItemId: string, quantity: number) {
    await cancelMutation.mutateAsync({ orderId, orderItemId, quantity });
  }

  return {
    orders: orders ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch: () => queryClient.invalidateQueries({ queryKey: key }),
    cancelItem,
  };
}