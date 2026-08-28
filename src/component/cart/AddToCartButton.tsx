// src/component/cart/AddToCartButton.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/src/store/cartStore";
import type { Product } from "@/src/types/product";

interface AddToCartButtonProps {
  product: Product;
  boothName: string;
  boothNumber: string;
}

export default function AddToCartButton({
  product,
  boothName,
  boothNumber,
}: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem);

  const hasOptions = product.options.length > 0;

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(
    hasOptions ? product.options[0].id : null
  );
  const [quantity, setQuantity] = useState(1);

  const selectedOption = hasOptions
    ? product.options.find((o) => o.id === selectedOptionId) ?? null
    : null;

  // 옵션이 있으면 옵션 재고를, 없으면 상품 재고를 기준으로 함
  const remainingQuantity = hasOptions
    ? selectedOption?.remainingQuantity ?? null
    : product.remainingQuantity;

  const isSoldOut =
    remainingQuantity !== null && remainingQuantity <= 0;

  function handleAdd() {
    if (isSoldOut) return;

    addItem({
      productId: product.id,
      optionId: selectedOptionId,
      productName: product.name,
      boothId: product.boothId,
      boothName,
      boothNumber,
      optionName: selectedOption?.name ?? null,
      price: product.price,
      image: product.mainImage,
      quantity,
      remainingQuantity,
      purchaseLimit: product.purchaseLimit,
    });

    toast.success("장바구니에 담았습니다.");
    setQuantity(1);
  }

  return (
    <div className="flex flex-col gap-3">
      {hasOptions && (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">옵션</label>
          <select
            value={selectedOptionId ?? ""}
            onChange={(e) => setSelectedOptionId(e.target.value)}
            className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
          >
            {product.options.map((option) => {
              const optionSoldOut =
                option.remainingQuantity !== null &&
                option.remainingQuantity <= 0;

              return (
                <option
                  key={option.id}
                  value={option.id}
                  disabled={optionSoldOut}
                >
                  {option.name}
                  {optionSoldOut ? " (품절)" : ""}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-8 w-8 rounded bg-zinc-800 text-white"
          >
            −
          </button>
          <span className="w-6 text-center text-sm text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-8 w-8 rounded bg-zinc-800 text-white"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={isSoldOut}
          className="flex-1 rounded bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSoldOut ? "품절" : "장바구니 담기"}
        </button>
      </div>
    </div>
  );
}