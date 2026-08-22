"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { OrderRequest } from "../types/request";

const POLL_INTERVAL_MS = 10000; // 손님이 실시간으로 보내는 걸 놓치지 않도록 짧게 폴링

export function useOrderRequests(boothId: string) {
  const [requests, setRequests] = useState<OrderRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const refetch = useCallback(() => {
    const id = ++requestIdRef.current;

    fetch(`/api/booth/${boothId}/order-requests`)
      .then((res) => res.json())
      .then((data) => {
        if (id !== requestIdRef.current) return;
        setRequests(data.requests ?? []);
      })
      .catch((err) => {
        console.error("주문 요청 조회 실패:", err);
      })
      .finally(() => {
        if (id !== requestIdRef.current) return;
        setIsLoading(false);
      });
  }, [boothId]);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refetch]);

  // status: "checked"(확인해서 POS에 담음) | "requested"(되돌리기) | "cancelled"
  async function setStatus(
    requestId: string,
    status: "requested" | "checked" | "cancelled"
  ) {
    const prev = requests;

    // 낙관적 업데이트: checked는 목록 정렬에서 아래로 내려가도록,
    // cancelled는 목록에서 바로 제거
    setRequests((current) =>
      status === "cancelled"
        ? current.filter((request) => request.id !== requestId)
        : current.map((request) =>
          request.id === requestId ? { ...request, status } : request
        )
    );

    try {
      const res = await fetch(
        `/api/booth/${boothId}/order-requests/${requestId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) throw new Error("상태 변경에 실패했습니다.");
    } catch (err) {
      setRequests(prev);
      throw err;
    }
  }

  return { requests, isLoading, refetch, setStatus };
}