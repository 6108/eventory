"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

// enabled=false면 아예 조회하지 않는다. POS 탭(PrepaidChecklist)에서
// "선입금 수령" 탭이 활성화되기 전까지는 요청을 보내지 않기 위함
// (관리 페이지의 선입금 업로드 화면 등 항상 필요한 곳은 기본값 true로 그대로 동작).
export function usePrepaidRows(boothId: string, enabled: boolean = true) {
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  // 행별로 PATCH 요청이 진행 중인지 (연타/중복 클릭 방지용)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  // 한 번 조회한 뒤에는(탭을 왔다갔다 해도) 다시 요청하지 않기 위한 플래그
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasFetchedRef.current) return;

    let cancelled = false;
    hasFetchedRef.current = true;
    setIsLoading(true);

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
  }, [boothId, enabled]);

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