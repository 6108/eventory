// src/component/pos/PosTabContext.tsx
"use client";

import { createContext, useContext } from "react";

export type TabKey = "sell" | "requests" | "prepaid" | "receipt";

type PosTabContextValue = {
  tab: TabKey;
  setTab: (tab: TabKey) => void;
};

const PosTabContext = createContext<PosTabContextValue | null>(null);

export const PosTabProvider = PosTabContext.Provider;

// 자신이 속한 탭이 지금 활성 탭인지 확인 (폴링 등을 켜고 끄는 데 사용)
export default function useIsActiveTab(tab: TabKey) {
  const ctx = useContext(PosTabContext);
  if (!ctx) {
    throw new Error("useIsActiveTab은 PosTabProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx.tab === tab;
}

// 다른 탭으로 전환할 때 사용 (예: 손님 주문 확인 후 판매 탭으로 자동 이동)
export function usePosTabSwitch() {
  const ctx = useContext(PosTabContext);
  if (!ctx) {
    throw new Error("usePosTabSwitch는 PosTabProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx.setTab;
}