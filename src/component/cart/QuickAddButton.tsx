// src/component/cart/QuickAddButton.tsx
"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useCartActions } from "@/src/hooks/useCartAction";
import { useProductOptionSelector } from "@/src/hooks/useProductOptionSelector";
import Modal from "@/src/component/common/Modal";
import IconActionButton from "@/src/component/common/IconActionButton";
import ProductOptionSelect from "./ProductOptionSelect";
import type { ProductSummary } from "@/src/types/product";

interface QuickAddButtonProps {
  product: ProductSummary;
}

export default function QuickAddButton({
  product,
}: QuickAddButtonProps) {
  const { addItem } = useCartActions();

  const {
    hasOptions,
    selectedOptionId,
    setSelectedOptionId,
    selectedOption,
    remainingQuantity,
    isSoldOut,
  } = useProductOptionSelector(product);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (
      remainingQuantity !== null &&
      quantity > remainingQuantity
    ) {
      setQuantity(Math.max(1, remainingQuantity));
    }
  }, [remainingQuantity, quantity]);

  function addToCart(
    qty: number,
    optionId: string | null,
    optionName: string | null,
    remaining: number | null
  ) {
    addItem({
      productId: product.id,
      optionId,
      productName: product.name,
      boothId: product.boothId,
      boothName: product.boothName,
      boothNumber: product.boothNumber,
      optionName,
      price: product.price,
      image: product.mainImage,
      quantity: qty,
      remainingQuantity: remaining,
      purchaseLimit: product.purchaseLimit,
    });

    toast.success("구매할 것에 담았습니다.");
  }

  function handleButtonClick(
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (hasOptions) {
      setQuantity(1);
      setIsModalOpen(true);
      return;
    }

    if (isSoldOut) {
      toast.error("품절된 작품입니다.");
      return;
    }

    addToCart(
      1,
      null,
      null,
      remainingQuantity
    );
  }

  function handleModalConfirm() {
    if (isSoldOut) {
      return;
    }

    if (
      remainingQuantity !== null &&
      quantity > remainingQuantity
    ) {
      toast.error("재고 수량을 초과했습니다.");
      return;
    }

    if (
      product.purchaseLimit !== null &&
      quantity > product.purchaseLimit
    ) {
      toast.error(
        `1인당 ${product.purchaseLimit}개까지 구매할 수 있습니다.`
      );
      return;
    }

    addToCart(
      quantity,
      selectedOptionId,
      selectedOption?.name ?? null,
      remainingQuantity
    );

    setIsModalOpen(false);
    setQuantity(1);
  }

  const canIncreaseQuantity =
    remainingQuantity === null ||
    quantity < remainingQuantity;

  const canIncreaseByPurchaseLimit =
    product.purchaseLimit === null ||
    quantity < product.purchaseLimit;

  const canIncrease =
    canIncreaseQuantity &&
    canIncreaseByPurchaseLimit;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <IconActionButton
        onClick={handleButtonClick}
        disabled={!hasOptions && isSoldOut}
        icon={<ShoppingCart size={14} />}
        label="담기"
      />

      {hasOptions && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          maxWidth="xs"

        >
          <div className="flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}>
            <div>
              <p className="text-xs text-zinc-500">
                {product.boothName} ({product.boothNumber})
              </p>

              <h3 className="text-base text-white">
                {product.name}
              </h3>

              <p className="mt-1 text-sm text-zinc-400">
                {product.price.toLocaleString()}원
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-zinc-400">
                옵션
              </label>

              <ProductOptionSelect
                options={product.options}
                value={selectedOptionId}
                onChange={(optionId) => {
                  setSelectedOptionId(optionId);
                  setQuantity(1);
                }}
                className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-primary"
              />
            </div>

            {!isSoldOut && remainingQuantity !== null && (
              <p className="text-xs text-zinc-500">
                남은 수량 {remainingQuantity}개
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">
                수량
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) =>
                      Math.max(1, q - 1)
                    )
                  }
                  disabled={quantity <= 1}
                  className="h-11 w-11 rounded bg-zinc-800 text-white disabled:opacity-40"
                >
                  −
                </button>

                <span className="w-6 text-center text-sm text-white">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    canIncrease &&
                    setQuantity((q) => q + 1)
                  }
                  disabled={!canIncrease}
                  className="h-11 w-11 rounded bg-zinc-800 text-white disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {product.purchaseLimit !== null && (
              <p className="text-xs text-zinc-500">
                1인당 최대 {product.purchaseLimit}개
              </p>
            )}

            <button
              type="button"
              onClick={handleModalConfirm}
              disabled={isSoldOut}
              className="w-full rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSoldOut
                ? "품절"
                : `${quantity}개 구매할 것 담기`}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
