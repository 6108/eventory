// src/component/cart/CartItemRow.tsx
"use client";

import Image from "next/image";
import { useCartStore } from "@/src/store/cartStore";
import type { CartItem } from "@/src/types/cart";

interface CartItemRowProps {
  item: CartItem;
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const increment = useCartStore((s) => s.increment);
  const decrement = useCartStore((s) => s.decrement);
  const removeItem = useCartStore((s) => s.removeItem);

  // 구매 제한만 하드 캡으로 버튼 비활성화. 재고는 담기 단계에서 체크하지 않음
  const isMaxedByLimit =
    item.purchaseLimit != null && item.quantity >= item.purchaseLimit;

  return (
    <li className="flex items-center gap-3 rounded border border-zinc-800 p-3">
      {item.image ? (
        <Image
          src={item.image}
          alt={item.productName}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="h-14 w-14 shrink-0 rounded bg-zinc-800" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white">{item.productName}</p>
        {item.optionName && (
          <p className="truncate text-xs text-zinc-400">{item.optionName}</p>
        )}
        {item.purchaseLimit != null && (
          <p className="whitespace-nowrap text-[11px] font-medium text-zinc-400">
            (1인 {item.purchaseLimit}개 한정)
          </p>
        )}
        <p className="text-sm text-primary">{item.price.toLocaleString()}원</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => decrement(item.productId, item.optionId)}
          className="h-7 w-7 rounded bg-zinc-800 text-white"
        >
          −
        </button>
        <span className="w-5 text-center text-sm text-white">
          {item.quantity}
        </span>
        <button
          onClick={() => increment(item.productId, item.optionId)}
          disabled={isMaxedByLimit}
          aria-disabled={isMaxedByLimit}
          className="h-7 w-7 rounded bg-zinc-800 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>

      <button
        onClick={() => removeItem(item.productId, item.optionId)}
        className="shrink-0 text-xs text-red-400"
      >
        삭제
      </button>
    </li>
  );
}