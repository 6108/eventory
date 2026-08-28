"use client";

import { usePrepaidRows } from "@/src/hooks/usePrepaidRows";


interface Props {
  boothId: string;
}

export default function PrepaidChecklist({ boothId }: Props) {
  const { rows, headers, isLoading, pendingIds, toggleRow } = usePrepaidRows(boothId);

  if (isLoading) {
    return <div className="p-6 text-sm text-zinc-500">불러오는 중...</div>;
  }

  if (rows.length === 0) {
    return (
      <div className="p-6 text-sm text-zinc-500">
        등록된 선입금 리스트가 없습니다. 관리 페이지에서 엑셀을 업로드해주세요.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4">
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
                <td key={h} className="py-2 pr-4">
                  {row.cells[h]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}