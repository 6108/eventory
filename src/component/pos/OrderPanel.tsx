// src/component/pos/OrderPanel.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useOrderStore } from "@/src/store/orderStore";

interface OrderPanelProps {
  boothId: string;
}

export default function OrderPanel({ boothId }: OrderPanelProps) {
  const items = useOrderStore((s) => s.items);
  const increment = useOrderStore((s) => s.increment);
  const decrement = useOrderStore((s) => s.decrement);
  const removeItem = useOrderStore((s) => s.removeItem);
  const clear = useOrderStore((s) => s.clear);
  const totalAmount = useOrderStore((s) => s.totalAmount());

  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (items.length === 0) return;

    setLoading(true);

    try {
      const res = await fetch(`/api/booth/${boothId}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientTransactionId: crypto.randomUUID(),
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "결제 처리에 실패했습니다.");
        return;
      }

      toast.success("결제가 완료되었습니다.");
      clear();
    } catch {
      toast.error("결제 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-3 text-sm font-medium text-white">주문 목록</h2>

      {items.length === 0 ? (
        <p className="flex-1 text-sm text-zinc-500">
          상품을 선택해주세요.
        </p>
      ) : (
        <ul className="flex-1 overflow-y-auto flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex items-center justify-between gap-2 rounded border border-zinc-800 p-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{item.name}</p>
                <p className="text-xs text-zinc-400">
                  {item.price.toLocaleString()}원
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => decrement(item.productId)}
                  className="h-6 w-6 rounded bg-zinc-800 text-white"
                >
                  −
                </button>
                <span className="w-5 text-center text-sm text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => increment(item.productId)}
                  className="h-6 w-6 rounded bg-zinc-800 text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.productId)}
                className="text-xs text-red-400"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-zinc-800 pt-4">
        <div className="mb-3 flex justify-between text-sm">
          <span className="text-zinc-400">합계</span>
          <span className="font-medium text-white">
            {totalAmount.toLocaleString()}원
          </span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={items.length === 0 || loading}
          className="w-full rounded bg-primary px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "처리 중..." : "결제 완료"}
        </button>
      </div>
    </div>
  );
}