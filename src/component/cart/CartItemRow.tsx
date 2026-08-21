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

  return (
    <li className="flex items-center gap-3 rounded border border-zinc-800 p-3">
      {item.image ? (
        <Image
          src={item.image}
          alt={item.name}
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="h-14 w-14 shrink-0 rounded bg-zinc-800" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white">{item.name}</p>
        {item.optionName && (
          <p className="truncate text-xs text-zinc-400">{item.optionName}</p>
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
          className="h-7 w-7 rounded bg-zinc-800 text-white"
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
