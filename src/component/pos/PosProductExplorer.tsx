// src/component/pos/PosProductExplorer.tsx
"use client";

import { useState } from "react";
import ProductGrid from "@/src/component/pos/ProductGrid";
import CategoryChip from "@/src/component/product/CategoryChip";
import SubCategoryChip from "@/src/component/product/SubCategoryChip";
import { PosProduct, productCategories } from "@/src/types/product";

interface PosProductExplorerProps {
  products: PosProduct[];
}

export default function PosProductExplorer({
  products,
}: PosProductExplorerProps) {
  const [category, setCategory] = useState("ALL");
  const [subCategory, setSubCategory] = useState("ALL");

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

  const filteredProducts = products.filter(
    (product) =>
      (category === "ALL" || product.category === category) &&
      (subCategory === "ALL" ||
        product.subCategory === subCategory)
  );

  return (
    <div className="flex flex-col gap-6">
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

      <ProductGrid products={filteredProducts} />
    </div>
  );
}