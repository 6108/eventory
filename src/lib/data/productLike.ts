// src/lib/data/productLike.ts
import { createClient } from "@/src/lib/supabase/client";

// 내가 이 상품에 좋아요 눌렀는지 조회
export async function getMyProductLike(
  productId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient();

  const { data } = await supabase
    .from("product_likes")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();

  return !!data;
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