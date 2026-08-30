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

// 다른 기기가 먼저 처리해서 서버가 409를 준 경우를 구분하기 위한 에러.
export class StatusConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StatusConflictError";
  }
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

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (res.status === 409) {
          throw new StatusConflictError(
            data.error ?? "이미 다른 기기에서 처리된 요청입니다."
          );
        }

        throw new Error(data.error ?? "상태 변경에 실패했습니다.");
      }
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
    // 409(다른 기기가 먼저 처리)일 때는 내가 갖고 있던 prev로 되돌려봐야
    // 이미 낡은 값이라 다시 어긋날 수 있으므로, 서버에서 최신 상태를
    // 새로 받아온다. 그 외 에러(네트워크 오류 등)는 낙관적 업데이트를
    // 되돌리는 게 맞다.
    onError: (err, _vars, ctx) => {
      if (err instanceof StatusConflictError) {
        queryClient.invalidateQueries({ queryKey: key });
        return;
      }
      if (ctx) queryClient.setQueryData(key, ctx.prev);
    },
  });

  async function setStatus(
    requestId: string,
    status: "requested" | "checked" | "cancelled"
  ) {
    await setStatusMutation.mutateAsync({ requestId, status });
  }

  // 어떤 요청 카드가 현재 서버 요청 중인지 (연타/중복 클릭 방지용)
  const pendingRequestId = setStatusMutation.isPending
    ? setStatusMutation.variables?.requestId ?? null
    : null;

  return {
    requests: requests ?? [],
    isLoading,
    pendingRequestId,
    refetch: () => queryClient.invalidateQueries({ queryKey: key }),
    setStatus,
  };
}