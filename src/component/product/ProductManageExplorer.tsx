"use client";

import { useMemo, useState } from "react";

import CategoryChip from "@/src/component/product/CategoryChip";
import SubCategoryChip from "@/src/component/product/SubCategoryChip";
import ProductManageList from "./ProductManageList";

import {
  productCategories,
  ProductSummary,
} from "@/src/types/product";

interface ProductManageExplorerProps {
  eventId: string;
  boothId: string;
  products: ProductSummary[];
}

export default function ProductManageExplorer({
  eventId,
  boothId,
  products,
}: ProductManageExplorerProps) {
  const [category, setCategory] = useState("ALL");
  const [subCategory, setSubCategory] = useState("ALL");

  // 현재 부스에 실제로 존재하는 카테고리
  const existingCategories = useMemo(() => {
    return new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    );
  }, [products]);

  // 현재 부스에 실제로 존재하는 서브카테고리
  const existingSubCategories = useMemo(() => {
    return new Set(
      products
        .filter(
          (product) =>
            category === "ALL" || product.category === category
        )
        .map((product) => product.subCategory)
        .filter(Boolean)
    );
  }, [products, category]);

  // 카테고리 목록
  const visibleCategories = useMemo(() => {
    return [
      { value: "ALL", label: "전체" },
      ...productCategories
        .filter((category) =>
          existingCategories.has(category.value)
        )
        .map((category) => ({
          value: category.value,
          label: category.label,
        })),
    ];
  }, [existingCategories]);

  // 현재 선택된 카테고리 정의
  const currentCategoryDef = productCategories.find(
    (item) => item.value === category
  );

  // 서브카테고리 목록
  const visibleSubCategories = useMemo(() => {
    if (category === "ALL" || !currentCategoryDef) {
      return [];
    }

    return [
      { value: "ALL", label: "전체" },
      ...currentCategoryDef.types
        .filter((type) =>
          existingSubCategories.has(type.value)
        )
        .map((type) => ({
          value: type.value,
          label: type.label,
        })),
    ];
  }, [
    category,
    currentCategoryDef,
    existingSubCategories,
  ]);

  // 카테고리 변경
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubCategory("ALL");
  };

  // 서브카테고리 변경
  const handleSubCategoryChange = (value: string) => {
    setSubCategory(value);
  };

  // 선택된 조건으로 상품 필터링
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        category === "ALL" || product.category === category;

      const subCategoryMatch =
        subCategory === "ALL" ||
        product.subCategory === subCategory;

      return categoryMatch && subCategoryMatch;
    });
  }, [products, category, subCategory]);

  return (
    <div className="flex flex-col gap-6">
      {/* 카테고리 */}
      <div className="flex gap-2 overflow-x-auto">
        {visibleCategories.map((item) => (
          <CategoryChip
            key={item.value}
            label={item.label}
            active={category === item.value}
            onClick={() => handleCategoryChange(item.value)}
          />
        ))}
      </div>

      {/* 서브카테고리 */}
      {visibleSubCategories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto font-bold">
          {visibleSubCategories.map((item) => (
            <SubCategoryChip
              key={item.value}
              label={item.label}
              active={subCategory === item.value}
              onClick={() =>
                handleSubCategoryChange(item.value)
              }
            />
          ))}
        </div>
      )}

      {/* 작품 */}
      <ProductManageList
        eventId={eventId}
        boothId={boothId}
        products={filteredProducts}
      />
    </div>
  );
}