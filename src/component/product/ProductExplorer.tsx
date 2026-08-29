"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProductList from "@/src/component/product/ProductList";
import CategoryChip from "@/src/component/product/CategoryChip";
import SubCategoryChip from "@/src/component/product/SubCategoryChip";
import { useProductCategoryFilter } from "@/src/hooks/useProductCategoryFilter";
import { useProductList, ProductListPage } from "@/src/hooks/useProductList";

interface ProductExplorerProps {
  // 서버 컴포넌트에서 미리 가져온 1페이지 (SSR 초기 렌더 + 재요청 방지용)
  initialPage: ProductListPage;
  currentUserId?: string;
  showFollowingFilter?: boolean;
  // 특정 부스로 범위 제한 (부스 상세/상품 목록 페이지에서 사용). 없으면 전체 상품 대상.
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

  const isFollowingOnly = searchParams.get("following") === "true";

  const {
    category,
    subCategory,
    categories,
    subCategories,
    handleCategoryClick,
    handleSubCategoryClick,
  } = useProductCategoryFilter();

  const {
    products,
    hasMore,
    isFetchingNextPage,
    fetchNextPage,
  } = useProductList({
    boothId,
    following: showFollowingFilter && isFollowingOnly,
    category,
    subCategory,
    initialPage,
  });

  function toggleFollowingFilter() {
    const params = new URLSearchParams(searchParams.toString());

    if (isFollowingOnly) {
      params.delete("following");
    } else {
      params.set("following", "true");
    }

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname);
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
            
            }`}
        >
          {isFollowingOnly ? "전체 작품 보기" : "팔로우한 부스 작품만 보기"}
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