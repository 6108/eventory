"use client";

import { useState } from "react";
import { PosTabProvider, TabKey } from "./PosTabContext";
// QA: "담아둔 목록"(손님 주문 요청) 탭 비활성화 — CartBoothGroup.tsx 상단 주석 참고.
// 되살릴 때 아래 import와 폴링 로직을 다시 켤 것.
// import { useOrderRequests } from "@/src/hooks/useOrderRequests";

interface PosTabsProps {
  boothId: string;
  sellContent: React.ReactNode;
  requestsContent: React.ReactNode;
  prepaidContent: React.ReactNode;
  receiptContent: React.ReactNode;
}

export default function PosTabs({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- QA로 "담아둔 목록" 탭 비활성화되며 잠시 미사용, 되살릴 때 필요
  boothId,
  sellContent,
  // requestsContent, // QA: "담아둔 목록" 탭 비활성화로 미사용 — 아래 참고
  prepaidContent,
  receiptContent,
}: PosTabsProps) {
  const [tab, setTab] = useState<TabKey>("sell");

  // CustomerOrderRequests도 같은 쿼리 키(boothId, true)로 폴링하고 있어서
  // react-query가 캐시를 공유한다 — 여기서 따로 호출해도 네트워크 요청이
  // 중복되지 않는다. "담아둔 목록" 탭이 아닐 때도 새 주문이 왔는지 배지로 보여주기 위함.
  // const { requests } = useOrderRequests(boothId, true);
  // const pendingCount = requests.filter((r) => r.status === "requested").length;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "sell", label: "작품 판매" },
    // { key: "requests", label: "담아둔 목록" }, // QA: 기능 비활성화, 파일 상단 주석 참고
    { key: "prepaid", label: "선입금 수령" },
    { key: "receipt", label: "영수증" },
  ];

  return (
    <PosTabProvider value={{ tab, setTab }}>
      <div className="h-full mt-8">
        <div className="w-full fixed top-20 sm:top-14 left-0 z-10 flex whitespace-nowrap border-b border-zinc-800 bg-black px-2 sm:px-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative shrink-0 px-2 py-3 text-xs font-medium sm:px-4 sm:text-sm ${tab === t.key
                ? "border-b-2 border-white text-white"
                : "text-zinc-500"
                }`}
            >
              {t.label}
              {/* "담아둔 목록" 배지 비활성화 — 파일 상단 주석 참고 */}
              {/* {t.key === "requests" && pendingCount > 0 && (
                <span className="absolute right-0 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-white">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )} */}
            </button>
          ))}
        </div>

        <div className={tab === "sell" ? "block h-[calc(100%-49px)]" : "hidden"}>
          {sellContent}
        </div>

        {/* "담아둔 목록" 콘텐츠 비활성화 — 파일 상단 주석 참고 */}
        {/* <div className={tab === "requests" ? "block h-[calc(100%-49px)]" : "hidden"}>
          {requestsContent}
        </div> */}

        <div className={tab === "prepaid" ? "block h-[calc(100%-49px)]" : "hidden"}>
          {prepaidContent}
        </div>

        <div className={tab === "receipt" ? "block h-[calc(100%-49px)]" : "hidden"}>
          {receiptContent}
        </div>
      </div>
    </PosTabProvider>
  );
}