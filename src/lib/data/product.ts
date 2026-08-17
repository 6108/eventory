// src/lib/data/product.ts
import { createClient } from "@/src/lib/supabase/server";
import { Product, ProductSummary } from "@/src/types/product";

// 상품(요약버전) 조회 - boothId 주면 그 부스만, 안 주면 전체
export async function getProductSummaries(
  boothId?: string
): Promise<ProductSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, booth_id, artist_ids, artist_names, main_image_url, name, price, category, sub_category"
    )
    .order("created_at", { ascending: false });

  if (boothId) {
    query = query.eq("booth_id", boothId);
  }

  const { data: productData, error } = await query;

  if (error) {
    console.error("상품 조회 실패:", error);
    return [];
  }

  return (productData ?? []).map((product) => ({
    id: product.id,
    boothId: product.booth_id,
    artistIds: product.artist_ids ?? [],
    artistNames: product.artist_names ?? [],
    mainImage: product.main_image_url,
    name: product.name,
    price: product.price,
    category: product.category,
    subCategory: product.sub_category,
  }));
}

// 단일 상품 상세 조회
export async function getProduct(productId: string): Promise<Product | null> {
  const supabase = await createClient();

  const { data: productData, error } = await supabase
    .from("products")
    .select(
      "id, booth_id, main_image_url, sample_images, name, price, category, sub_category, total_quantity, purchase_limit, description, options, artist_ids, artist_names"
    )
    .eq("id", productId)
    .single();

  if (error || !productData) {
    console.error("상품 조회 실패:", error);
    return null;
  }

  return {
    id: productData.id,
    boothId: productData.booth_id,
    artistIds: productData.artist_ids ?? [],
    artistNames: productData.artist_names ?? [],
    mainImage: productData.main_image_url,
    sampleImages: productData.sample_images ?? [],
    name: productData.name,
    price: productData.price,
    totalQuantity: productData.total_quantity,
    purchaseLimit: productData.purchase_limit,
    description: productData.description ?? "",
    options: productData.options ?? [],
    category: productData.category,
    subCategory: productData.sub_category,
  };
}