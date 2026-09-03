"use client";

import Link from "next/link";
import { EVENT_ID as eventId } from "@/src/constants/event";
import type { CartGroup } from "@/src/types/cart";
import CartItemRow from "./CartItemRow";
import { useCartActions } from "@/src/hooks/useCartAction";

// ============================================================
// QA 2024: "부스로 목록 전송하기" (order_requests) 기능 비활성화.
//
// 원인: 손님이 보낸 목록을 부스러가 POS 카트에 선택해서 담은 뒤,
// 개별 항목만 삭제하고 다른 상품으로 결제를 완료하면, 삭제된 원래
// 요청과의 연결(checkedRequests)이 클라이언트에 그대로 남아있어
// 엉뚱한 손님에게 영수증이 가는 버그가 있었음
// (component/pos/OrderPanel.tsx, store/orderStore.ts 참고).
//
// 클라이언트 상태를 서버가 검증 없이 그대로 신뢰하는 구조라 유사한
// 종류의 문제가 더 있을 수 있다고 판단해서, 정식 대응(서버 측 대조
// 로직) 전까지는 기능 자체를 끔. 대신 손님은 "구매 완료" 개인 체크로
// 자기 기록만 남기고, 실제 판매/재고는 부스 POS에서만 처리됨.
//
// 되살릴 때 필요한 것들:
// - 아래 주석 처리된 handleSendRequest / "전송하기" 버튼
// - useCartStore의 markBoothSent, sentBoothIds
// - useAuth, useRequireLogin, useRef/useState(sending) import
// - /api/booth/[boothId]/order-requests 라우트 (그대로 남아있음)
// - component/pos/CustomerOrderRequests.tsx, PosTabs.tsx의 "담아둔 목록" 탭
// ============================================================

// import { useRef, useState } from "react";
// import toast from "react-hot-toast";
// import { useCartStore } from "@/src/store/cartStore";
// import { useAuth } from "@/src/hooks/useAuth";
// import { useRequireLogin } from "@/src/hooks/useRequireLogin";

interface CartBoothGroupProps {
  group: CartGroup;
}

export default function CartBoothGroup({
  group,
}: CartBoothGroupProps) {
  // const markBoothSent = useCartStore((s) => s.markBoothSent);
  // const sentAt = useCartStore(
  //   (s) => s.sentBoothIds[group.boothId]
  // );

  const { removeItem, togglePurchased } = useCartActions();
  // const { user } = useAuth();
  // const requireLogin = useRequireLogin();

  // const [sending, setSending] = useState(false);
  // const sendingRef = useRef(false);

  async function handleClearBooth() {
    for (const item of group.items) {
      removeItem(item.productId, item.optionId);
    }
  }

  // async function handleSendRequest() {
  //   if (!user) {
  //     requireLogin("주문 보내기는 로그인 후 이용할 수 있습니다.");
  //     return;
  //   }
  //
  //   if (sendingRef.current) return;
  //
  //   sendingRef.current = true;
  //   setSending(true);
  //
  //   try {
  //     const res = await fetch(
  //       `/api/booth/${group.boothId}/order-requests`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           items: group.items.map((item) => ({
  //             productId: item.productId,
  //             optionId: item.optionId,
  //             productName: item.productName,
  //             optionName: item.optionName,
  //             quantity: item.quantity,
  //           })),
  //         }),
  //       }
  //     );
  //
  //     if (!res.ok) {
  //       const data = await res.json().catch(() => ({}));
  //       throw new Error(
  //         data.error ?? "주문 보내기에 실패했습니다."
  //       );
  //     }
  //
  //     toast.success(
  //       "주문 요청을 보냈습니다. 부스 앞에서 닉네임을 말씀해주세요!"
  //     );
  //
  //     markBoothSent(group.boothId);
  //   } catch (err) {
  //     toast.error(
  //       err instanceof Error
  //         ? err.message
  //         : "주문 보내기에 실패했습니다."
  //     );
  //   } finally {
  //     sendingRef.current = false;
  //     setSending(false);
  //   }
  // }

  return (
    <div
      className={`flex flex-col gap-3 rounded border border-zinc-800 p-4 transition-opacity ${group.purchased ? "opacity-50" : ""
        }`}
    >
      <div className="flex items-center justify-between">
        <Link
          href={`/${eventId}/booths/${group.boothId}`}
          className="flex min-w-0 items-center gap-1 text-sm font-medium text-white hover:underline"
        >
          <span className="shrink-0 text-zinc-400">
            [{group.boothNumber}]
          </span>
          <span className={`min-w-0 truncate ${group.purchased ? "line-through" : ""}`}>
            {group.boothName}
          </span>
        </Link>

        <button
          onClick={handleClearBooth}
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
        기존 "부스로 목록 전송하기" 버튼 자리를 재사용.
        부스로 아무것도 전송하지 않는 순수 개인 기록용 토글 —
        누르면 이 부스 항목 전체가 "구매 완료"로 체크되고 카드가
        어두워진 채 목록 맨 아래로 내려간다 (store/cartStore.ts의
        groupedByBooth 정렬 로직 참고). 다시 누르면 해제.
      */}
      <button
        type="button"
        onClick={() => togglePurchased(group.boothId)}
        className={`w-full rounded px-4 py-2 text-sm font-medium disabled:opacity-50 ${group.purchased
            ? "border border-zinc-700 text-zinc-400"
            : "bg-primary text-white"
          }`}
      >
        {group.purchased ? "취소" : "구매 완료"}
      </button>

      {/* "부스로 목록 전송하기" 버튼 비활성화 — 파일 상단 QA 주석 참고 */}
      {/* <button
        type="button"
        onClick={handleSendRequest}
        disabled={sending || Boolean(sentAt)}
        className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {sending
          ? "보내는 중..."
          : sentAt
            ? "전송 완료"
            : "부스로 목록 전송하기"}
      </button>

      {sentAt && (
        <p className="text-center text-xs text-primary">
          요청을 보냈습니다. 담긴 내용을 바꾸면 다시 보낼 수 있습니다.
        </p>
      )} */}
    </div>
  );
}