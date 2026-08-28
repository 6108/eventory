// src/hooks/useMyOrderRequests.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MyOrderRequest } from "../types/request";

// Supabase에서 그대로 내려오는 raw 응답 형태 (snake_case)
interface MyOrderRequestRow {
  id: string;
  booth_id: string;
  status: MyOrderRequest["status"];
  created_at: string;
  updated_at: string;
  booths?: { booth_name: string | null } | null;
  order_request_items?: {
    id: string;
    order_request_id: string;
    product_id: string;
    option_id: string | null;
    product_name: string;
    option_name: string | null;
    quantity: number;
  }[];
  orders?: {
    id: string;
    total_amount: number;
    total_quantity: number;
    status: string;
    created_at: string;
  } | null;
}

const myOrderRequestsKey = ["myOrderRequests"] as const;

function mapRequest(r: MyOrderRequestRow): MyOrderRequest {
  return {
    id: r.id,
    boothId: r.booth_id,
    items: (r.order_request_items ?? []).map((item) => ({
      id: item.id,
      orderRequestId: item.order_request_id,
      productId: item.product_id,
      optionId: item.option_id,
      productName: item.product_name,
      optionName: item.option_name,
      quantity: item.quantity,
    })),
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    boothName: r.booths?.booth_name ?? null,
    order: r.orders
      ? {
        id: r.orders.id,
        totalAmount: r.orders.total_amount,
        totalQuantity: r.orders.total_quantity,
        status: r.orders.status,
        createdAt: r.orders.created_at,
      }
      : null,
  };
}

async function fetchMyOrderRequests(): Promise<MyOrderRequest[]> {
  const res = await fetch("/api/my/order-requests");
  const data: { requests?: MyOrderRequestRow[] } = await res.json();
  return (data.requests ?? []).map(mapRequest);
}

export function useMyOrderRequests() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery({
    queryKey: myOrderRequestsKey,
    queryFn: fetchMyOrderRequests,
  });

  const cancelMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(`/api/order-requests/${requestId}/cancel`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "취소에 실패했습니다.");
      }
    },
    onMutate: async (requestId) => {
      await queryClient.cancelQueries({ queryKey: myOrderRequestsKey });
      const prev = queryClient.getQueryData<MyOrderRequest[]>(myOrderRequestsKey) ?? [];

      queryClient.setQueryData<MyOrderRequest[]>(
        myOrderRequestsKey,
        prev.map((r) =>
          r.id === requestId ? { ...r, status: "cancelled" as const } : r
        )
      );

      return { prev };
    },
    onError: (_err, _requestId, ctx) => {
      if (ctx) queryClient.setQueryData(myOrderRequestsKey, ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: myOrderRequestsKey });
    },
  });

  async function cancelRequest(requestId: string) {
    await cancelMutation.mutateAsync(requestId);
  }

  // 어떤 요청이 현재 취소 처리 중인지 (연타/중복 클릭 방지용)
  const pendingRequestId = cancelMutation.isPending
    ? cancelMutation.variables ?? null
    : null;

  return {
    requests: requests ?? [],
    isLoading,
    pendingRequestId,
    refetch: () => queryClient.invalidateQueries({ queryKey: myOrderRequestsKey }),
    cancelRequest,
  };
}