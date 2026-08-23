"use client";

import toast from "react-hot-toast";
import { useOrderStore } from "@/src/store/orderStore";
import { PosProduct, ProductOption } from "@/src/types/product";

export default function ProductCard({
  product,
}: {
  product: PosProduct;
}) {
  const addItem = useOrderStore((s) => s.addItem);
  const orderItems = useOrderStore((s) => s.items);

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

  return (
    <div
      className={`overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 ${isSoldOut ? "opacity-40" : ""
        }`}
    >
      {/* 상품 이미지 */}
      <div className="aspect-square w-full bg-zinc-800">
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">
            이미지 없음
          </div>
        )}
      </div>

      {/* 상품 정보 */}
      <div className="p-3">
        <div className="mb-2">
          <p className="text-sm font-medium text-white">{product.name}</p>

          {/* 총 수량 / 남은 수량 */}
          <p className="mt-1 text-xs text-zinc-400">
            총 {totalQuantity === null ? "무제한" : `${totalQuantity}개`}
            {" · "}
            남은{" "}
            {totalRemaining === null
              ? "무제한"
              : `${Math.max(totalRemaining, 0)}개`}
          </p>
        </div>

        {/* 옵션 없는 상품 */}
        {!hasOptions && (
          <button
            onClick={() => handleAdd()}
            disabled={isSoldOut}
            className="flex w-full items-center justify-between rounded border border-zinc-700 px-3 py-2 text-left hover:bg-zinc-800 disabled:cursor-not-allowed"
          >
            <span className="text-sm text-zinc-300">담기</span>
            <span className="text-sm font-medium text-white">
              {product.price.toLocaleString()}원
            </span>
          </button>
        )}

        {/* 옵션 있는 상품 */}
        {hasOptions && (
          <div className="space-y-1.5">
            {product.options.map((option) => {
              const soldOut =
                option.remainingQuantity !== null &&
                option.remainingQuantity <= 0;

              return (
                <button
                  key={option.id}
                  onClick={() => handleAdd(option)}
                  disabled={soldOut}
                  className="flex w-full items-center justify-between rounded border border-zinc-700 px-3 py-2 text-left hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-zinc-200">
                      {option.name}
                    </p>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      총{" "}
                      {option.initialQuantity === null
                        ? "무제한"
                        : `${option.initialQuantity}개`}
                      {" · "}
                      남은{" "}
                      {option.remainingQuantity === null
                        ? "무제한"
                        : `${Math.max(option.remainingQuantity, 0)}개`}
                    </p>
                  </div>

                  <div className="ml-3 shrink-0 text-right">
                    <p className="text-sm font-medium text-white">
                      {(option.price ?? product.price).toLocaleString()}원
                    </p>

                    {soldOut && (
                      <p className="text-xs text-red-500">품절</p>
                    )}
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