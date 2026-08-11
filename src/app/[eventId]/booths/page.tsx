"use client";

import { useState } from "react";
import BoothListItem from "@/src/component/booth/BoothListItem";
import { mockBooths } from "@/src/mocks/booths";
import Image from "next/image";


export default function Page() {
  const [category, setCategory] = useState<"ALL" | "ADULT" | "GENERAL">("ALL");

  const filteredBooths = mockBooths.filter((booth) => {
    if (category === "ALL") return true;
    return booth.category === category;
  });

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="flex w-full md:w-1/2 items-center justify-center">
        <div className="w-full max-w-150">
          <Image
            src="/images/booths/booth_map.jpeg"
            alt="부스 배치도"
            width={1200}
            height={800}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>

      {/* 표 */}
      <div className="flex flex-col md:w-1/2 relative">
        <div className="sticky top-14 z-10 bg-zinc-950">
          {/* 표 필터 */}
          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as "ALL" | "ADULT" | "GENERAL")
            }
            className="w-full ml-auto rounded p-3 py-2 bg-primary/70 text-white mb-4"
          >
            <option value="ALL">전체</option>
            <option value="GENERAL">일반</option>
            <option value="ADULT">성인</option>
          </select>
          {/* 표 헤더 */}

          <div className="flex font-medium py-2">
            <span className="w-16 text-center">부스번호</span>
            <span className="flex-1 text-left px-2">부스명</span>
            <span className="w-24 text-left px-2">작가</span>
            <span className="w-20 text-center">구분</span>
          </div>
        </div>


        {/* 데이터 */}

        {filteredBooths.map((booth) => (
          <BoothListItem key={booth.id} boothInfo={booth} />
        ))}
      </div>
    </div>

  )
}
