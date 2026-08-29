"use client";

import {
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";

import { productCategories } from "@/src/types/product";

interface ChipOption {
  value: string;
  label: string;
}

interface UseProductCategoryFilterParams {
  category?: string;
  subCategory?: string;
  availableCategories?: string[];
  availableSubCategories?: string[];
}

export function useProductCategoryFilter({
  category: externalCategory,
  subCategory: externalSubCategory,
  availableCategories,
  availableSubCategories,
}: UseProductCategoryFilterParams = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category =
    externalCategory ??
    searchParams.get("category") ??
    "ALL";

  const subCategory =
    externalSubCategory ??
    searchParams.get("subCategory") ??
    "ALL";

  const updateQuery = (
    nextCategory: string,
    nextSubCategory: string
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

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

    router.replace(
      query ? `${pathname}?${query}` : pathname,
      {
        scroll: false,
      }
    );
  };

  const handleCategoryClick = (value: string) => {
    updateQuery(value, "ALL");
  };

  const handleSubCategoryClick = (value: string) => {
    updateQuery(category, value);
  };

  // availableCategories가 전달되지 않은 기존 화면에서는
  // 기존처럼 모든 카테고리를 표시
  const categories: ChipOption[] = [
    {
      value: "ALL",
      label: "전체",
    },

    ...productCategories
      .filter((item) =>
        availableCategories
          ? availableCategories.includes(item.value)
          : true
      )
      .map((item) => ({
        value: item.value,
        label: item.label,
      })),
  ];

  // availableSubCategories가 전달되지 않은 기존 화면에서는
  // 해당 카테고리의 모든 타입을 표시
  const subCategories: ChipOption[] =
    category === "ALL"
      ? []
      : [
        {
          value: "ALL",
          label: "전체",
        },

        ...(
          productCategories.find(
            (item) => item.value === category
          )?.types ?? []
        )
          .filter((item) =>
            availableSubCategories
              ? availableSubCategories.includes(item.value)
              : true
          )
          .map((item) => ({
            value: item.value,
            label: item.label,
          })),
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