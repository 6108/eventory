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
  // 행별로 PATCH 요청이 진행 중인지 (연타/중복 클릭 방지용)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/booth/${boothId}/prepaid`)
      .then((res) => res.json())
      .then((data: { rows?: PrepaidRowResponse[] }) => {
        if (cancelled) return;

        if (!data.rows?.length) {
          setIsLoading(false);
          return;
        }

        const loaded: Row[] = data.rows.map((r) => ({
          id: r.id,
          cells: r.row_data,
          checked: r.checked,
        }));
        setRows(loaded);
        setHeaders(Object.keys(loaded[0].cells));
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [boothId]);

  const toggleRow = useCallback(
    async (id: string) => {
      // 이미 처리 중인 행이면 중복 요청 무시
      setPendingIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      let prevRows: Row[] = [];
      let nextChecked = false;

      setRows((current) => {
        prevRows = current;
        return current.map((row) => {
          if (row.id !== id) return row;
          nextChecked = !row.checked;
          return { ...row, checked: nextChecked };
        });
      });

      try {
        const res = await fetch(`/api/booth/${boothId}/prepaid/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checked: nextChecked }),
        });
        if (!res.ok) setRows(prevRows);
      } catch {
        setRows(prevRows);
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [boothId]
  );

  return { rows, headers, isLoading, pendingIds, toggleRow, setRows, setHeaders };
}