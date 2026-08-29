"use client";

import { createContext, useContext } from "react";

type TabKey = "sell" | "requests" | "prepaid" | "receipt";

const PosTabContext = createContext<TabKey | null>(null);

export const PosTabProvider = PosTabContext.Provider;

// 자신이 속한 탭이 지금 활성 탭인지 확인 (폴링 등을 켜고 끄는 데 사용)
export default function useIsActiveTab(tab: TabKey) {
  const activeTab = useContext(PosTabContext);
  return activeTab === tab;
}