import { ProductCategory, ProductCategoryCounts, ProductSubCategory } from "@/src/types/product";
import { createClient } from "../supabase/server";

export async function getProductCategoryCounts(boothIds?: string[]):
  Promise<ProductCategoryCounts> {
  const supabase = await createClient();

  let query = supabase.
    from("products").
    select("category, sub_category");

  if (boothIds) {
    query = query.
      in("booth_id", boothIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error("카테고리 개수 조회 실패:", error);
    return { categories: [], subCategories: [] };
  }

  const categoryMap = new Map<ProductCategory, number>();
  const subCategoryMap = new Map<ProductSubCategory, number>();

  for (const row of data ?? []) {
    const category = row.category as ProductCategory;
    const subCategory = row.sub_category as ProductSubCategory;

    if (category) categoryMap.set(category,
      (categoryMap.get(category) ?? 0) + 1);
    if (subCategory) subCategoryMap.set(subCategory,
      (subCategoryMap.get(subCategory) ?? 0) + 1);
  }

  return {
    categories: Array.from(categoryMap.entries()).
      map(([value, count]) => ({ value, count })),
    subCategories: Array.from(subCategoryMap.entries()).
      map(([value, count]) => ({ value, count })),
  };
}

export async function getFollowedBoothCategoryCounts(userId: string):
  Promise<ProductCategoryCounts> {
  const supabase = await createClient();
  const { data: follows, error } = await supabase.
    from("booth_follows").
    select("booth_id").
    eq("user_id", userId);

  if (error) {
    console.error("팔로우 부스 조회 실패:", error);
    return { categories: [], subCategories: [] };
  }

  const boothIds = (follows ?? []).map((f) => f.booth_id);
  if (boothIds.length === 0) return { categories: [], subCategories: [] };

  return getProductCategoryCounts(boothIds);
}