// src/app/[eventId]/booths/[boothId]/manage/prepaid/page.tsx (변경된 부분)
"use client";

import { usePrepaidRows } from "@/src/hooks/usePrepaidRows";
import { use, useState, useRef } from "react";
import * as XLSX from "xlsx";

export default function Page({
  params,
}: {
  params: Promise<{ eventId: string; boothId: string }>;
}) {
  const { boothId } = use(params);

  const { rows, headers, isLoading, pendingIds, toggleRow, setRows, setHeaders } =
    usePrepaidRows(boothId);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (rows.length > 0) {
      setPendingFile(file);
    } else {
      void uploadFile(file);
    }
  }

  async function uploadFile(file: File) {
    setIsUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
        defval: "",
      });

      if (data.length === 0) {
        alert("파일에 데이터가 없습니다.");
        return;
      }

      const res = await fetch(`/api/booth/${boothId}/prepaid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: data.map((cells) => ({ cells })) }),
      });

      if (!res.ok) {
        alert("업로드 중 오류가 발생했습니다.");
        return;
      }

      const saved: { rows: { id: string; row_data: Record<string, string>; checked: boolean }[] } =
        await res.json();
      const loaded = saved.rows.map((r) => ({
        id: r.id,
        cells: r.row_data,
        checked: r.checked,
      }));

      setRows(loaded);
      setHeaders(Object.keys(loaded[0].cells));
    } finally {
      setIsUploading(false);
      setPendingFile(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">선입금 등록</h1>
          <p className="mt-1 text-sm text-zinc-500">
            엑셀(.xlsx, .csv) 파일을 업로드하면 리스트로 변환됩니다. POS의 &quot;선입금
            수령&quot; 탭에서 바로 조회할 수 있습니다.
          </p>
        </div>
        <label className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200">
          {rows.length > 0 ? "다시 업로드" : "엑셀 업로드"}
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleSelectFile}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {isUploading && (
        <p className="mb-4 text-sm text-zinc-500">업로드 중...</p>
      )}

      {isLoading ? (
        <p className="text-sm text-zinc-500">불러오는 중...</p>
      ) : rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-500">
          아직 등록된 선입금 리스트가 없습니다.
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-zinc-500">
            총 {rows.length}건 · 수령 완료 {rows.filter((r) => r.checked).length}건
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-500">
                <th className="w-12 py-2">수령</th>
                {headers.map((h) => (
                  <th key={h} className="py-2 pr-4">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b border-zinc-900 ${row.checked ? "opacity-40" : ""
                    }`}
                >
                  <td className="py-2">
                    <input
                      type="checkbox"
                      checked={row.checked}
                      disabled={pendingIds.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      className="h-5 w-5 disabled:opacity-50"
                    />
                  </td>
                  {headers.map((h) => (
                    <td key={h} className="py-2 pr-4 text-zinc-300">
                      {row.cells[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-80 rounded-md bg-zinc-900 p-5">
            <p className="mb-1 text-sm font-medium text-white">
              기존 리스트를 덮어쓸까요?
            </p>
            <p className="mb-4 text-sm text-zinc-500">
              현재 등록된 {rows.length}건(체크 여부 포함)이 모두 삭제되고 새
              파일로 교체됩니다.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingFile(null)}
                className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
              >
                취소
              </button>
              <button
                onClick={() => {
                  const file = pendingFile;
                  setPendingFile(null);
                  if (file) void uploadFile(file);
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-500"
              >
                덮어쓰기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}