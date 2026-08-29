"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { OrderRequest } from "../types/request";
import { ReceiptOrder } from "../types/order";


interface MyOrderRequestRow {
  id: string;
  booth_id: string;
  customer_id: string;
  status: OrderRequest["status"];
  order_id: string | null;
  created_at: string;
  updated_at: string;

  booths?: {
    booth_name: string | null;
  } | null;

  order_request_items?: {
    id: string;
    order_request_id: string;
    product_id: string;
    option_id: string | null;
    product_name: string;
    option_name: string | null;
    quantity: number;
  }[];

  // order_id가 생긴 요청이면 실제 결제 영수증(orders)이 함께 내려옴.
  orders?: {
    id: string;
    total_amount: number;
    total_quantity: number;
    status: ReceiptOrder["status"];
    created_at: string;
    order_items?: {
      product_name: string;
      option_name: string | null;
      unit_price: number;
      quantity: number;
      subtotal: number;
    }[];
  } | null;
}

const myOrderRequestsKey = ["myOrderRequests"] as const;

function mapRequest(
  request: MyOrderRequestRow
): OrderRequest {
  const order = request.orders;

  return {
    id: request.id,
    boothId: request.booth_id,
    customerId: request.customer_id,

    // 이 API에서는 손님 닉네임을 사용하지 않으므로 빈 문자열.
    // 필요하면 API에서 customer nickname을 같이 내려줄 수 있음.
    customerNickname: "",

    boothName: request.booths?.booth_name ?? null,

    items: (request.order_request_items ?? []).map(
      (item) => ({
        id: item.id,
        orderRequestId: item.order_request_id,
        productId: item.product_id,
        optionId: item.option_id,
        productName: item.product_name,
        optionName: item.option_name,
        quantity: item.quantity,
      })
    ),

    status: request.status,
    orderId: request.order_id,

    // 구매 이력(order_id가 생긴 요청)은 무조건 영수증 데이터를 채워서 내려준다.
    order: order
      ? {
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
      }
      : null,

    createdAt: request.created_at,
    updatedAt: request.updated_at,
  };
}

async function fetchMyOrderRequests(): Promise<OrderRequest[]> {
  const res = await fetch("/api/my/order-requests");

  const data: {
    requests?: MyOrderRequestRow[];
    error?: string;
  } = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error ?? "주문내역을 불러오지 못했습니다."
    );
  }

  return (data.requests ?? []).map(mapRequest);
}

export function useMyOrderRequests() {
  const queryClient = useQueryClient();

  const {
    data: requests,
    isLoading,
  } = useQuery({
    queryKey: myOrderRequestsKey,
    queryFn: fetchMyOrderRequests,
  });

  const cancelMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch(
        `/api/order-requests/${requestId}/cancel`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        throw new Error(
          data.error ?? "취소에 실패했습니다."
        );
      }
    },

    onMutate: async (requestId) => {
      await queryClient.cancelQueries({
        queryKey: myOrderRequestsKey,
      });

      const previous =
        queryClient.getQueryData<OrderRequest[]>(
          myOrderRequestsKey
        ) ?? [];

      queryClient.setQueryData<OrderRequest[]>(
        myOrderRequestsKey,
        previous.map((request) =>
          request.id === requestId
            ? {
              ...request,
              status: "cancelled",
            }
            : request
        )
      );

      return { previous };
    },

    onError: (_error, _requestId, context) => {
      if (context) {
        queryClient.setQueryData(
          myOrderRequestsKey,
          context.previous
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: myOrderRequestsKey,
      });
    },
  });

  async function cancelRequest(requestId: string) {
    await cancelMutation.mutateAsync(requestId);
  }

  const pendingRequestId = cancelMutation.isPending
    ? cancelMutation.variables ?? null
    : null;

  return {
    requests: requests ?? [],
    isLoading,
    pendingRequestId,
    cancelRequest,

    refetch: () =>
      queryClient.invalidateQueries({
        queryKey: myOrderRequestsKey,
      }),
  };
}