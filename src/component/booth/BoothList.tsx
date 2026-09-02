"use client";

import { useState } from "react";
import BoothListItem from "@/src/component/booth/BoothListItem";
import { Booth } from "@/src/types/booth";

export default function BoothList({
  booths,
}: {
  booths: Booth[];
}) {
  const [category, setCategory] = useState<
    "ALL" | "ADULT" | "GENERAL"
  >("ALL");

  const filteredBooths = booths
    .filter((booth) => {
      if (category === "ALL") return true;
      return booth.category === category;
    })
    .sort((a, b) => {
      const boothOrder = "MATE";

      const groupA = boothOrder.indexOf(a.boothNumber.charAt(0));
      const groupB = boothOrder.indexOf(b.boothNumber.charAt(0));

      if (groupA !== groupB) {
        return groupA - groupB;
      }

      return a.boothNumber.localeCompare(
        b.boothNumber,
        undefined,
        { numeric: true }
      );
    });

  return (
    <div className="flex flex-col md:w-1/2 relative">
      <div className="sticky top-14 z-10 bg-zinc-950">
        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value as "ALL" | "ADULT" | "GENERAL"
            )
          }
          className="w-full ml-auto rounded p-3 py-2 bg-primary/70 text-white mb-4"
        >
          <option value="ALL">전체</option>
          <option value="GENERAL">일반</option>
          <option value="ADULT">성인</option>
        </select>

        <div className="grid grid-cols-[4rem_minmax(0,1fr)_5rem_3.5rem] items-center py-2 font-medium sm:grid-cols-[4rem_minmax(0,1fr)_6rem_5rem]">
          <span className="text-center">부스번호</span>
          <span className="px-2 text-left">부스명</span>
          <span className="px-1 text-center">작가</span>
          <span className="text-center">구분</span>
        </div>
      </div>

      {filteredBooths.map((booth) => (
        <BoothListItem
          key={booth.id}
          boothInfo={booth}
        />
      ))}
    </div>
  );
}