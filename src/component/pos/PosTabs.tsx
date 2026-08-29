"use client";

import { useState } from "react";
import { PosTabProvider, TabKey } from "./PosTabContext";

interface PosTabsProps {
  sellContent: React.ReactNode;
  requestsContent: React.ReactNode;
  prepaidContent: React.ReactNode;
  receiptContent: React.ReactNode;
}

export default function PosTabs({ sellContent, requestsContent, prepaidContent, receiptContent }: PosTabsProps) {
  const [tab, setTab] = useState<TabKey>("sell");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "sell", label: "작품 판매" },
    { key: "requests", label: "손님 주문" },
    { key: "prepaid", label: "선입금 수령" },
    { key: "receipt", label: "영수증" },
  ];

  return (
    <PosTabProvider value={{ tab, setTab }}>
      <div className="h-full">
        <div className="flex border-b border-zinc-800 px-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium ${tab === t.key ? "border-b-2 border-white text-white" : "text-zinc-500"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={tab === "sell" ? "block h-[calc(100%-49px)]" : "hidden"}>
          {sellContent}
        </div>
        <div className={tab === "requests" ? "block h-[calc(100%-49px)]" : "hidden"}>
          {requestsContent}
        </div>
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