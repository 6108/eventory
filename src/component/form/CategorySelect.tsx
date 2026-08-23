// src/component/form/CategorySelect.tsx
"use client";

import { productCategories } from "@/src/types/product";
import { Select } from "@/src/component/common/Select";

type Props = {
  category: string;
  subCategory: string;
  onCategoryChange: (category: string) => void;
  onSubCategoryChange: (subCategory: string) => void;
};

export function CategorySelect({
  category,
  subCategory,
  onCategoryChange,
  onSubCategoryChange,
}: Props) {
  const selectedCategory = productCategories.find(
    (item) => item.value === category
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">카테고리</label>
        <Select
          value={category}
          onChange={(e) => {
            onCategoryChange(e.target.value);
            onSubCategoryChange("");
          }}
          required
        >
          <option value="">카테고리 선택</option>
          {productCategories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">세부 카테고리</label>
        <Select
          value={subCategory}
          onChange={(e) => onSubCategoryChange(e.target.value)}
          disabled={!selectedCategory}
          required
        >
          <option value="">세부 카테고리 선택</option>
          {selectedCategory?.types.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </div>
    </>
  );
}