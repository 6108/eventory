// src/lib/data/productLike.ts
import { createClient } from "@/src/lib/supabase/server";
import { LikedProduct, ProductCategory, ProductSubCategory } from "@/src/types/product";

// 내가 좋아요한 상품 목록 조회 (좋아요 모아보기 페이지용)
export async function getLikedProducts(userId: string): Promise<LikedProduct[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_likes")
    .select(
      `
      id, created_at,
      products (
        id, booth_id, artist_ids, artist_names, main_image_url, name, price,
        category, sub_category, remaining_quantity
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
      const product = Array.isArray(like.products) ? like.products[0] : like.products;
      if (!product) return null;

      return {
        likeId: like.id,
        likedAt: like.created_at,
        product: {
          id: product.id,
          boothId: product.booth_id,
          artistIds: product.artist_ids ?? [],
          artistNames: product.artist_names ?? [],
          mainImage: product.main_image_url ?? "",
          name: product.name,
          price: product.price,
          category: product.category as ProductCategory,
          subCategory: product.sub_category as ProductSubCategory,
          remainingQuantity: product.remaining_quantity,
        },
      };
    })
    .filter((item): item is LikedProduct => item !== null);
}