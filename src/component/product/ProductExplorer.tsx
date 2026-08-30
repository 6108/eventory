"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProductList from "@/src/component/product/ProductList";
import CategoryChip from "@/src/component/product/CategoryChip";
import SubCategoryChip from "@/src/component/product/SubCategoryChip";
import { useProductCategoryFilter } from "@/src/hooks/useProductCategoryFilter";
import { useProductList, ProductListPage } from "@/src/hooks/useProductList";

interface ProductExplorerProps {
  initialPage: ProductListPage;
  currentUserId?: string;
  showFollowingFilter?: boolean;
  boothId?: string;
}

export default function ProductExplorer({
  initialPage,
  currentUserId,
  showFollowingFilter = false,
  boothId,
}: ProductExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isFollowingOnly =
    searchParams.get("following") === "true";

  // URL에서 현재 카테고리 상태 가져오기
  const category = searchParams.get("category") ?? "ALL";
  const subCategory =
    searchParams.get("subCategory") ?? "ALL";

  const {
    products,
    hasMore,
    isFetchingNextPage,
    fetchNextPage,
    categories: availableCategories,
    subCategories: availableSubCategories,
  } = useProductList({
    boothId,
    following: showFollowingFilter && isFollowingOnly,
    category,
    subCategory,
    initialPage,
  });

  const {
    categories,
    subCategories,
    handleCategoryClick,
    handleSubCategoryClick,
  } = useProductCategoryFilter({
    category,
    subCategory,
    availableCategories,
    availableSubCategories,
  });

  function toggleFollowingFilter() {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    if (isFollowingOnly) {
      params.delete("following");
    } else {
      params.set("following", "true");
    }

    const query = params.toString();

    router.replace(
      query ? `${pathname}?${query}` : pathname,
      {
        scroll: false,
      }
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 팔로우한 부스만 보기 */}
      {showFollowingFilter && currentUserId && (
        <button
          type="button"
          onClick={toggleFollowingFilter}
          className={`self-start rounded-sm border px-3 py-1.5 text-xs font-medium transition-colors
            border-primary bg-primary text-white
          `}
        >
          {isFollowingOnly
            ? "전체 작품 보기"
            : "팔로우한 부스 작품만 보기"}
        </button>
      )}

      {/* 카테고리 */}
      <div className="flex gap-2 overflow-x-auto">
        {categories.map((item) => (
          <CategoryChip
            key={item.value}
            label={item.label}
            active={category === item.value}
            onClick={() =>
              handleCategoryClick(item.value)
            }
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
              onClick={() =>
                handleSubCategoryClick(item.value)
              }
            />
          ))}
        </div>
      )}

      {/* 작품 */}
      <ProductList
        products={products}
        currentUserId={currentUserId}
        hasMore={hasMore}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={fetchNextPage}
      />
    </div>
  );
}