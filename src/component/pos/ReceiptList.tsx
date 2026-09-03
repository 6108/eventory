"use client";

import { useState } from "react";
import { useOrders, Order, OrderItem } from "@/src/hooks/useOrders";
import { formatOrderNumber } from "@/src/lib/format";
import useIsActiveTab from "./PosTabContext";

interface ReceiptListProps {
  boothId: string;
}

export default function ReceiptList({ boothId }: ReceiptListProps) {
  const isActive = useIsActiveTab("receipt");
  const { orders, isLoading, cancelItem } = useOrders(boothId, isActive);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (isLoading) {
    return <div className="p-6 text-sm text-zinc-500">불러오는 중...</div>;
  }

  if (orders.length === 0) {
    return <div className="p-6 text-sm text-zinc-500">오늘 주문 내역이 없습니다.</div>;
  }

  // 리스트 갱신 등으로 selectedOrder가 stale해지는 걸 방지
  const currentSelected = selectedOrder
    ? orders.find((o) => o.id === selectedOrder.id) ?? null
    : null;

  return (
    <div className="flex h-full">
      {/* 좌측: 주문 목록 */}
      <div
        className={`h-full overflow-y-auto md:w-95 md:shrink-0 md:border-r md:border-zinc-800 ${currentSelected ? "hidden md:block" : "block w-full"
          }`}
      >
        <ul className="divide-y divide-zinc-800 p-4">
          {orders.map((order, index) => {
            const isCancelled = order.status === "cancelled";
            const items = order.items ?? [];
            const isSelected = currentSelected?.id === order.id;
            const hasPartialCancel =
              !isCancelled && items.some((it) => it.cancelledQuantity > 0);

            return (
              <li key={order.id}>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className={`flex w-full items-start justify-between gap-3 py-3 text-left ${isSelected ? "md:bg-zinc-900" : "hover:bg-zinc-900"
                    }`}
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-sm font-medium text-white">
                        {formatTime(order.createdAt)}
                      </p>
                      <span className="text-xs text-zinc-600">
                        #{formatOrderNumber(order.id)}
                      </span>
                      {isCancelled && (
                        <span className="text-xs text-red-500">취소됨</span>
                      )}
                      {hasPartialCancel && (
                        <span className="text-xs text-amber-500">부분취소</span>
                      )}
                    </div>

                    {/* 옵션A: 품목별 요약 표시 (품명 + 옵션 + 나머지) */}
                    <div className="space-y-0.5">
                      {items.slice(0, 2).map((item) => (
                        <p
                          key={item.id}
                          className={`truncate text-xs ${item.cancelledQuantity >= item.quantity
                            ? "text-zinc-600 line-through"
                            : "text-zinc-400"
                            }`}
                        >
                          {item.productName ?? item.productId}
                          {item.optionName && ` (${item.optionName})`}
                          {" · "}
                          {item.quantity}개
                        </p>
                      ))}
                      {items.length > 2 && (
                        <p className="text-xs text-zinc-600">
                          외 {items.length - 2}종
                        </p>
                      )}
                      {items.length === 0 && (
                        <p className="text-xs text-zinc-500">작품 없음</p>
                      )}
                    </div>
                  </div>

                  <p
                    className={`shrink-0 text-sm font-medium ${isCancelled ? "text-zinc-600 line-through" : "text-white"
                      }`}
                  >
                    {order.totalAmount.toLocaleString()}원
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 우측: 상세 패널 (데스크탑) */}
      <div className="hidden h-full flex-1 overflow-y-auto md:block">
        {currentSelected ? (
          <ReceiptDetailPanel
            order={currentSelected}
            onClose={() => setSelectedOrder(null)}
            onCancelItem={async (itemId, quantity) => {
              await cancelItem(currentSelected.id, itemId, quantity);
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">
            주문을 선택하면 상세 내역이 표시됩니다.
          </div>
        )}
      </div>

      {/* 모바일: 모달 */}
      {currentSelected && (
        <div className="md:hidden">
          <ReceiptDetailModal
            order={currentSelected}
            onClose={() => setSelectedOrder(null)}
            onCancelItem={async (itemId, quantity) => {
              await cancelItem(currentSelected.id, itemId, quantity);
              setSelectedOrder(null);
            }}
          />
        </div>
      )}
    </div>
  );
}

/** 데스크탑용: 모달이 아닌 인라인 패널 */
function ReceiptDetailPanel({
  order,
  onClose,
  onCancelItem,
}: {
  order: Order;
  onClose: () => void;
  onCancelItem: (itemId: string, quantity: number) => Promise<void>;
}) {
  const [cancelTarget, setCancelTarget] = useState<OrderItem | null>(null);
  const isCancelled = order.status === "cancelled";
  const items = order.items ?? [];

  return (
    <div className="p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-base font-medium text-white">
              {isCancelled ? "취소된 영수증" : "영수증"}
            </p>
            {isCancelled && <span className="text-xs text-red-500">취소됨</span>}
          </div>
          <p className="mt-1 text-xs text-zinc-500">{formatDateTime(order.createdAt)}</p>
          <p className="mt-1 text-xs text-zinc-600">
            주문번호 {formatOrderNumber(order.id)}
          </p>
        </div>

        <button onClick={onClose} className="text-sm text-zinc-500 hover:text-white">
          닫기
        </button>
      </div>

      <ReceiptItemList items={items} isCancelled={isCancelled} onCancel={setCancelTarget} />
      <ReceiptTotal order={order} isCancelled={isCancelled} />

      {cancelTarget && (
        <CancelQuantityModal
          item={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={(quantity) => onCancelItem(cancelTarget.id, quantity)}
        />
      )}
    </div>
  );
}

/** 모바일용: 기존 모달 유지 */
function ReceiptDetailModal({
  order,
  onClose,
  onCancelItem,
}: {
  order: Order;
  onClose: () => void;
  onCancelItem: (itemId: string, quantity: number) => Promise<void>;
}) {
  const [cancelTarget, setCancelTarget] = useState<OrderItem | null>(null);
  const isCancelled = order.status === "cancelled";
  const items = order.items ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-zinc-900 p-5">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base font-medium text-white">
                {isCancelled ? "취소된 영수증" : "영수증"}
              </p>
              {isCancelled && <span className="text-xs text-red-500">취소됨</span>}
            </div>
            <p className="mt-1 text-xs text-zinc-500">{formatDateTime(order.createdAt)}</p>
            <p className="mt-1 text-xs text-zinc-600">
              주문번호 {formatOrderNumber(order.id)}
            </p>
          </div>

          <button onClick={onClose} className="text-sm text-zinc-500 hover:text-white">
            닫기
          </button>
        </div>

        <ReceiptItemList items={items} isCancelled={isCancelled} onCancel={setCancelTarget} />
        <ReceiptTotal order={order} isCancelled={isCancelled} />
      </div>

      {cancelTarget && (
        <CancelQuantityModal
          item={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onConfirm={(quantity) => onCancelItem(cancelTarget.id, quantity)}
        />
      )}
    </div>
  );
}

/** 패널/모달 공용 품목 리스트 */
function ReceiptItemList({
  items,
  isCancelled,
  onCancel,
}: {
  items: OrderItem[];
  isCancelled: boolean;
  onCancel: (item: OrderItem) => void;
}) {
  return (
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
                  onClick={() => onCancel(item)}
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
  );
}

/** 패널/모달 공용 합계 */
function ReceiptTotal({ order, isCancelled }: { order: Order; isCancelled: boolean }) {
  return (
    <div className="border-t border-zinc-800 pt-4">
      <div className="mb-2 flex justify-between text-xs text-zinc-500">
        <span>작품</span>
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
  );
}

function CancelQuantityModal({
  item,
  onClose,
  onConfirm,
}: {
  item: OrderItem;
  onClose: () => void;
  onConfirm: (quantity: number) => Promise<void>;
}) {
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-xs rounded-lg bg-zinc-900 p-5">
        <p className="mb-1 text-sm font-medium text-white">
          {item.productName ?? item.productId}
        </p>
        {item.optionName && <p className="mb-1 text-xs text-zinc-500">{item.optionName}</p>}
        <p className="mb-4 text-sm text-zinc-500">취소할 수량을 선택해주세요.</p>

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
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isSubmitting ? "처리 중..." : "환불"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}