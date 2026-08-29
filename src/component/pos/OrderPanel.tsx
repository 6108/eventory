"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useOrderStore } from "@/src/store/orderStore";

interface OrderPanelProps {
  boothId: string;
}

export default function OrderPanel({ boothId }: OrderPanelProps) {
  const router = useRouter();

  const items = useOrderStore((s) => s.items);
  const checkedRequests = useOrderStore((s) => s.checkedRequests);

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
      // 현재 판매에 포함된 주문 요청 ID
      const requestIds = Object.keys(checkedRequests);

      const res = await fetch(`/api/booth/${boothId}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientTransactionId: crypto.randomUUID(),
          items: items.map((i) => ({
            productId: i.productId,
            optionId: i.optionId,
            quantity: i.quantity,
          })),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error ?? "판매 등록에 실패했습니다.");
        return;
      }

      const orderId = result.orderId;

      // 주문 요청이 포함된 판매라면
      // 해당 요청들을 실제 영수증(order)과 연결
      if (requestIds.length > 0 && orderId) {
        const completeRes = await fetch(
          `/api/booth/${boothId}/order-requests/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              requestIds,
              orderId,
            }),
          }
        );

        const completeResult = await completeRes.json();

        if (!completeRes.ok || completeResult.success === false) {
          console.error(
            "주문 요청 연결 실패:",
            completeResult.error
          );

          // 판매 자체는 성공했으므로 판매 성공 메시지는 유지
          toast.success("판매가 등록되었습니다.");
          toast.error("주문 요청 연결에 실패했습니다.");
        } else {
          toast.success("판매가 등록되었습니다.");
        }
      } else {
        toast.success("판매가 등록되었습니다.");
      }

      clear();
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("판매 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <h2 className="mb-3 text-sm font-medium text-white">
        주문 목록
      </h2>

      {items.length === 0 ? (
        <p className="flex-1 text-sm text-zinc-500">
          작품을 선택해주세요.
        </p>
      ) : (
        <ul className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {items.map((item) => (
            <li
              key={`${item.productId}-${item.optionId ?? "default"}`}
              className="flex items-center justify-between gap-2 rounded border border-zinc-800 p-2"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">
                  {item.productName}
                </p>

                {item.optionName && (
                  <p className="truncate text-xs text-zinc-500">
                    {item.optionName}
                  </p>
                )}

                <p className="text-xs text-zinc-400">
                  {item.unitPrice.toLocaleString()}원
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    decrement(item.productId, item.optionId)
                  }
                  className="h-6 w-6 rounded bg-zinc-800 text-white"
                >
                  −
                </button>

                <span className="w-5 text-center text-sm text-white">
                  {item.quantity}
                </span>

                <button
                  onClick={() =>
                    increment(item.productId, item.optionId)
                  }
                  className="h-6 w-6 rounded bg-zinc-800 text-white"
                >
                  +
                </button>
              </div>

              <button
                onClick={() =>
                  removeItem(item.productId, item.optionId)
                }
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
          {loading ? "등록 중..." : "판매 완료"}
        </button>
      </div>
    </div>
  );
}