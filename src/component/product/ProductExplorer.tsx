"use client";

import { useEffect, useMemo, useState } from "react";

import ProductList from "@/src/component/product/ProductList";
import CategoryChip from "@/src/component/product/CategoryChip";
import SubCategoryChip from "@/src/component/product/SubCategoryChip";
import { useProductList, ProductListPage } from "@/src/hooks/useProductList";
import { productCategories, ProductCategoryCounts } from "@/src/types/product";

interface ProductExplorerProps {
  initialPage: ProductListPage;
  currentUserId?: string;
  boothId?: string;
  categoryCounts: ProductCategoryCounts;
  followedCategoryCounts?: ProductCategoryCounts;
}

export default function ProductExplorer({
  initialPage,
  currentUserId,
  boothId,
  categoryCounts,
  followedCategoryCounts,
}: ProductExplorerProps) {
  const [following, setFollowing] = useState(false);
  const [category, setCategory] = useState("ALL");
  const [subCategory, setSubCategory] = useState("ALL");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    category === "ALL" ? params.delete("category") : params.set("category", category);
    subCategory === "ALL" ? params.delete("subCategory") : params.set("subCategory", subCategory);

    const query = params.toString();
    const newUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;

    window.history.replaceState(null, "", newUrl);
  }, [category, subCategory]);

  const showFollowingFilter = !!currentUserId && !!followedCategoryCounts;

  const {
    products,
    hasMore,
    isFetchingNextPage,
    fetchNextPage,
  } = useProductList({
    boothId,
    following: showFollowingFilter && following,
    category,
    subCategory,
    initialPage,
  });

  const activeCategoryCounts = following && followedCategoryCounts ? followedCategoryCounts : categoryCounts;

  const existingCategories = useMemo(
    () => new Set(activeCategoryCounts.categories.filter((c) => c.count > 0).map((c) => c.value)),
    [activeCategoryCounts]
  );
  const existingSubCategories = useMemo(
    () => new Set(activeCategoryCounts.subCategories.filter((c) => c.count > 0).map((c) => c.value)),
    [activeCategoryCounts]
  );

  const visibleCategories = useMemo(
    () => [
      { value: "ALL", label: "전체" },
      ...productCategories
        .filter((c) => existingCategories.has(c.value))
        .map((c) => ({ value: c.value, label: c.label })),
    ],
    [existingCategories]
  );

  const currentCategoryDef = productCategories.find((c) => c.value === category);

  const visibleSubCategories = useMemo(() => {
    if (category === "ALL" || !currentCategoryDef) return [];
    return [
      { value: "ALL", label: "전체" },
      ...currentCategoryDef.types
        .filter((t) => existingSubCategories.has(t.value))
        .map((t) => ({ value: t.value, label: t.label })),
    ];
  }, [category, currentCategoryDef, existingSubCategories]);

  const handleFollowingToggle = () => {
    setFollowing((prev) => !prev);
    setCategory("ALL");
    setSubCategory("ALL");
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubCategory("ALL");
  };

  return (
    <div className="flex flex-col gap-6">
      {showFollowingFilter && (
        <button
          type="button"
          onClick={handleFollowingToggle}
          className="self-start rounded-sm border border-primary bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors"
        >
          {following ? "전체 작품 보기" : "팔로우한 부스 작품만 보기"}
        </button>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {visibleCategories.map((item) => (
          <CategoryChip
            key={item.value}
            label={item.label}
            active={category === item.value}
            onClick={() => handleCategoryChange(item.value)}
          />
        ))}
      </div>

      {visibleSubCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto font-bold">
          {visibleSubCategories.map((item) => (
            <SubCategoryChip
              key={item.value}
              label={item.label}
              active={subCategory === item.value}
              onClick={() => setSubCategory(item.value)}
            />
          ))}
        </div>
      )}

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