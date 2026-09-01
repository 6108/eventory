// src/component/pos/MobileOrder.tsx
"use client";

import { useState } from "react";
import { useOrderStore } from "@/src/store/orderStore";
import OrderPanel from "./OrderPanel";

interface MobileOrderProps {
  boothId: string;
}

export default function MobileOrder({ boothId }: MobileOrderProps) {
  const [open, setOpen] = useState(false);

  const items = useOrderStore((s) => s.items);
  const totalAmount = useOrderStore((s) => s.totalAmount());

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <>
      {/* 하단 주문 목록 버튼 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between border-t border-zinc-800 bg-zinc-950 px-4 py-3 md:hidden"
      >
        <span className="text-sm text-white">
          주문 {totalQuantity}개
        </span>

        <span className="font-medium text-white">
          {totalAmount.toLocaleString()}원
        </span>
      </button>

      {/* Backdrop */}
      {open && (
        <button
          type="button"
          aria-label="주문 목록 닫기"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Bottom Sheet */}
      <div
        className={`fixed bottom-0 left-0 z-50 w-full rounded-t-2xl bg-zinc-950 p-4 transition-transform duration-200 lg:hidden ${open ? "translate-y-0" : "translate-y-full"
          }`}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-700" />

        <div className="flex max-h-[75vh] flex-col">
          <OrderPanel boothId={boothId} />
        </div>
      </div>
    </>
  );
}