"use client";

import { useState } from "react";
import ProductList from "@/src/component/product/ProductList";
import CategoryChip from "@/src/component/product/CategoryChip";
import SubCategoryChip from "@/src/component/product/SubCategoryChip";
import { Product, productCategories } from "@/src/types/product";

interface ProductExplorerProps {
  products: Product[];
}

export default function ProductExplorer({ products }: ProductExplorerProps) {
  const [category, setCategory] = useState<string>("ALL");
  const [subCategory, setSubCategory] = useState<string>("ALL");

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
            onClick={() => {
              setCategory(item.value);
              setSubCategory("ALL");
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
              active={subCategory === item.value}
              onClick={() => setSubCategory(item.value)}
            />
          ))}
        </div>
      )}
      {/* 상품 */}
      <ProductList products={filteredProducts} />
    </div>
  );
}