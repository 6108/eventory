"use client";

import { useEffect, useState } from "react";
import BoothListItem from "@/src/component/booth/BoothListItem";
import Image from "next/image";
import { createClient } from "@/src/lib/supabase/client";
import { Booth } from "@/src/types/booth";

export default function Page() {
  const [category, setCategory] = useState<"ALL" | "ADULT" | "GENERAL">("ALL");
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBooths() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("booths")
        .select("id, booth_number, name, artist_names, category, description");

      if (error) {
        console.error("부스 목록 로드 실패:", error);
      } else if (data) {
        const mappedBooths: Booth[] = data.map((booth) => ({
          id: booth.id,
          boothNumber: booth.booth_number,
          boothName: booth.name,
          artistName: booth.artist_names?.join(", ") || "",
          artistIds: booth.artist_names ?? [],
          category: booth.category,
          description: booth.description,
        }));

        const boothOrder = "MATE";
        mappedBooths.sort((a, b) => {
          const groupA = boothOrder.indexOf(a.boothNumber.charAt(0));
          const groupB = boothOrder.indexOf(b.boothNumber.charAt(0));
          if (groupA !== groupB) return groupA - groupB;
          return a.boothNumber.localeCompare(b.boothNumber, undefined, { numeric: true });
        });

        setBooths(mappedBooths);
      }
      setLoading(false);
    }

    fetchBooths();
  }, []);

  const filteredBooths = booths.filter((booth) => {
    if (category === "ALL") return true;
    return booth.category === category;
  });

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <div className="w-full md:w-1/2 md:sticky md:top-14 md:self-start md:h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="w-full max-w-150 mx-auto">
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

        {/* 데이터 목록 */}
        {loading ? (
          <div className="p-8 text-center text-zinc-400">로딩 중...</div>
        ) : (
          filteredBooths.map((booth) => (
            <BoothListItem key={booth.id} boothInfo={booth} />
          ))
        )}
      </div>
    </div>
  );
}