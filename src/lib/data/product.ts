// src/lib/data/product.ts
import { createClient } from "@/src/lib/supabase/server";
import { PosProduct, Product, ProductCategory, ProductOption, ProductSubCategory, ProductSummary } from "@/src/types/product";

// 한 페이지에 가져올 상품 개수. 전체 상품 목록(/[eventId]/products)처럼
// 부스 수 제한이 없는 화면에서 데이터가 무한정 늘어나는 걸 막기 위한 값.
export const PRODUCTS_PAGE_SIZE = 24;

export type ProductListFilter = {
  // 특정 부스들로 범위 제한 (팔로우한 부스만 보기 등). undefined면 전체.
  boothIds?: string[];
  category?: ProductCategory | "ALL";
  subCategory?: ProductSubCategory | "ALL";
};

export type ProductListPage = {
  products: ProductSummary[];
  hasMore: boolean;
  // 다음 요청에 쓸 페이지 번호. 더 없으면 null.
  nextPage: number | null;
  // 전체 개수. count 조회가 안 되는 예외 상황이면 null.
  total: number | null;
};

// 작품(요약버전) 조회 - boothId 주면 그 부스만, 배열이면 해당 부스들, 안 주면 전체
export async function getProductSummaries(
  boothId?: string | string[]
): Promise<ProductSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `id, booth_id, artist_ids, artist_names, main_image, sample_images, name, price, 
      category, sub_category, initial_quantity, remaining_quantity, purchase_limit,
      booths ( booth_name, booth_number ),
      product_options ( id, name, price, initial_quantity, remaining_quantity )`
    )
    .order("created_at", { ascending: false });

  if (Array.isArray(boothId)) {
    // 빈 배열이면 어차피 결과 없음이 맞으니 그대로 in([]) 호출 (Supabase가 빈 결과 반환)
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

// 작품(요약버전) 페이지 단위 조회 - 전체 상품 목록처럼 데이터가 계속 늘어나는
// 화면에서 사용. 부스/카테고리 필터는 클라이언트가 아니라 여기(DB 쿼리)에서 처리한다.
export async function getProductSummariesPaged(
  page: number,
  filter: ProductListFilter = {},
  pageSize: number = PRODUCTS_PAGE_SIZE
): Promise<ProductListPage> {
  // 팔로우한 부스가 하나도 없는 경우처럼, boothIds가 빈 배열로 명시된 경우엔
  // 쿼리를 아예 안 날리고 빈 결과로 처리 (in([])은 전체 조회로 오해될 수 있어 방어)
  if (filter.boothIds && filter.boothIds.length === 0) {
    return { products: [], hasMore: false, nextPage: null, total: 0 };
  }

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `id, booth_id, artist_ids, artist_names, main_image, sample_images, name, price, 
      category, sub_category, initial_quantity, remaining_quantity, purchase_limit,
      booths ( booth_name, booth_number ),
      product_options ( id, name, price, initial_quantity, remaining_quantity )`,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (filter.boothIds) {
    query = query.in("booth_id", filter.boothIds);
  }

  if (filter.category && filter.category !== "ALL") {
    query = query.eq("category", filter.category);
  }

  if (filter.subCategory && filter.subCategory !== "ALL") {
    query = query.eq("sub_category", filter.subCategory);
  }

  const safePage = Number.isFinite(page) && page >= 0 ? page : 0;
  const from = safePage * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("작품 목록 조회 실패:", error);
    return { products: [], hasMore: false, nextPage: null, total: null };
  }

  // getProductSummaries와 동일한 변환 로직을 여기서도 인라인으로 처리.
  // 별도 함수로 뽑아서 타입을 손으로 적으면 Supabase가 select 문마다 추론하는
  // 실제 타입과 어긋나기 쉬워서(널러블 여부 등), 각 쿼리 결과에서 TS가
  // 자동으로 추론한 타입 그대로 바로 변환하는 방식을 유지한다.
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

  // count가 없으면(권한 등으로 불가한 경우) 이번 페이지가 꽉 찼는지로 대략 판단
  const hasMore =
    count !== null ? to + 1 < count : products.length === pageSize;

  return {
    products,
    hasMore,
    nextPage: hasMore ? safePage + 1 : null,
    total: count ?? null,
  };
}

// 내가 팔로우한 부스들의 작품만 조회
export async function getFollowedBoothProducts(
  userId: string
): Promise<ProductSummary[]> {
  const supabase = await createClient();

  const { data: follows, error: followError } = await supabase
    .from("booth_follows")
    .select("booth_id")
    .eq("user_id", userId);

  if (followError) {
    console.error("팔로우 부스 조회 실패:", followError);
    return [];
  }

  const boothIds = (follows ?? []).map((f) => f.booth_id);

  // 팔로우한 부스가 하나도 없으면 쿼리 자체를 안 날리고 빈 배열 반환
  if (boothIds.length === 0) {
    return [];
  }

  return getProductSummaries(boothIds);
}

// 내가 팔로우한 부스들의 작품을 페이지 단위로 조회
export async function getFollowedBoothProductsPaged(
  userId: string,
  page: number,
  filter: Omit<ProductListFilter, "boothIds"> = {},
  pageSize: number = PRODUCTS_PAGE_SIZE
): Promise<ProductListPage> {
  const supabase = await createClient();

  const { data: follows, error: followError } = await supabase
    .from("booth_follows")
    .select("booth_id")
    .eq("user_id", userId);

  if (followError) {
    console.error("팔로우 부스 조회 실패:", followError);
    return { products: [], hasMore: false, nextPage: null, total: null };
  }

  const boothIds = (follows ?? []).map((f) => f.booth_id);

  return getProductSummariesPaged(
    page,
    { ...filter, boothIds },
    pageSize
  );
}

// 단일 작품 상세 조회 (boothId 주면 해당 부스 소유 검증까지)
export async function getProduct(productId: string, boothId?: string): Promise<Product | null> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `id, booth_id, main_image, sample_images, name, price, category, sub_category,
      initial_quantity, remaining_quantity, purchase_limit, description, artist_ids, artist_names,
      product_options ( id, name, price, initial_quantity, remaining_quantity )`
    )
    .eq("id", productId);

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

// POS 작품 조회
export async function getPosProducts(boothId: string): Promise<PosProduct[]> {
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