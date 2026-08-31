// src/component/cart/CartBoothGroup.tsx
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { useCartStore } from "@/src/store/cartStore";
import { useAuth } from "@/src/hooks/useAuth";
import { useRequireLogin } from "@/src/hooks/useRequireLogin";
import type { CartGroup } from "@/src/types/cart";
import CartItemRow from "./CartItemRow";

interface CartBoothGroupProps {
  group: CartGroup;
}

export default function CartBoothGroup({ group }: CartBoothGroupProps) {
  const clearBooth = useCartStore((s) => s.clearBooth);
  const markBoothSent = useCartStore((s) => s.markBoothSent);
  const sentAt = useCartStore((s) => s.sentBoothIds[group.boothId]);
  const { user } = useAuth();
  const requireLogin = useRequireLogin();
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);

  async function handleSendRequest() {
    if (!user) {
      requireLogin("주문 보내기는 로그인 후 이용할 수 있습니다.");
      return;
    }

    if (sentAt) {
      toast("이미 전송한 내용과 동일합니다.", { icon: "ℹ️" });
      return;
    }

    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);

    try {
      const res = await fetch(`/api/booth/${group.boothId}/order-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: group.items.map((item) => ({
            productId: item.productId,
            optionId: item.optionId,
            productName: item.productName,
            optionName: item.optionName,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "주문 보내기에 실패했습니다.");
      }

      toast.success("주문 요청을 보냈습니다. 부스 앞에서 닉네임을 말씀해주세요!");
      markBoothSent(group.boothId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "주문 보내기에 실패했습니다.");
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-zinc-800 p-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/${eventId}/booths/${group.boothId}`}
          className="flex min-w-0 items-center gap-1 text-sm font-medium text-white hover:underline"
        >
          <span className="shrink-0 text-zinc-400">[{group.boothNumber}]</span>
          <span className="min-w-0 truncate">{group.boothName}</span>
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

      <button
        type="button"
        onClick={handleSendRequest}
        disabled={sending || Boolean(sentAt)}
        className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {sending ? "보내는 중..." : sentAt ? "전송 완료" : "부스로 목록 전송하기"}
      </button>

      {sentAt && (
        <p className="text-center text-xs text-primary">
          요청을 보냈습니다. 담긴 내용을 바꾸면 다시 보낼 수 있습니다.
        </p>
      )}
    </div>
  );
}