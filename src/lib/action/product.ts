// src/lib/data/productLike.ts
import { createClient } from "@/src/lib/supabase/client";

// 내가 좋아요 누른 상품 id 전체 조회 (페이지당 1회만 호출)
export async function getMyLikedProductIds(userId: string): Promise<string[]> {
  const supabase = createClient();

  const { data } = await supabase
    .from("product_likes")
    .select("product_id")
    .eq("user_id", userId);

  return (data ?? []).map((row) => row.product_id);
}

// 상품에 달린 전체 좋아요 개수 조회 (작가 본인용)
export async function getProductLikeCount(productId: string): Promise<number> {
  const supabase = createClient();

  const { count } = await supabase
    .from("product_likes")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  return count ?? 0;
}