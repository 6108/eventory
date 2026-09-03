"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ProductCategory, ProductSubCategory } from "@/src/types/product";

export interface ProductCategoryCounts {
  categories: { value: ProductCategory; count: number }[];
  subCategories: { value: ProductSubCategory; count: number }[];
}

interface UseProductCategoryCountsParams {
  boothId?: string;
  following?: boolean;
  category?: string;
}

async function fetchCategoryCounts(
  params: UseProductCategoryCountsParams
): Promise<ProductCategoryCounts> {
  const searchParams = new URLSearchParams();

  if (params.boothId) {
    searchParams.set("boothId", params.boothId);
  }

  if (params.following) {
    searchParams.set("following", "true");
  }

  if (params.category && params.category !== "ALL") {
    searchParams.set("category", params.category);
  }

  const res = await fetch(
    `/api/products/category-counts?${searchParams.toString()}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error ?? "카테고리 정보를 불러오지 못했습니다.");
  }

  return data as ProductCategoryCounts;
}

export function useProductCategoryCounts({
  boothId,
  following = false,
  category = "ALL",
}: UseProductCategoryCountsParams) {
  const query = useQuery({
    queryKey: [
      "productCategoryCounts",
      { boothId: boothId ?? null, following, category },
    ] as const,

    queryFn: () => fetchCategoryCounts({ boothId, following, category }),

    placeholderData: keepPreviousData,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  return {
    categories: query.data?.categories ?? [],
    subCategories: query.data?.subCategories ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}