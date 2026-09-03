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
    // 신규 항목을 처음 저장할 때만 넘겨준다. 수량만 바뀐 기존 항목
    // 저장 시에는 넘기지 않아서, 이미 체크해둔 purchased 값이
    // 수량 변경 때마다 덮어써지지 않게 한다.
    purchased?: boolean;
  }
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("cart_items").upsert(
    {
      user_id: userId,
      product_id: item.productId,
      option_id: item.optionId,
      quantity: item.quantity,
      ...(item.purchased !== undefined ? { purchased: item.purchased } : {}),
    },
    { onConflict: "user_id,product_id,option_key" }
  );

  if (error) {
    console.error("장바구니 저장 실패:", error);
  }
}

// "구매 완료" 개인 체크 토글 전용 저장. quantity는 건드리지 않는다
// (upsert 시 넘기지 않은 컬럼은 기존 값이 그대로 유지됨).
export async function savePurchased(
  userId: string,
  item: {
    productId: string;
    optionId: string | null;
    purchased: boolean;
  }
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("cart_items").upsert(
    {
      user_id: userId,
      product_id: item.productId,
      option_id: item.optionId,
      purchased: item.purchased,
    },
    { onConflict: "user_id,product_id,option_key" }
  );

  if (error) {
    console.error("구매 완료 체크 저장 실패:", error);
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
      purchased: item.purchased,
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