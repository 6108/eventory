"use client";

import { createClient } from "@/src/lib/supabase/client";
import type { CartItem } from "@/src/types/cart";

// (user_id, product_id option_id) 조합으로 서버 장바구니에 upsert.
export async function saveCartItem(
  userId: string,
  item: {
    productId: string;
    optionId: string | null;
    quantity: number;
  }
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("cart_items").upsert(
    {
      user_id: userId,
      product_id: item.productId,
      option_id: item.optionId,
      quantity: item.quantity,
    },
    { onConflict: "user_id,product_id,option_key" }
  );

  if (error) {
    console.error("장바구니 저장 실패:", error);
  }
}

export async function saveLocalCartToServer(
  userId: string,
  items: CartItem[]
): Promise<void> {
  for (const item of items) {
    await saveCartItem(userId, {
      productId: item.productId,
      optionId: item.optionId,
      quantity: item.quantity,
    });
  }
}

export async function deleteCartItem(
  userId: string,
  productId: string,
  optionId: string | null
): Promise<void> {
  const supabase = createClient();

  let query = supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  query = optionId
    ? query.eq("option_id", optionId)
    : query.is("option_id", null);

  const { error } = await query;

  if (error) {
    console.error("장바구니 삭제 실패:", error);
  }
}

export async function clearServerCart(userId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("장바구니 전체 삭제 실패:", error);
  }
}