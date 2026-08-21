// src/component/product/ProductManageListItem.tsx
import Link from "next/link";
import Image from "next/image";
import { Infinity as InfinityIcon } from "lucide-react";
import { ProductSummary } from "@/src/types/product";

interface ProductManageListItemProps {
  href: string;
  product: ProductSummary;
  priority: boolean;
}

export default function ProductManageListItem({
  href,
  product,
  priority = false
}: ProductManageListItemProps) {
  const isSoldOut = product.remainingQuantity === 0;

  return (
    <Link
      href={href}
      className="flex flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden bg-zinc-900">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
            이미지 없음
          </div>
        )}

        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="rounded bg-zinc-900 px-2 py-1 text-xs font-medium text-zinc-300">
              품절
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="truncate text-sm font-medium text-white">{product.name}</p>
        <p className="text-sm text-zinc-400">
          {product.price.toLocaleString("ko-KR")}원
        </p>

        <div className="mt-auto flex items-center gap-1 pt-1 text-xs text-zinc-500">
          <span>재고</span>
          {product.remainingQuantity === null ? (
            <InfinityIcon className="h-3.5 w-3.5" aria-label="무제한" />
          ) : (
            <span className={isSoldOut ? "text-red-400" : "text-zinc-400"}>
              {product.remainingQuantity}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}