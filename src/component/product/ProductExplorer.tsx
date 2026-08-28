// src/component/product/ProductExplorer.tsx
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProductList from "@/src/component/product/ProductList";
import CategoryChip from "@/src/component/product/CategoryChip";
import SubCategoryChip from "@/src/component/product/SubCategoryChip";
import { useProductCategoryFilter } from "@/src/hooks/useProductCategoryFilter";
import { ProductSummary } from "@/src/types/product";

interface ProductExplorerProps {
  products: ProductSummary[];
  currentUserId?: string;
}

export default function ProductExplorer({ products, currentUserId }: ProductExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isFollowingOnly = searchParams.get("following") === "true";

  const {
    category,
    subCategory,
    categories,
    subCategories,
    filteredProducts,
    handleCategoryClick,
    handleSubCategoryClick,
  } = useProductCategoryFilter(products);

  function toggleFollowingFilter() {
    const params = new URLSearchParams(searchParams.toString());

    if (isFollowingOnly) {
      params.delete("following");
    } else {
      params.set("following", "true");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 팔로우한 부스만 보기 */}
      {currentUserId && (
        <button
          onClick={toggleFollowingFilter}
          className={`self-start rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${isFollowingOnly
            ? "border-primary bg-primary text-white"
            : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
            }`}
        >
          {isFollowingOnly ? "팔로우한 부스만 보는 중" : "팔로우한 부스만 보기"}
        </button>
      )}

      {/* 카테고리 */}
      <div className="flex gap-2 overflow-x-auto">
        {categories.map((item) => (
          <CategoryChip
            key={item.value}
            label={item.label}
            active={category === item.value}
            onClick={() => handleCategoryClick(item.value)}
          />
        ))}
      </div>
      {/* 타입 */}
      {subCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto font-bold">
          {subCategories.map((item) => (
            <SubCategoryChip
              key={item.value}
              label={item.label}
              active={subCategory === item.value}
              onClick={() => handleSubCategoryClick(item.value)}
            />
          ))}
        </div>
      )}
      {/* 상품 */}
      <ProductList products={filteredProducts} currentUserId={currentUserId} />
    </div>
  );
}