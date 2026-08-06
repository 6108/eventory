"use client";

import { useState } from "react";
import ProductList from "@/src/component/product/ProductList";
import { mockProducts } from "@/src/mocks/products";
import CategoryChip from "@/src/component/product/CategoryChip";
import { productCategories } from "@/src/types/product";
import SubCategoryChip from "@/src/component/product/SubCategoryChip";

export default function Page() {
  const [category, setCategory] = useState<string>("ALL");
  const [type, setType] = useState<string>("ALL");

  const categories = [
    { value: "ALL", label: "전체" },
    ...productCategories.map((item) => ({
      value: item.value,
      label: item.label,
    })),
  ];

  const subCategories =
    category === "ALL"
      ? []
      : [
        { value: "ALL", label: "전체" },
        ...(productCategories.find((item) => item.value === category)
          ?.types ?? []),
      ];

  const filteredProducts = mockProducts.filter((product) => {
    const categoryMatch =
      category === "ALL" || product.category === category;

    const typeMatch = type === "ALL" || product.subCategory === type;

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
            onClick={() => {
              setCategory(item.value);
              setType("ALL");
            }}
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
              active={type === item.value}
              onClick={() => setType(item.value)}
            />
          ))}
        </div>
      )}

      {/* 상품 */}
      <ProductList products={filteredProducts} />
    </div>
  );
}