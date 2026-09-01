"use client";

import { useState, useEffect, useCallback } from "react";

interface Row {
  id: string;
  cells: Record<string, string>;
  checked: boolean;
}

interface PrepaidRowResponse {
  id: string;
  row_data: Record<string, string>;
  checked: boolean;
}

export function usePrepaidRows(boothId: string) {
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  // 선입금 리스트 조회
  const fetchRows = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await fetch(`/api/booth/${boothId}/prepaid`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(
          `선입금 리스트 조회 실패 (status ${res.status})`
        );
      }

      const data = (await res.json()) as {
        rows?: PrepaidRowResponse[];
      };

      const loaded: Row[] = (data.rows ?? []).map((r) => ({
        id: r.id,
        cells: r.row_data,
        checked: r.checked,
      }));

      setRows(loaded);

      setHeaders(
        loaded.length > 0
          ? Object.keys(loaded[0].cells)
          : []
      );
    } catch (error) {
      console.error("선입금 리스트 조회 실패:", error);

      setRows([]);
      setHeaders([]);
    } finally {
      setIsLoading(false);
    }
  }, [boothId]);

  useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  // 수령 체크 / 해제
  const toggleRow = useCallback(
    async (id: string) => {
      const row = rows.find((r) => r.id === id);

      if (!row) return;

      // 같은 행에 대한 중복 요청 방지
      if (pendingIds.has(id)) return;

      const nextChecked = !row.checked;

      // 요청 중 표시
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      // 화면 먼저 변경
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, checked: nextChecked }
            : r
        )
      );

      try {
        const res = await fetch(
          `/api/booth/${boothId}/prepaid/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              checked: nextChecked,
            }),
          }
        );

        if (!res.ok) {
          throw new Error("체크 상태 변경 실패");
        }
      } catch (error) {
        console.error("선입금 체크 상태 변경 실패:", error);

        // 서버 저장 실패 시 원래 상태로 복구
        setRows((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, checked: row.checked }
              : r
          )
        );
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [boothId, rows, pendingIds]
  );

  return {
    rows,
    headers,
    isLoading,
    pendingIds,
    toggleRow,
    setRows,
    setHeaders,
    refresh: fetchRows,
  };
}