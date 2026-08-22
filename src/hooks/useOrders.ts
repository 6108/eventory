"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Order } from "@/src/types/order";

export type { Order, OrderItem } from "@/src/types/order";

export function useOrders(boothId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refetch = useCallback(() => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    fetch(`/api/booth/${boothId}/orders`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "주문 목록을 불러오지 못했습니다.");
        }
        return res.json();
      })
      .then((data) => {
        if (requestId !== requestIdRef.current) return;
        setOrders(data.orders ?? []);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        setError(err instanceof Error ? err.message : "주문 목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        setIsLoading(false);
      });
  }, [boothId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function cancelItem(orderId: string, orderItemId: string, quantity: number) {
    const prevOrders = orders;
    setOrders((current) =>
      current.map((order) =>
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

    try {
      const res = await fetch(`/api/booth/${boothId}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderItemId, quantity }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "취소 처리에 실패했습니다.");
      }

      refetch();
    } catch (err) {
      setOrders(prevOrders);
      throw err;
    }
  }

  return { orders, isLoading, error, refetch, cancelItem };
}