"use client";

import { createClient } from "@/src/lib/supabase/client";
import type { CartItem } from "@/src/types/cart";

async function findServerCartItem(
  userId: string,
  productId: string,
  optionId: string | null
) {
  const supabase = createClient();

  let query = supabase
    .from("cart_items")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId);

  query = optionId
    ? query.eq("option_id", optionId)
    : query.is("option_id", null);

  const { data, error } = await query.maybeSingle();

  if (error) {
    console.error("장바구니 항목 조회 실패:", error);
    return null;
  }

  return data;
}

export async function saveCartItem(
  userId: string,
  item: {
    productId: string;
    optionId: string | null;
    quantity: number;
  }
): Promise<void> {
  const supabase = createClient();

  const existing = await findServerCartItem(
    userId,
    item.productId,
    item.optionId
  );

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: item.quantity })
      .eq("id", existing.id);

    if (error) {
      console.error("장바구니 저장 실패:", error);
    }

    return;
  }

  const { error } = await supabase.from("cart_items").insert({
    user_id: userId,
    product_id: item.productId,
    option_id: item.optionId,
    quantity: item.quantity,
  });

  if (error) {
    console.error("장바구니 추가 실패:", error);
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