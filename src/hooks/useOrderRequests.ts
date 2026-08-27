"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderRequest } from "../types/request";

const POLL_INTERVAL_MS = 10000;

const requestsKey = (boothId: string) => ["orderRequests", boothId] as const;

async function fetchOrderRequests(boothId: string): Promise<OrderRequest[]> {
  const res = await fetch(`/api/booth/${boothId}/order-requests`);
  const data = await res.json();
  return data.requests ?? [];
}

export function useOrderRequests(boothId: string, enabled: boolean) {
  const queryClient = useQueryClient();
  const key = requestsKey(boothId);

  const { data: requests, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchOrderRequests(boothId),
    refetchInterval: enabled ? POLL_INTERVAL_MS : false, // 활성 탭일 때만 폴링
    enabled, // 활성 탭일 때만 애초에 조회
  });

  const setStatusMutation = useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: string;
      status: "requested" | "checked" | "cancelled";
    }) => {
      const res = await fetch(`/api/booth/${boothId}/order-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("상태 변경에 실패했습니다.");
    },
    onMutate: async ({ requestId, status }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<OrderRequest[]>(key) ?? [];

      queryClient.setQueryData<OrderRequest[]>(
        key,
        status === "cancelled"
          ? prev.filter((r) => r.id !== requestId)
          : prev.map((r) => (r.id === requestId ? { ...r, status } : r))
      );

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) queryClient.setQueryData(key, ctx.prev);
    },
  });

  async function setStatus(
    requestId: string,
    status: "requested" | "checked" | "cancelled"
  ) {
    await setStatusMutation.mutateAsync({ requestId, status });
  }

  return {
    requests: requests ?? [],
    isLoading,
    refetch: () => queryClient.invalidateQueries({ queryKey: key }),
    setStatus,
  };
}