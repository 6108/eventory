import { createClient } from "@/src/lib/supabase/server";
import {
  PosProduct,
  Product,
  ProductCategory,
  ProductListPage,
  ProductOption,
  ProductSubCategory,
  ProductSummary,
} from "@/src/types/product";

export const PRODUCTS_PAGE_SIZE = 24;


export async function getProductSummaries(
  boothId?: string | string[],
  includeHidden = false
): Promise<ProductSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `id, booth_id, artist_ids, artist_names, main_image, sample_images, name, price,
    category, sub_category, initial_quantity, remaining_quantity, purchase_limit, visible,
    booths ( booth_name, booth_number ),
    product_options ( id, name, price, initial_quantity, remaining_quantity )`
    );

  if (!includeHidden) {
    query = query.eq("visible", true);
  }

  query = query.order("created_at", { ascending: false });

  if (Array.isArray(boothId)) {
    query = query.in("booth_id", boothId);
  } else if (boothId) {
    query = query.eq("booth_id", boothId);
  }

  const { data: productData, error } = await query;

  if (error) {
    console.error("작품 조회 실패:", error);
    console.error("작품 조회 실패 상세:", JSON.stringify(error, null, 2));
    return [];
  }

  return (productData ?? []).map((product) => ({
    id: product.id,
    boothId: product.booth_id,
    boothName: product.booths?.booth_name ?? "",
    boothNumber: product.booths?.booth_number ?? "",
    artistIds: product.artist_ids ?? [],
    artistNames: product.artist_names ?? [],
    sampleImages: product.sample_images ?? [],
    mainImage: product.main_image ?? "",
    name: product.name,
    price: product.price,
    category: product.category as ProductCategory,
    subCategory: product.sub_category as ProductSubCategory,
    remainingQuantity: product.remaining_quantity,
    purchaseLimit: product.purchase_limit,
    visible: product.visible ?? true,
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

// 카테고리 없으면 ALL 조회
export async function getProductSummariesPaged(
  page: number,
  category?: ProductCategory,
  subCategory?: ProductSubCategory,
  pageSize: number = PRODUCTS_PAGE_SIZE
): Promise<ProductListPage> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `id, booth_id, artist_ids, artist_names, main_image, sample_images, name, price,
      category, sub_category, initial_quantity, remaining_quantity, purchase_limit, visible,
      booths ( booth_name, booth_number ),
      product_options ( id, name, price, initial_quantity, remaining_quantity )`,
      { count: "exact" }
    )
    .eq("visible", true)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (subCategory) {
    query = query.eq("sub_category", subCategory);
  }

  const safePage = Number.isFinite(page) && page >= 0 ? page : 0;
  const from = safePage * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("작품 목록 조회 실패:", error);

    return {
      products: [],
      hasMore: false,
      nextPage: null,
      total: null,
    };
  }

  const products = (data ?? []).map((product) => ({
    id: product.id,
    boothId: product.booth_id,
    boothName: product.booths?.booth_name ?? "",
    boothNumber: product.booths?.booth_number ?? "",
    artistIds: product.artist_ids ?? [],
    artistNames: product.artist_names ?? [],
    sampleImages: product.sample_images ?? [],
    mainImage: product.main_image ?? "",
    name: product.name,
    price: product.price,
    category: product.category as ProductCategory,
    subCategory: product.sub_category as ProductSubCategory,
    remainingQuantity: product.remaining_quantity,
    purchaseLimit: product.purchase_limit,
    visible: product.visible ?? true,
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

  const hasMore =
    count !== null ? to + 1 < count : products.length === pageSize;

  return {
    products,
    hasMore,
    nextPage: hasMore ? safePage + 1 : null,
    total: count ?? null,
  };
}

export async function getFollowedBoothProductsPaged(
  userId: string,
  page: number,
  category?: ProductCategory,
  subCategory?: ProductSubCategory,
  pageSize: number = PRODUCTS_PAGE_SIZE
): Promise<ProductListPage> {
  const supabase = await createClient();

  const { data: follows, error: followError } = await supabase
    .from("booth_follows")
    .select("booth_id")
    .eq("user_id", userId);

  if (followError) {
    console.error("팔로우 부스 조회 실패:", followError);

    return {
      products: [],
      hasMore: false,
      nextPage: null,
      total: null,
    };
  }

  const boothIds = (follows ?? []).map((follow) => follow.booth_id);

  if (boothIds.length === 0) {
    return {
      products: [],
      hasMore: false,
      nextPage: null,
      total: 0,
    };
  }

  let query = supabase
    .from("products")
    .select(
      `id, booth_id, artist_ids, artist_names, main_image, sample_images, name, price,
      category, sub_category, initial_quantity, remaining_quantity, purchase_limit,visible,
      booths ( booth_name, booth_number ),
      product_options ( id, name, price, initial_quantity, remaining_quantity )`,
      { count: "exact" }
    )
    .in("booth_id", boothIds)
    .eq("visible", true)
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (subCategory) {
    query = query.eq("sub_category", subCategory);
  }

  const safePage = Number.isFinite(page) && page >= 0 ? page : 0;
  const from = safePage * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("팔로우 부스 작품 조회 실패:", error);

    return {
      products: [],
      hasMore: false,
      nextPage: null,
      total: null,
    };
  }

  const products = (data ?? []).map((product) => ({
    id: product.id,
    boothId: product.booth_id,
    boothName: product.booths?.booth_name ?? "",
    boothNumber: product.booths?.booth_number ?? "",
    artistIds: product.artist_ids ?? [],
    artistNames: product.artist_names ?? [],
    sampleImages: product.sample_images ?? [],
    mainImage: product.main_image ?? "",
    name: product.name,
    price: product.price,
    category: product.category as ProductCategory,
    subCategory: product.sub_category as ProductSubCategory,
    remainingQuantity: product.remaining_quantity,
    purchaseLimit: product.purchase_limit,
    visible: product.visible ?? true,
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

  const hasMore =
    count !== null ? to + 1 < count : products.length === pageSize;

  return {
    products,
    hasMore,
    nextPage: hasMore ? safePage + 1 : null,
    total: count ?? null,
  };
}



// 특정 상품 조회
export async function getProduct(productId: string, boothId?: string): Promise<Product | null> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `id, booth_id, main_image, sample_images, name, price, category, sub_category,
      initial_quantity, remaining_quantity, purchase_limit, description, artist_ids, artist_names, visible,
      product_options ( id, name, price, initial_quantity, remaining_quantity )`
    )
    .eq("id", productId)
    .eq("visible", true);

  if (boothId) {
    query = query.eq("booth_id", boothId);
  }

  const { data: productData, error } = await query.single();

  if (error || !productData) {
    console.error("작품 조회 실패:", error);
    return null;
  }

  return {
    id: productData.id,
    boothId: productData.booth_id,
    artistIds: productData.artist_ids ?? [],
    artistNames: productData.artist_names ?? [],
    mainImage: productData.main_image ?? "",
    sampleImages: productData.sample_images ?? [],
    name: productData.name,
    price: productData.price,
    initialQuantity: productData.initial_quantity,
    remainingQuantity: productData.remaining_quantity,
    purchaseLimit: productData.purchase_limit,
    description: productData.description ?? "",
    visible: productData.visible ?? true,
    options: (productData.product_options ?? []).map(
      (option): ProductOption => ({
        id: option.id,
        name: option.name,
        price: option.price,
        initialQuantity: option.initial_quantity,
        remainingQuantity: option.remaining_quantity,
      })
    ),
    category: productData.category as ProductCategory,
    subCategory: productData.sub_category as ProductSubCategory,
  };
}

// 포스기 상품들 조회
export async function getPosProducts(
  boothId: string
): Promise<PosProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, price, main_image, category, sub_category,
      initial_quantity, remaining_quantity, purchase_limit,
      product_options ( id, name, price, initial_quantity, remaining_quantity )`
    )
    .eq("booth_id", boothId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("POS 작품 조회 실패:", error);
    return [];
  }

  return (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    mainImage: product.main_image ?? "",
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