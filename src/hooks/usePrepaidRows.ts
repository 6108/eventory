"use client";

import { useState, useEffect } from "react";

interface Row {
  id: string;
  cells: Record<string, string>;
  checked: boolean;
}

export function usePrepaidRows(boothId: string) {
  const [rows, setRows] = useState<Row[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/booth/${boothId}/prepaid`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.rows?.length) {
          setIsLoading(false);
          return;
        }
        const loaded: Row[] = data.rows.map((r: any) => ({
          id: r.id,
          cells: r.row_data,
          checked: r.checked,
        }));
        setRows(loaded);
        setHeaders(Object.keys(loaded[0].cells));
        setIsLoading(false);
      });
  }, [boothId]);

  async function toggleRow(id: string) {
    const prev = rows;
    setRows((r) => r.map((row) => (row.id === id ? { ...row, checked: !row.checked } : row)));

    const target = prev.find((r) => r.id === id);
    const res = await fetch(`/api/booth/${boothId}/prepaid/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !target?.checked }),
    });
    if (!res.ok) setRows(prev);
  }

  return { rows, headers, isLoading, toggleRow, setRows, setHeaders };
}