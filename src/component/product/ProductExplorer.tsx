"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ProductList from "@/src/component/product/ProductList";
import CategoryChip from "@/src/component/product/CategoryChip";
import SubCategoryChip from "@/src/component/product/SubCategoryChip";
import { Product, productCategories } from "@/src/types/product";

interface ProductExplorerProps {
  products: Product[];
  currentUserId?: string;
}

export default function ProductExplorer({ products, currentUserId }: ProductExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState<string>(
    searchParams.get("category") ?? "ALL"
  );
  const [subCategory, setSubCategory] = useState<string>(
    searchParams.get("subCategory") ?? "ALL"
  );

  // 상태 바뀔 때마다 URL 쿼리도 같이 갱신
  const updateQuery = (nextCategory: string, nextSubCategory: string) => {
    const params = new URLSearchParams();
    if (nextCategory !== "ALL") params.set("category", nextCategory);
    if (nextSubCategory !== "ALL") params.set("subCategory", nextSubCategory);

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const handleCategoryClick = (value: string) => {
    setCategory(value);
    setSubCategory("ALL");
    updateQuery(value, "ALL");
  };

  const handleSubCategoryClick = (value: string) => {
    setSubCategory(value);
    updateQuery(category, value);
  };

  const categories = [
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

  const subCategories =
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
    const categoryMatch =
      category === "ALL" || product.category === category;
    const typeMatch =
      subCategory === "ALL" || product.subCategory === subCategory;
    return categoryMatch && typeMatch;
  });

  return (
    <div className="flex flex-col gap-6">
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