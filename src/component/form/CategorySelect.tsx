// src/component/form/CategorySelect.tsx
"use client";

import { productCategories } from "@/src/types/product";

interface CategorySelectProps {
  category: string;
  subCategory: string;
  onCategoryChange: (category: string) => void;
  onSubCategoryChange: (subCategory: string) => void;
}

export function CategorySelect({
  category,
  subCategory,
  onCategoryChange,
  onSubCategoryChange,
}: CategorySelectProps) {
  const selectedCategory = productCategories.find(
    (item) => item.value === category
  );

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">카테고리</label>
        <select
          value={category}
          onChange={(e) => {
            onCategoryChange(e.target.value);
            onSubCategoryChange("");
          }}
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-primary"
        >
          <option value="">카테고리 선택</option>
          {productCategories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-zinc-400">세부 카테고리</label>
        <select
          value={subCategory}
          onChange={(e) => onSubCategoryChange(e.target.value)}
          disabled={!selectedCategory}
          required
          className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-white outline-none disabled:opacity-40 focus:border-primary"
        >
          <option value="">세부 카테고리 선택</option>
          {selectedCategory?.types.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}