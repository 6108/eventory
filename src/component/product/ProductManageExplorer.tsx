// src/component/product/ProductManageExplorer.tsx
"use client";

import CategoryChip from "@/src/component/product/CategoryChip";
import SubCategoryChip from "@/src/component/product/SubCategoryChip";
import { useProductCategoryFilter } from "@/src/hooks/useProductCategoryFilter";
import { ProductSummary } from "@/src/types/product";
import ProductManageList from "./ProductManageList";

interface ProductManageExplorerProps {
  eventId: string;
  boothId: string;
  products: ProductSummary[];

}

export default function ProductManageExplorer({ eventId, boothId, products }: ProductManageExplorerProps) {
  const {
    category,
    subCategory,
    categories,
    subCategories,
    filteredProducts,
    handleCategoryClick,
    handleSubCategoryClick,
  } = useProductCategoryFilter(products);

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
      {/* 작품 */}
      <ProductManageList eventId={eventId} boothId={boothId} products={filteredProducts} />
    </div>
  );
}