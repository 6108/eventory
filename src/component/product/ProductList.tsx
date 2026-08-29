"use client";

import { useEffect, useRef } from "react";
import { ProductSummary } from "@/src/types/product";
import ProductListItem from "./ProductListItem";

interface ProductListProps {
  products: ProductSummary[];
  currentUserId?: string;
  hasMore?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export default function ProductList({
  products,
  currentUserId,
  hasMore = false,
  isFetchingNextPage = false,
  onLoadMore,
}: ProductListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 목록 맨 아래 sentinel이 화면에 보이면 다음 페이지를 불러온다.
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  if (products.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-zinc-500">
        표시할 작품이 없습니다.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {products.map((product, index) => (
          <ProductListItem
            key={product.id}
            productInfo={product}
            currentUserId={currentUserId}
            priority={index < 5}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="py-8 text-center text-xs text-zinc-500">
          {isFetchingNextPage ? "불러오는 중..." : ""}
        </div>
      )}
    </div>
  );
}