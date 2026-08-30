// src/lib/data/product.ts
import { createClient } from "@/src/lib/supabase/server";
import {
  PosProduct,
  Product,
  ProductCategory,
  ProductOption,
  ProductSubCategory,
  ProductSummary,
  productCategories,
} from "@/src/types/product";

// 한 페이지에 가져올 상품 개수. 전체 상품 목록(/[eventId]/products)처럼
// 부스 수 제한이 없는 화면에서 데이터가 무한정 늘어나는 걸 막기 위한 값.
export const PRODUCTS_PAGE_SIZE = 24;

export type ProductListFilter = {
  // 특정 부스들로 범위 제한 (팔로우한 부스만 보기 등). undefined면 전체.
  boothIds?: string[];
  category?: ProductCategory | "ALL";
  subCategory?: ProductSubCategory | "ALL";
};

export type ProductFilterOptions = {
  categories: ProductCategory[];
  subCategories: ProductSubCategory[];
};

export type ProductCategoryCounts = {
  // 카테고리별 상품 개수. 실제 존재하는(개수 > 0) 카테고리만 포함한다.
  categories: { value: ProductCategory; count: number }[];
  // 선택된 category(filter.category) 내부의 서브카테고리별 개수.
  // filter.category가 없거나 "ALL"이면 빈 배열.
  subCategories: { value: ProductSubCategory; count: number }[];
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

// 카테고리 / 서브카테고리별 상품 "개수" 조회 (페이지네이션과 완전히 분리된 API에서 사용)
//
// category 필터가 선택되어 있어도 categories 개수는 전체 범위에서 계산하고,
// subCategories 개수만 선택된 category 내부에서 계산한다.
// 개수가 0인 카테고리/서브카테고리는 결과에 아예 포함하지 않는다
// (호출하는 쪽에서 "0이면 칩 숨기기"를 따로 구현할 필요 없게).
export async function getProductCategoryCounts(
  filter: ProductListFilter = {}
): Promise<ProductCategoryCounts> {
  // 팔로우한 부스가 하나도 없는 경우
  if (filter.boothIds && filter.boothIds.length === 0) {
    return {
      categories: [],
      subCategories: [],
    };
  }

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("category, sub_category");

  // 현재 상품 목록과 동일한 범위만 사용
  if (filter.boothIds) {
    query = query.in("booth_id", filter.boothIds);
  }

  // 중요:
  // 여기서는 category 필터를 걸지 않는다.
  // 그래야 현재 category가 acrylic이어도
  // 전체 카테고리 목록은 acrylic, sticker, book 등 실제 존재하는 것들이 전부 나온다.

  const { data, error } = await query;

  if (error) {
    console.error("작품 카테고리 개수 조회 실패:", error);

    return {
      categories: [],
      subCategories: [],
    };
  }

  const categoryCountMap = new Map<ProductCategory, number>();
  const subCategoryCountMap = new Map<ProductSubCategory, number>();

  for (const product of data ?? []) {
    if (product.category) {
      const category = product.category as ProductCategory;
      categoryCountMap.set(category, (categoryCountMap.get(category) ?? 0) + 1);
    }

    // 선택된 category 내부의 서브카테고리만 집계
    if (
      filter.category &&
      filter.category !== "ALL" &&
      product.category === filter.category &&
      product.sub_category
    ) {
      const subCategory = product.sub_category as ProductSubCategory;
      subCategoryCountMap.set(
        subCategory,
        (subCategoryCountMap.get(subCategory) ?? 0) + 1
      );
    }
  }

  const categories = productCategories
    .map((item) => item.value)
    .filter((category) => categoryCountMap.has(category))
    .map((value) => ({ value, count: categoryCountMap.get(value)! }));

  const subCategories =
    filter.category && filter.category !== "ALL"
      ? productCategories
        .find((item) => item.value === filter.category)
        ?.types
        .map((item) => item.value)
        .filter((subCategory) => subCategoryCountMap.has(subCategory))
        .map((value) => ({ value, count: subCategoryCountMap.get(value)! })) ?? []
      : [];

  return { categories, subCategories };
}

// 작품(요약버전) 페이지 단위 조회 - 전체 상품 목록처럼 데이터가 계속 늘어나는
// 화면에서 사용. 부스/카테고리 필터는 클라이언트가 아니라 여기(DB 쿼리)에서 처리한다.
export async function getProductSummariesPaged(
  page: number,
  filter: ProductListFilter = {},
  pageSize: number = PRODUCTS_PAGE_SIZE
): Promise<ProductListPage> {
  // 팔로우한 부스가 하나도 없는 경우처럼, boothIds가 빈 배열로 명시된 경우엔
  // 쿼리를 아예 안 날리고 빈 결과로 처리
  if (filter.boothIds && filter.boothIds.length === 0) {
    return {
      products: [],
      hasMore: false,
      nextPage: null,
      total: 0,
    };
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

    return {
      products: [],
      hasMore: false,
      nextPage: null,
      total: null,
    };
  }

  // getProductSummaries와 동일한 변환 로직
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

  // count가 없으면 이번 페이지가 꽉 찼는지로 대략 판단
  const hasMore =
    count !== null
      ? to + 1 < count
      : products.length === pageSize;

  return {
    products,
    hasMore,
    nextPage: hasMore ? safePage + 1 : null,
    total: count ?? null,
  };
}

// 유저가 팔로우한 부스 id 목록
async function getFollowedBoothIds(userId: string): Promise<string[]> {
  const supabase = await createClient();

  const { data: follows, error: followError } = await supabase
    .from("booth_follows")
    .select("booth_id")
    .eq("user_id", userId);

  if (followError) {
    console.error("팔로우 부스 조회 실패:", followError);
    return [];
  }

  return (follows ?? []).map((f) => f.booth_id);
}

// 내가 팔로우한 부스들의 작품만 조회
export async function getFollowedBoothProducts(
  userId: string
): Promise<ProductSummary[]> {
  const boothIds = await getFollowedBoothIds(userId);

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
  const boothIds = await getFollowedBoothIds(userId);

  return getProductSummariesPaged(
    page,
    { ...filter, boothIds },
    pageSize
  );
}

// 내가 팔로우한 부스들 범위에서 카테고리별 개수 조회
export async function getFollowedBoothCategoryCounts(
  userId: string,
  filter: Omit<ProductListFilter, "boothIds"> = {}
): Promise<ProductCategoryCounts> {
  const boothIds = await getFollowedBoothIds(userId);

  return getProductCategoryCounts({ ...filter, boothIds });
}

// 단일 작품 상세 조회 (boothId 주면 해당 부스 소유 검증까지)
export async function getProduct(
  productId: string,
  boothId?: string
): Promise<Product | null> {
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

// POS 작품 조회
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

// 장바구니 동기화용
export type ProductLimitInfo = {
  productId: string;
  optionId: string | null;
  purchaseLimit: number | null;
  remainingQuantity: number | null;
};

// 장바구니 동기화용 - 여러 상품의 "지금" 구매제한/재고만 가볍게 조회.
// 옵션이 있는 상품은 옵션별 remainingQuantity를 optionId 기준으로 함께 내려준다.
export async function getProductLimits(
  productIds: string[]
): Promise<ProductLimitInfo[]> {
  if (productIds.length === 0) return [];

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `id, remaining_quantity, purchase_limit,
      product_options ( id, remaining_quantity )`
    )
    .in("id", productIds);

  if (error) {
    console.error("구매제한/재고 조회 실패:", error);
    return [];
  }

  const result: ProductLimitInfo[] = [];

  for (const product of data ?? []) {
    const options = product.product_options ?? [];

    if (options.length === 0) {
      result.push({
        productId: product.id,
        optionId: null,
        purchaseLimit: product.purchase_limit,
        remainingQuantity: product.remaining_quantity,
      });
      continue;
    }

    for (const option of options) {
      result.push({
        productId: product.id,
        optionId: option.id,
        purchaseLimit: product.purchase_limit,
        remainingQuantity: option.remaining_quantity,
      });
    }
  }

  return result;
}