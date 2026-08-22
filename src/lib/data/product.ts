// src/lib/data/product.ts
import { createClient } from "@/src/lib/supabase/server";
import { PosProduct, Product, ProductCategory, ProductOption, ProductSubCategory, ProductSummary } from "@/src/types/product";

// 상품(요약버전) 조회 - boothId 주면 그 부스만, 안 주면 전체
export async function getProductSummaries(boothId?: string): Promise<ProductSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `id, booth_id, artist_ids, artist_names, main_image_url, name, price, 
      category, sub_category, initial_quantity, remaining_quantity`
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
    mainImage: product.main_image_url ?? "",
    name: product.name,
    price: product.price,
    category: product.category as ProductCategory,
    subCategory: product.sub_category as ProductSubCategory,
    remainingQuantity: product.remaining_quantity
  }));
}

// 단일 상품 상세 조회 (boothId 주면 해당 부스 소유 검증까지)
export async function getProduct(productId: string, boothId?: string): Promise<Product | null> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `id, booth_id, main_image_url, sample_images, name, price, category, sub_category,
      initial_quantity, remaining_quantity, purchase_limit, description, artist_ids, artist_names,
      product_options ( id, name, price, initial_quantity, remaining_quantity )`
    )
    .eq("id", productId);

  if (boothId) {
    query = query.eq("booth_id", boothId);
  }

  const { data: productData, error } = await query.single();

  if (error || !productData) {
    console.error("상품 조회 실패:", error);
    return null;
  }

  return {
    id: productData.id,
    boothId: productData.booth_id,
    artistIds: productData.artist_ids ?? [],
    artistNames: productData.artist_names ?? [],
    mainImage: productData.main_image_url ?? "",
    sampleImages: productData.sample_images ?? [],
    name: productData.name,
    price: productData.price,
    initialQuantity: productData.initial_quantity,
    remainingQuantity: productData.remaining_quantity,
    purchaseLimit: productData.purchase_limit,
    description: productData.description ?? "",
    options: (productData.product_options ?? []).map((option): ProductOption => ({
      id: option.id,
      name: option.name,
      price: option.price,
      initialQuantity: option.initial_quantity,
      remainingQuantity: option.remaining_quantity,
    })),
    category: productData.category as ProductCategory,
    subCategory: productData.sub_category as ProductSubCategory,
  };
}

// POS 상품 조회
export async function getPosProducts(boothId: string): Promise<PosProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, price, main_image_url, category, sub_category,
      initial_quantity, remaining_quantity, purchase_limit,
      product_options ( id, name, price, initial_quantity, remaining_quantity )`
    )
    .eq("booth_id", boothId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("POS 상품 조회 실패:", error);
    return [];
  }

  return (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    mainImage: product.main_image_url ?? "",
    category: product.category as ProductCategory,
    subCategory: product.sub_category as ProductSubCategory,
    initialQuantity: product.initial_quantity,
    remainingQuantity: product.remaining_quantity,
    purchaseLimit: product.purchase_limit,
    options: (product.product_options ?? []).map(
      (option): ProductOption => ({
        id: option.id,
        name: option.name,
        price: option.price,
        initialQuantity: option.initial_quantity,
        remainingQuantity: option.remaining_quantity,
      })
    ),
  }));
}