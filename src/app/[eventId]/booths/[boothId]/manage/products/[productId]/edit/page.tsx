// src/app/[eventId]/booths/[boothId]/manage/products/[productId]/edit/page.tsx
import { createClient } from "@/src/lib/supabase/server";
import EditProductForm from "@/src/component/form/EditProductForm";

export default async function Page({
  params,
}: {
  params: Promise<{
    eventId: string;
    boothId: string;
    productId: string;
  }>;
}) {
  const { eventId, boothId, productId } = await params;

  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      "name, price, category, sub_category, total_quantity, purchase_limit, description, main_image_url"
    )
    .eq("id", productId)
    .eq("booth_id", boothId)
    .single();

  if (!product) {
    return <div>상품을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="mb-8 text-xl font-semibold text-white">상품 수정</h1>
      <EditProductForm
        eventId={eventId}
        boothId={boothId}
        productId={productId}
        product={product}
      />
    </div>
  );
}