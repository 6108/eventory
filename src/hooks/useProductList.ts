"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ProductSummary,
  ProductCategory,
  ProductSubCategory,
} from "@/src/types/product";

export interface ProductFilterOptions {
  categories: ProductCategory[];
  subCategories: ProductSubCategory[];
}

export interface ProductListPage {
  products: ProductSummary[];
  hasMore: boolean;
  nextPage: number | null;
  total: number | null;
  filters?: ProductFilterOptions;
}

interface UseProductListParams {
  // 특정 부스로 범위 제한 (없으면 전체 상품 대상)
  boothId?: string;
  following?: boolean;
  category?: string;
  subCategory?: string;

  // 서버 컴포넌트(SSR)에서 이미 가져온 1페이지.
  // 있으면 마운트 시 재요청하지 않음.
  initialPage?: ProductListPage;
}

async function fetchProductPage(params: {
  boothId?: string;
  following?: boolean;
  category?: string;
  subCategory?: string;
  page: number;
}): Promise<ProductListPage> {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page));

  if (params.boothId) {
    searchParams.set("boothId", params.boothId);
  }

  if (params.following) {
    searchParams.set("following", "true");
  }

  if (params.category && params.category !== "ALL") {
    searchParams.set("category", params.category);
  }

  if (params.subCategory && params.subCategory !== "ALL") {
    searchParams.set("subCategory", params.subCategory);
  }

  const res = await fetch(
    `/api/products?${searchParams.toString()}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error ?? "작품 목록을 불러오지 못했습니다."
    );
  }

  return data as ProductListPage;
}

export function useProductList({
  boothId,
  following = false,
  category = "ALL",
  subCategory = "ALL",
  initialPage,
}: UseProductListParams) {
  // 필터 조합이 바뀌면(카테고리 클릭, 팔로우 토글 등)
  // 쿼리 키가 바뀌면서 자동으로 1페이지부터 새로 불러온다.
  const queryKey = [
    "products",
    {
      boothId: boothId ?? null,
      following,
      category,
      subCategory,
    },
  ] as const;

  const query = useInfiniteQuery({
    queryKey,

    queryFn: ({ pageParam }) =>
      fetchProductPage({
        boothId,
        following,
        category,
        subCategory,
        page: pageParam,
      }),

    initialPageParam: 0,

    getNextPageParam: (lastPage) => lastPage.nextPage,

    initialData: initialPage
      ? {
        pages: [initialPage],
        pageParams: [0],
      }
      : undefined,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const products =
    query.data?.pages.flatMap((page) => page.products) ?? [];

  const lastPage = query.data?.pages.at(-1);

  // 필터 정보는 항상 첫 페이지 기준으로 유지한다.
  // 페이지네이션으로 2, 3페이지를 불러와도 필터가 변하지 않는다.
  const filters = query.data?.pages[0]?.filters ?? {
    categories: [],
    subCategories: [],
  };

  return {
    products,
    hasMore: lastPage?.hasMore ?? false,
    total: lastPage?.total ?? null,
    categories: filters.categories,
    subCategories: filters.subCategories,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error,
  };
}