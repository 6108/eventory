// src/component/cart/CartBoothGroup.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { useCartStore } from "@/src/store/cartStore";
import { useAuth } from "@/src/hooks/useAuth";
import { useConfirmModalStore } from "@/src/store/confirmModalStore";
import type { CartGroup } from "@/src/types/cart";
import CartItemRow from "./CartItemRow";

interface CartBoothGroupProps {
  group: CartGroup;
}

export default function CartBoothGroup({ group }: CartBoothGroupProps) {
  const clearBooth = useCartStore((s) => s.clearBooth);
  const markBoothSent = useCartStore((s) => s.markBoothSent);
  const sentAt = useCartStore((s) => s.sentBoothIds[group.boothId]);
  const { user, login } = useAuth();
  const openConfirmModal = useConfirmModalStore((s) => s.openConfirmModal);
  const [sending, setSending] = useState(false);

  // 구매할 목록에 담는 건 로그인 없이도 가능하지만, 주문 요청을 보내려면
  // "누가 보냈는지" 부스러가 알아야 하니 이 시점에만 로그인을 요구함 (찜과 같은 패턴)
  async function handleSendRequest() {
    if (!user) {
      openConfirmModal({
        title: "로그인 하시겠습니까?",
        message: "주문 보내기는 로그인 후 이용 가능합니다.",
        confirmText: "로그인",
        cancelText: "취소",
        onConfirm: () => login(),
      });
      return;
    }

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
      setSending(false);
    }
  }

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

      <button
        type="button"
        onClick={handleSendRequest}
        disabled={sending}
        className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {sending ? "보내는 중..." : sentAt ? "다시 보내기" : "부스로 목록 전송하기"}
      </button>

      {sentAt && (
        <p className="text-center text-xs text-primary">
          요청을 보냈습니다. 내용을 바꾸면 버튼을 눌러 다시 보낼 수 있습니다.
        </p>
      )}
    </div>
  );
}