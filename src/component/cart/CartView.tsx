// src/component/cart/CartView.tsx
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/src/store/cartStore";
import { useHasMounted } from "@/src/hooks/useHasMounted";
import CartBoothGroup from "./CartBoothGroup";
import Link from "next/link";
import { EVENT_ID as eventId } from "@/src/constants/event";
import { useConfirmModalStore } from "@/src/store/confirmModalStore";


export default function CartView() {
  const hasMounted = useHasMounted();

  const items = useCartStore((s) => s.items);
  const groupedByBooth = useCartStore((s) => s.groupedByBooth);
  const clearAll = useCartStore((s) => s.clearAll);
  const syncLimits = useCartStore((s) => s.syncLimits);

  const openConfirmModal = useConfirmModalStore((s) => s.openConfirmModal);

  // 장바구니 화면 진입 시, 담긴 상품들의 구매제한/재고를 최신 값으로 동기화.
  // 작가가 그 사이 구매제한을 새로 걸거나 바꿔도 반영되게 하기 위함 (QA 2-4 관련)
  useEffect(() => {
    if (!hasMounted || items.length === 0) return;

    const productIds = [...new Set(items.map((item) => item.productId))];

    fetch(`/api/products/limits?ids=${productIds.join(",")}`)
      .then((res) => res.json())
      .then((data: {
        limits: {
          productId: string;
          optionId: string | null;
          purchaseLimit: number | null;
          remainingQuantity: number | null;
        }[];
      }) => {
        syncLimits(data.limits);
      })
      .catch((err) => {
        // 동기화 실패해도 장바구니 자체는 그대로 보여줌 (전송 시점에 서버가 최종 검증)
        console.error("구매제한 동기화 실패:", err);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted]); // 진입 시 1회만 동기화

  if (!hasMounted) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <h1 className="text-xl font-semibold text-white">구매할 것</h1>
        <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
          불러오는 중...
        </div>
      </div>
    );
  }

  const groups = groupedByBooth();

  const totalQuantity = groups.reduce((sum, g) => sum + g.totalQuantity, 0);
  const totalAmount = groups.reduce((sum, g) => sum + g.totalAmount, 0);

  function handleClearAll() {
    openConfirmModal({
      title: "전체 비우기",
      message: "담아둔 항목을 모두 삭제하시겠습니까?",
      confirmText: "삭제",
      cancelText: "취소",
      onConfirm: () => clearAll(),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">구매할 것</h1>

        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-zinc-500 hover:text-red-400"
          >
            전체 비우기
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
          <Link
            href={`/${eventId}/products`}
          >
            <p className="text-sm font-medium text-primary">
              갖고싶은 회지와 굿즈 탐색하기 &gt;
            </p>

          </Link>
        </div>

      ) : (
        <>
          <p className="text-center text-xs leading-5 text-zinc-500">
            구매할 작품을 미리 담아서 전송하면, 부스에서 닉네임으로 목록을 확인할 수 있습니다.
            <br />
            실제 구매와 재고 확인은 부스에서 진행됩니다.
          </p>

          <div className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900 px-4 py-3">
            <span className="text-sm text-zinc-400">
              전체 합계 ({totalQuantity}개)
            </span>
            <span className="text-lg font-semibold text-white">
              {totalAmount.toLocaleString()}원
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {groups.map((group) => (
              <CartBoothGroup key={group.boothId} group={group} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}