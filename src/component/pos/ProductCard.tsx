"use client";

import { useMemo } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { useOrderStore } from "@/src/store/orderStore";
import { PosProduct, ProductOption } from "@/src/types/product";

export default function ProductCard({
  product,
}: {
  product: PosProduct;
}) {
  const addItem = useOrderStore((s) => s.addItem);

  // store의 items 배열(참조 안정적) 자체만 구독하고,
  // 옵션별 합산은 useMemo로 계산 (selector가 매번 새 객체를 만들면
  // zustand가 값이 바뀐 걸로 판단해 무한 리렌더가 발생함)
  const items = useOrderStore((s) => s.items);

  const quantityByOptionId = useMemo(() => {
    const map: Record<string, number> = {};

    for (const item of items) {
      if (item.productId !== product.id) continue;
      const key = item.optionId ?? "__none__";
      map[key] = (map[key] ?? 0) + item.quantity;
    }

    return map;
  }, [items, product.id]);

  const hasOptions = product.options.length > 0;

  // 옵션이 있으면 옵션 재고를 합산
  const totalRemaining = hasOptions
    ? product.options.reduce(
      (sum, option) => sum + (option.remainingQuantity ?? 0),
      0
    )
    : product.remainingQuantity;

  const totalQuantity = hasOptions
    ? product.options.reduce(
      (sum, option) => sum + (option.initialQuantity ?? 0),
      0
    )
    : product.initialQuantity;

  const isSoldOut = totalRemaining !== null && totalRemaining <= 0;

  // 담은 개수만큼 화면상 재고에서 즉시 차감해서 보여줌 (옵션 있으면 옵션별 합산, 없으면 단일)
  const totalAdded = Object.values(quantityByOptionId).reduce(
    (sum, q) => sum + q,
    0
  );
  const displayRemaining =
    totalRemaining === null
      ? null
      : Math.max(totalRemaining - totalAdded, 0);

  function handleAdd(option?: ProductOption) {
    const remainingQuantity = option
      ? option.remainingQuantity
      : product.remainingQuantity;

    if (remainingQuantity !== null && remainingQuantity <= 0) {
      toast.error("품절된 상품입니다.");
      return;
    }

    const optionId = option?.id ?? null;
    const unitPrice = option?.price ?? product.price;

    // 이미 담긴 수량 확인 (재고/구매제한은 "이미 담은 것 + 이번에 담을 것" 기준으로 판단해야 함)
    // 렌더링에 쓰는 값이 아니라 클릭 시점에만 필요한 값이라 훅으로 구독하지 않고
    // getState()로 그 순간의 최신 상태만 읽는다 (구독하면 다른 상품 담을 때도 이 카드가 리렌더됨)
    const orderItems = useOrderStore.getState().items;
    const existing = orderItems.find(
      (i) => i.productId === product.id && i.optionId === optionId
    );
    const currentQuantity = existing?.quantity ?? 0;
    const nextQuantity = currentQuantity + 1;

    if (
      remainingQuantity !== null &&
      nextQuantity > remainingQuantity
    ) {
      toast.error("재고 수량을 초과했습니다.");
      return;
    }

    if (
      product.purchaseLimit !== null &&
      nextQuantity > product.purchaseLimit
    ) {
      toast.error(
        `1인당 ${product.purchaseLimit}개까지 구매할 수 있습니다.`
      );
      return;
    }

    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      optionId,
      productName: product.name,
      optionName: option?.name ?? null,
      unitPrice,
      quantity: 1,
      cancelledQuantity: 0,
      subtotal: unitPrice,
    });
  }

  const cardClickable = !hasOptions && !isSoldOut;

  return (
    <div
      onClick={cardClickable ? () => handleAdd() : undefined}
      role={!hasOptions ? "button" : undefined}
      tabIndex={cardClickable ? 0 : undefined}
      onKeyDown={
        cardClickable
          ? (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleAdd();
            }
          }
          : undefined
      }
      className={`overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 ${isSoldOut ? "opacity-40" : ""
        } ${cardClickable ? "cursor-pointer hover:bg-zinc-800" : ""}`}
    >
      {/* 상품 이미지 */}
      <div className="relative aspect-square w-full bg-zinc-800">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            이미지 없음
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="p-3">
        <div className={hasOptions ? "mb-2" : ""}>
          <p className="text-sm font-medium text-white">{product.name}</p>

          {/* 총 수량 / 남은 수량 */}
          <p className="mt-1 text-xs text-zinc-400">
            {totalQuantity === null
              ? "제한없음"
              : `${totalQuantity}개 중 ${displayRemaining === null ? "∞" : `${displayRemaining}개`} 남음`}
          </p>
        </div>

        {/* 옵션 없는 상품: 카드 전체 클릭으로 담기 */}
        {!hasOptions && (
          <div className="mt-1 text-right">
            <span
              className={`text-sm font-medium ${isSoldOut ? "text-red-500" : "text-white"
                }`}
            >
              {isSoldOut ? "품절" : `${product.price.toLocaleString()}원`}
            </span>
          </div>
        )}

        {/* 옵션 있는 상품 */}
        {hasOptions && (
          <div className="space-y-1.5">
            {product.options.map((option) => {
              const soldOut =
                option.remainingQuantity !== null &&
                option.remainingQuantity <= 0;

              const addedQuantity = quantityByOptionId[option.id] ?? 0;
              const optionDisplayRemaining =
                option.remainingQuantity === null
                  ? null
                  : Math.max(option.remainingQuantity - addedQuantity, 0);

              return (
                <button
                  key={option.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd(option);
                  }}
                  disabled={soldOut}
                  className="flex w-full items-center justify-between rounded border border-zinc-700 px-3 py-2 text-left hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-zinc-200">
                      {option.name}
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      {option.initialQuantity === null
                        ? "제한없음"
                        : `${option.initialQuantity}/ ${optionDisplayRemaining === null ? "∞" : `${optionDisplayRemaining}`}`}
                    </p>
                  </div>

                  <div className="ml-3 shrink-0 text-right">
                    <p
                      className={`text-sm font-medium ${soldOut ? "text-red-500" : "text-white"
                        }`}
                    >
                      {soldOut
                        ? "품절"
                        : `${(option.price ?? product.price).toLocaleString()}원`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}