// src/component/cart/CartBoothGroup.tsx
"use client";

import Link from "next/link";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { useCartStore } from "@/src/store/cartStore";
import type { CartGroup } from "@/src/types/cart";
import CartItemRow from "./CartItemRow";

interface CartBoothGroupProps {
  group: CartGroup;
}

export default function CartBoothGroup({ group }: CartBoothGroupProps) {
  const clearBooth = useCartStore((s) => s.clearBooth);

  return (
    <div className="flex flex-col gap-3 rounded border border-zinc-800 p-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/${eventId}/booths/${group.boothId}`}
          className="text-sm font-medium text-white hover:underline"
        >
          {group.boothName}
        </Link>

        <button
          onClick={() => clearBooth(group.boothId)}
          className="text-xs text-zinc-500 hover:text-red-400"
        >
          전체 삭제
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {group.items.map((item) => (
          <CartItemRow
            key={`${item.productId}-${item.optionId ?? "default"}`}
            item={item}
          />
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
        <span className="text-sm text-zinc-400">
          합계 ({group.totalQuantity}개)
        </span>
        <span className="text-base font-semibold text-white">
          {group.totalAmount.toLocaleString()}원
        </span>
      </div>

      {/*
        TODO: 로그인 계정 기반 "주문서 전송" API가 아직 없음 (부스러 POS 쪽만 주문 생성 가능).
        고객이 직접 주문서를 보내는 기능이 붙기 전까지는,
        현장에서 이 화면을 부스러에게 보여주는 "화면 제시" 방식으로 안내.
      */}
      <button
        type="button"
        disabled
        title="준비 중인 기능입니다"
        className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-white opacity-40"
      >
        주문서 전송 (준비 중)
      </button>

      <p className="text-center text-xs text-zinc-500">
        지금은 부스 방문 시 이 화면을 부스러에게 직접 보여주세요.
      </p>
    </div>
  );
}
