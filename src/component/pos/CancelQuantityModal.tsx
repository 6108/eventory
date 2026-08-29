"use client";

import { useState } from "react";
import { OrderItem } from "@/src/hooks/useOrders";
import Modal from "@/src/component/common/Modal";

interface CancelQuantityModalProps {
  item: OrderItem;
  onClose: () => void;
  onConfirm: (cancelQuantity: number) => Promise<void>;
}

export default function CancelQuantityModal({
  item,
  onClose,
  onConfirm,
}: CancelQuantityModalProps) {
  // 전체 주문 수량에서 이미 취소된 수량을 제외한
  // 현재 추가로 취소할 수 있는 수량
  const cancellableQuantity =
    item.quantity - item.cancelledQuantity;

  // 이번에 취소할 수량
  // 기본값은 취소 가능한 수량 전체
  const [cancelQuantity, setCancelQuantity] =
    useState(cancellableQuantity);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function decreaseQuantity() {
    setCancelQuantity((quantity) => Math.max(1, quantity - 1));
  }

  function increaseQuantity() {
    setCancelQuantity((quantity) =>
      Math.min(cancellableQuantity, quantity + 1)
    );
  }

  function handleQuantityChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const value = Number(event.target.value) || 1;

    setCancelQuantity(
      Math.min(cancellableQuantity, Math.max(1, value))
    );
  }

  async function handleConfirm() {
    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(cancelQuantity);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "취소 처리에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen onClose={onClose} maxWidth="xs">
      {/* 작품 정보 */}
      <div className="mb-4">
        <p className="text-sm font-medium text-white">
          {item.productName ?? item.productId}
        </p>

        {item.optionName && (
          <p className="mt-1 text-xs text-zinc-500">
            {item.optionName}
          </p>
        )}
      </div>

      {/* 취소 수량 안내 */}
      <div className="mb-4">
        <p className="text-sm text-zinc-300">
          취소할 수량을 선택해주세요.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          최대 {cancellableQuantity}개까지 취소할 수 있습니다.
        </p>
      </div>

      {/* 수량 선택 */}
      <div className="mb-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={decreaseQuantity}
          disabled={isSubmitting || cancelQuantity <= 1}
          className="h-8 w-8 rounded-md border border-zinc-700 text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          -
        </button>

        <input
          type="number"
          min={1}
          max={cancellableQuantity}
          value={cancelQuantity}
          onChange={handleQuantityChange}
          disabled={isSubmitting}
          className="h-8 w-16 rounded-md border border-zinc-700 bg-transparent text-center text-white outline-none focus:border-zinc-500 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={increaseQuantity}
          disabled={
            isSubmitting ||
            cancelQuantity >= cancellableQuantity
          }
          className="h-8 w-8 rounded-md border border-zinc-700 text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          +
        </button>
      </div>

      {/* 에러 */}
      {error && (
        <p className="mb-3 text-xs text-red-500">
          {error}
        </p>
      )}

      {/* 버튼 */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-md px-3 py-1.5 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
        >
          닫기
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "처리 중..." : "취소 및 환불"}
        </button>
      </div>
    </Modal>
  );
}