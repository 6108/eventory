import { createClient } from "@/src/lib/supabase/client";
import type { CartItem } from "@/src/types/cart";

export async function getMyCartItems(userId: string): Promise<CartItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id, quantity, option_id,
      products (
        id, name, price, main_image, purchase_limit, remaining_quantity,
        booths ( id, booth_name, booth_number )
      ),
      product_options ( id, name, price, remaining_quantity )
    `)
    .eq("user_id", userId);

  if (error) {
    console.error("장바구니 조회 실패:", error);
    return [];
  }

  return (data ?? [])
    .map((row) => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products;
      const booth = product
        ? Array.isArray(product.booths)
          ? product.booths[0]
          : product.booths
        : null;

      const option = row.option_id
        ? Array.isArray(row.product_options)
          ? row.product_options[0]
          : row.product_options
        : null;

      if (!product || !booth) return null;

      return {
        productId: product.id,
        boothId: booth.id,
        optionId: row.option_id,
        productName: product.name,
        boothName: booth.booth_name,
        boothNumber: booth.booth_number,
        optionName: option?.name ?? null,
        price: option?.price ?? product.price,
        image: product.main_image,
        quantity: row.quantity,
        remainingQuantity: option
          ? option.remaining_quantity
          : product.remaining_quantity,
        purchaseLimit: product.purchase_limit,
      } satisfies CartItem;
    })
    .filter((item): item is CartItem => item !== null);
}