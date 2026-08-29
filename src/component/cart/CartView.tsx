// src/component/cart/CartView.tsx
"use client";

import { useCartStore } from "@/src/store/cartStore";
import { useHasMounted } from "@/src/hooks/useHasMounted";
import CartBoothGroup from "./CartBoothGroup";

export default function CartView() {
  const hasMounted = useHasMounted();

  // groupedByBooth()는 매 렌더마다 새 배열/객체를 만들기 때문에
  // items를 구독해서 리렌더 트리거만 받고, 그룹핑은 그때그때 계산해서 씀
  const items = useCartStore((s) => s.items);
  const groupedByBooth = useCartStore((s) => s.groupedByBooth);
  const clearAll = useCartStore((s) => s.clearAll);

  // 마운트 전에는 localStorage 값을 아직 몰라서 서버와 똑같이 "빈 상태"로만 렌더링
  // (여기서 실제 items를 그리면 서버 결과 [] 와 클라이언트 결과가 달라져 hydration 에러 발생)
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

  // 부스별 카드에 각각 들어있던 안내 문구를 상단에서 한 번만 보여주도록 통일
  // (부스가 여러 개면 카드마다 같은 문구가 반복돼서 위로 올림)
  const totalQuantity = groups.reduce((sum, g) => sum + g.totalQuantity, 0);
  const totalAmount = groups.reduce((sum, g) => sum + g.totalAmount, 0);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">구매할 것</h1>

        {items.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-zinc-500 hover:text-red-400"
          >
            전체 비우기
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
          갖고싶은 회지와 굿즈 목록을 만들어 봅시다
        </div>
      ) : (
        <>
          {/*
            주문 요청은 "대기열"이 아니라 부스러의 실수 방지를 돕는 편의 도구임을 명시.
            보냈다고 자동으로 결제/재고 반영되는 게 아니라는 점, 부스 앞에서 직접
            말로 확인해야 확실하다는 점을 오해 없이 전달하는 게 목적.
          */}
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