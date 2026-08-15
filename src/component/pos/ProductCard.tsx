// src/component/pos/ProductCard.tsx
"use client";

import Image from "next/image";
import { useOrderStore } from "@/src/store/orderStore";
import { PosProduct } from "@/src/types/product";


interface ProductCardProps {
  product: PosProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useOrderStore((s) => s.addItem);

  const orderQuantity = useOrderStore(
    (s) =>
      s.items.find((item) => item.productId === product.id)?.quantity ?? 0
  );

  const remainingQuantity =
    product.total_quantity == null
      ? undefined
      : Math.max(product.total_quantity - orderQuantity, 0);

  const remainingPurchaseLimit =
    product.purchase_limit == null
      ? undefined
      : Math.max(product.purchase_limit - orderQuantity, 0);

  const isSoldOut =
    remainingQuantity === 0 || remainingPurchaseLimit === 0;

  return (
    <button
      type="button"
      disabled={isSoldOut}
      onClick={() =>
        addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          totalQuantity: product.total_quantity,
          purchaseLimit: product.purchase_limit,
        })
      }
      className="flex flex-col gap-1 rounded border border-zinc-800 p-2 text-left hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="aspect-square w-full overflow-hidden rounded bg-zinc-900">
        {product.main_image_url && (
          <Image
            src={product.main_image_url}
            alt={product.name}
            width={150}
            height={150}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <p className="truncate text-xs text-white">
        {product.name}
      </p>

      <p className="text-xs text-zinc-400">
        {product.price.toLocaleString()}원
      </p>

      <p className="text-xs text-zinc-500">
        남은 수량{" "}
        {remainingQuantity === undefined
          ? "무제한"
          : remainingQuantity}
      </p>

      {remainingPurchaseLimit !== undefined && (
        <p className="text-xs text-zinc-500">
          구매 제한 {remainingPurchaseLimit}/{product.purchase_limit}
        </p>
      )}
    </button>
  );
}