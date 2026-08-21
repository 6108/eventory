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
        <h1 className="text-xl font-semibold text-white">장바구니</h1>
        <div className="rounded border border-zinc-800 p-6 text-center text-sm text-zinc-400">
          불러오는 중...
        </div>
      </div>
    );
  }

  const groups = groupedByBooth();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">장바구니</h1>

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
          장바구니가 비어있습니다.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <CartBoothGroup key={group.boothId} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
