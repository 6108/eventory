import { productCategories } from "../types/product";

// 카테고리이름으로 한글라벨
export function getCategoryLabel(value: string) {
  const category = productCategories.find((c) => c.value === value);
  return category?.label ?? value;
}

// 서브 카테고리 한글 라벨 
export function getSubCategoryLabel(value: string) {
  for (const category of productCategories) {
    const type = category.types.find((type) => type.value === value);
    if (type) return type.label;
  }
  return value;
}