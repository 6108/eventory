// src/hooks/useProductCategoryFilter.ts
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { productCategories, ProductSummary } from "@/src/types/product";

interface ChipOption {
  value: string;
  label: string;
}

export function useProductCategoryFilter(products: ProductSummary[]) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "ALL";
  const subCategory = searchParams.get("subCategory") ?? "ALL";

  const updateQuery = (nextCategory: string, nextSubCategory: string) => {
    const params = new URLSearchParams();
    if (nextCategory !== "ALL") params.set("category", nextCategory);
    if (nextSubCategory !== "ALL") params.set("subCategory", nextSubCategory);

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
    ...productCategories
      .filter((item) =>
        products.some((product) => product.category === item.value)
      )
      .map((item) => ({
        value: item.value,
        label: item.label,
      })),
  ];

  const subCategories: ChipOption[] =
    category === "ALL"
      ? []
      : [
        { value: "ALL", label: "전체" },
        ...(productCategories
          .find((item) => item.value === category)
          ?.types.filter((type) =>
            products.some(
              (product) =>
                product.category === category &&
                product.subCategory === type.value
            )
          ) ?? []),
      ];

  const filteredProducts = products.filter((product) => {
    const categoryMatch = category === "ALL" || product.category === category;
    const typeMatch = subCategory === "ALL" || product.subCategory === subCategory;
    return categoryMatch && typeMatch;
  });

  return {
    category,
    subCategory,
    categories,
    subCategories,
    filteredProducts,
    handleCategoryClick,
    handleSubCategoryClick,
  };
}