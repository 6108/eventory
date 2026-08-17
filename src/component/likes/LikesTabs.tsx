// src/component/likes/LikesTabs.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ProductSummary } from "@/src/types/product";
import ProductListItem from "@/src/component/product/ProductListItem";
import BoothFollowItem from "@/src/component/likes/BoothFollowItem";

interface LikedProduct extends ProductSummary {
  remainingQuantity: number;
  isSoldOut: boolean;
  isLowStock: boolean;
}

interface FollowedBooth {
  id: string;
  boothNumber: string;
  name: string;
  category: string;
}

interface LikesTabsProps {
  products: LikedProduct[];
  booths: FollowedBooth[];
  currentUserId: string;
}

export default function LikesTabs({
  products,
  booths,
  currentUserId,
}: LikesTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = searchParams.get("tab") === "booths" ? "booths" : "products";

  const handleTabClick = (next: "products" | "booths") => {
    router.replace(`${pathname}?tab=${next}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-zinc-800">
        <button
          onClick={() => handleTabClick("products")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "products"
            ? "border-primary text-white"
            : "border-transparent text-zinc-500"
            }`}
        >
          상품 ({products.length})
        </button>
        <button
          onClick={() => handleTabClick("booths")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === "booths"
            ? "border-primary text-white"
            : "border-transparent text-zinc-500"
            }`}
        >
          팔로우 부스 ({booths.length})
        </button>
      </div>

      {tab === "products" ? (
        products.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">
            좋아요한 상품이 없어요.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="relative">
                <ProductListItem
                  productInfo={product}
                  currentUserId={currentUserId}
                />
                {product.isSoldOut && (
                  <span className="absolute top-1 left-1 z-20 rounded-sm bg-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-300">
                    품절
                  </span>
                )}
                {!product.isSoldOut && product.isLowStock && (
                  <span className="absolute top-1 left-1 z-20 rounded-sm bg-red-600 px-2 py-1 text-xs font-semibold text-white">
                    품절임박 {product.remainingQuantity}개
                  </span>
                )}
              </div>
            ))}
          </div>
        )
      ) : booths.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          팔로우한 부스가 없어요.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {booths.map((booth) => (
            <BoothFollowItem key={booth.id} booth={booth} />
          ))}
        </div>
      )}
    </div>
  );
}