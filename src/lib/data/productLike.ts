// src/lib/data/productLike.ts
import { createClient } from "@/src/lib/supabase/server";
import { LikedProduct, ProductCategory, ProductOption, ProductSubCategory } from "@/src/types/product";

// Supabase가 product_likes -> products -> product_options로 이어지는
// 이중 임베드 관계는 타입을 제대로 못 좁혀서 product_options가 any[]로 새는 문제가 있어
// 실제로 select한 컬럼 모양을 직접 명시해준다.
type RawProductOption = {
  id: string;
  name: string;
  price: number | null;
  initial_quantity: number | null;
  remaining_quantity: number | null;
};

type RawLikedProduct = {
  id: string;
  booth_id: string;
  artist_ids: string[] | null;
  artist_names: string[] | null;
  main_image: string | null;
  sample_images: string[] | null;
  name: string;
  price: number;
  category: string;
  sub_category: string;
  remaining_quantity: number | null;
  purchase_limit: number | null;
  booths: { booth_name: string; booth_number: string } | null;
  product_options: RawProductOption[] | null;
};

// 내가 좋아요한 상품 목록 조회 (좋아요 모아보기 페이지용)
export async function getLikedProducts(userId: string): Promise<LikedProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_likes")
    .select(
      `
      id, created_at,
      products (
        id, booth_id, artist_ids, artist_names, main_image, sample_images, name, price,
        category, sub_category, remaining_quantity, purchase_limit,
        booths ( booth_name, booth_number ),
        product_options ( id, name, price, initial_quantity, remaining_quantity )
      )
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("좋아요한 상품 조회 실패:", error);
    return [];
  }

  return (data ?? [])
    .map((like) => {
      const rawProduct = Array.isArray(like.products) ? like.products[0] : like.products;
      const product = rawProduct as RawLikedProduct | null;
      if (!product) return null;

      return {
        likeId: like.id,
        likedAt: like.created_at,
        product: {
          id: product.id,
          boothId: product.booth_id,
          boothName: product.booths?.booth_name ?? "",
          boothNumber: product.booths?.booth_number ?? "",
          artistIds: product.artist_ids ?? [],
          artistNames: product.artist_names ?? [],
          mainImage: product.main_image ?? "",
          sampleImages: product.sample_images ?? [],
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
        },
      };
    })
    .filter((item): item is LikedProduct => item !== null);
}