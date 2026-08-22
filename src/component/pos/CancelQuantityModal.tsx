"use client";

import { useState } from "react";
import { OrderItem } from "@/src/hooks/useOrders";
import { Modal } from "@/src/component/common/Modal";

interface Props {
  item: OrderItem;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
}

export default function CancelQuantityModal({ item, onClose, onConfirm }: Props) {
  const remaining = item.quantity - item.cancelledQuantity;
  const [quantity, setQuantity] = useState(remaining);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirm(quantity);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "취소 처리에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} maxWidth="xs">
      <p className="mb-1 text-sm font-medium text-white">
        {item.productName ?? item.productId} 취소
      </p>
      {item.optionName && <p className="mb-1 text-xs text-zinc-500">{item.optionName}</p>}
      <p className="mb-4 text-sm text-zinc-500">최대 {remaining}개까지 취소 가능합니다.</p>

      <div className="mb-4 flex items-center justify-center gap-2">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="h-8 w-8 rounded-md border border-zinc-700 text-white hover:bg-zinc-800"
        >
          -
        </button>

        <input
          type="number"
          min={1}
          max={remaining}
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.min(remaining, Math.max(1, Number(e.target.value) || 1)))
          }
          className="h-8 w-16 rounded-md border border-zinc-700 bg-transparent text-center text-white"
        />

        <button
          onClick={() => setQuantity((q) => Math.min(remaining, q + 1))}
          className="h-8 w-8 rounded-md border border-zinc-700 text-white hover:bg-zinc-800"
        >
          +
        </button>
      </div>

      {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-white"
        >
          닫기
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-500 disabled:opacity-50"
        >
          {isSubmitting ? "처리 중..." : "환불 확정"}
        </button>
      </div>
    </Modal>
  );
}