"use client";

import { useState } from "react";
import { Order, OrderItem } from "@/src/hooks/useOrders";
import { formatDateTime } from "@/src/lib/format";
import { Modal } from "@/src/component/common/Modal";
import CancelQuantityModal from "./CancelQuantityModal";

interface Props {
  order: Order;
  onClose: () => void;
  onCancelItem: (itemId: string, quantity: number) => Promise<void>;
}

export default function ReceiptDetailModal({ order, onClose, onCancelItem }: Props) {
  const [cancelTarget, setCancelTarget] = useState<OrderItem | null>(null);
  const isCancelled = order.status === "cancelled";
  const items = order.items ?? [];

  return (
    <>
      <Modal isOpen onClose={onClose} maxWidth="md">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base font-medium text-white">
                {isCancelled ? "취소된 영수증" : "영수증"}
              </p>
              {isCancelled && <span className="text-xs text-red-500">취소됨</span>}
            </div>
            <p className="mt-1 text-xs text-zinc-500">{formatDateTime(order.createdAt)}</p>
            <p className="mt-1 text-xs text-zinc-600">주문번호 #{order.id.slice(0, 8)}</p>
          </div>

          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-white">
            닫기
          </button>
        </div>

        <ul className="mb-5 space-y-4">
          {items.map((item) => {
            const remaining = item.quantity - item.cancelledQuantity;
            const fullyCancelled = remaining === 0;
            const itemTotal = item.unitPrice * remaining;
            const cancelledTotal = item.unitPrice * item.cancelledQuantity;

            return (
              <li
                key={item.id}
                className={`border-b border-zinc-800 pb-4 last:border-0 ${fullyCancelled ? "opacity-40" : ""
                  }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200">
                      {item.productName ?? item.productId}
                    </p>
                    {item.optionName && (
                      <p className="mt-0.5 text-xs text-zinc-500">{item.optionName}</p>
                    )}
                  </div>

                  {!fullyCancelled && !isCancelled && (
                    <button
                      onClick={() => setCancelTarget(item)}
                      className="shrink-0 rounded-md border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:border-red-500 hover:text-red-500"
                    >
                      취소
                    </button>
                  )}
                </div>

                <div className="mt-2 flex items-end justify-between">
                  <div className="text-xs text-zinc-500">
                    <p>
                      {item.unitPrice.toLocaleString()}원 × {item.quantity}개
                    </p>
                    {item.cancelledQuantity > 0 && (
                      <p className="mt-1 text-red-500">
                        {item.cancelledQuantity}개 취소됨 · {cancelledTotal.toLocaleString()}원
                      </p>
                    )}
                  </div>

                  <p className="text-sm font-medium text-white">
                    {itemTotal.toLocaleString()}원
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-zinc-800 pt-4">
          <div className="mb-2 flex justify-between text-xs text-zinc-500">
            <span>상품</span>
            <span>{order.totalQuantity}개</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-400">합계</span>
            <span
              className={`text-lg font-semibold ${isCancelled ? "text-zinc-600 line-through" : "text-white"
                }`}
            >
              {order.totalAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      </Modal>

      {cancelTarget && (
        <CancelQuantityModal
          item={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={(quantity) => onCancelItem(cancelTarget.id, quantity)}
        />
      )}
    </>
  );
}