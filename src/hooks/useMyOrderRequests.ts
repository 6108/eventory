"use client";

import { useState, useEffect, useCallback } from "react";
import { MyOrderRequest } from "../types/request";

export function useMyOrderRequests() {
  const [requests, setRequests] = useState<MyOrderRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(() => {
    setIsLoading(true);

    fetch("/api/my/order-requests")
      .then((res) => res.json())
      .then((data) => {
        const mapped: MyOrderRequest[] = (data.requests ?? []).map((r: any) => ({
          id: r.id,
          boothId: r.booth_id,
          items: (r.order_request_items ?? []).map((item: any) => ({
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
        }));

        setRequests(mapped);
      })
      .catch((err) => console.error("내 주문내역 조회 실패:", err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function cancelRequest(requestId: string) {
    const prev = requests;

    setRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? { ...request, status: "cancelled" as const }
          : request
      )
    );

    try {
      const res = await fetch(`/api/order-requests/${requestId}/cancel`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "취소에 실패했습니다.");
      }

      refetch();
    } catch (err) {
      setRequests(prev);
      throw err;
    }
  }

  return { requests, isLoading, refetch, cancelRequest };
}