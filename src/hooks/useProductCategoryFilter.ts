// src/hooks/useProductCategoryFilter.ts
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { productCategories } from "@/src/types/product";

interface ChipOption {
  value: string;
  label: string;
}

// 카테고리/서브카테고리 필터 상태를 URL 쿼리로 관리.
//
// 예전엔 클라이언트가 들고 있는 전체 상품 배열에서 필터링하고, 칩도
// "현재 로드된 상품 중에 실제로 존재하는 카테고리"만 보여줬음.
// 하지만 목록이 서버 페이지네이션(getProductSummariesPaged)으로 바뀌면서
// 클라이언트는 이제 전체 데이터를 들고 있지 않으므로 그 방식을 쓸 수 없음.
// 카테고리 종류가 몇 개 안 되는 고정값이라 그냥 항상 전체 카테고리를
// 보여주는 것으로 단순화함. 실제 필터링은 서버 쿼리(.eq)에서 처리.
export function useProductCategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "ALL";
  const subCategory = searchParams.get("subCategory") ?? "ALL";

  const updateQuery = (nextCategory: string, nextSubCategory: string) => {
    // 기존 쿼리(예: following=true)는 유지하면서 category/subCategory만 갱신.
    const params = new URLSearchParams(searchParams.toString());

    if (nextCategory === "ALL") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }

    if (nextSubCategory === "ALL") {
      params.delete("subCategory");
    } else {
      params.set("subCategory", nextSubCategory);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleCategoryClick = (value: string) => {
    updateQuery(value, "ALL");
  };

  const handleSubCategoryClick = (value: string) => {
    updateQuery(category, value);
  };

  const categories: ChipOption[] = [
    { value: "ALL", label: "전체" },
    ...productCategories.map((item) => ({
      value: item.value,
      label: item.label,
    })),
  ];

  const subCategories: ChipOption[] =
    category === "ALL"
      ? []
      : [
        { value: "ALL", label: "전체" },
        ...(productCategories.find((item) => item.value === category)
          ?.types ?? []),
      ];

  return {
    category,
    subCategory,
    categories,
    subCategories,
    handleCategoryClick,
    handleSubCategoryClick,
  };
}