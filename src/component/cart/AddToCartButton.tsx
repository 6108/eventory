// src/component/cart/AddToCartButton.tsx
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useProductOptionSelector } from "@/src/hooks/useProductOptionSelector";
import ProductOptionSelect from "./ProductOptionSelect";
import type { Product } from "@/src/types/product";
import { useCartActions } from "@/src/hooks/useCartAction";

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
  const { addItem } = useCartActions();

  const {
    hasOptions,
    selectedOptionId,
    setSelectedOptionId,
    selectedOption,
    remainingQuantity,
    isSoldOut,
  } = useProductOptionSelector(product);

  const [quantity, setQuantity] = useState(1);

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
      purchased: false,
    });

    toast.success("구매할 목록에 담았습니다.");
    setQuantity(1);
  }

  return (
    <div className="flex flex-col gap-3">
      {hasOptions && (
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-400">옵션</label>
          <ProductOptionSelect
            options={product.options}
            value={selectedOptionId}
            onChange={setSelectedOptionId}
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-11 w-11 rounded bg-zinc-800 text-white"
          >
            −
          </button>
          <span className="w-6 text-center text-sm text-white">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-11 w-11 rounded bg-zinc-800 text-white"
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
          {isSoldOut ? "품절" : "구매할 목록에 추가"}
        </button>
      </div>
    </div>
  );
}
