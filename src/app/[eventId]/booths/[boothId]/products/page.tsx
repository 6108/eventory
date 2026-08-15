import ProductExplorer from "@/src/component/product/ProductExplorer";
import { createClient } from "@/src/lib/supabase/server";
import { Product } from "@/src/types/product";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{
    eventId: string;
    boothId: string;
  }>;
}) {
  const { boothId } = await params;

  const supabase = await createClient();

  const { data: productData, error } = await supabase
    .from("products")
    .select(
      "id, booth_id, main_image_url, sample_images, name, price, category, sub_category, total_quantity, purchase_limit, description, options, artist_ids"
    )
    .eq("booth_id", boothId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("상품 조회 실패:", error);

    return (
      <div className="px-4 py-6">
        상품을 불러오지 못했습니다.
      </div>
    );
  }

  const products: Product[] = (productData ?? []).map((product) => ({
    id: product.id,
    boothId: product.booth_id,
    mainImage: product.main_image_url,
    sampleImages: product.sample_images ?? [],
    name: product.name,
    price: product.price,
    category: product.category,
    subCategory: product.sub_category,
    totalQuantity: product.total_quantity,
    purchaseLimit: product.purchase_limit,
    description: product.description,
    options: product.options ?? [],
    artistIds: product.artist_ids ?? [],
  }));

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-40 py-6">
      <Suspense fallback={<div>불러오는 중...</div>}>
        <ProductExplorer products={products} />
      </Suspense>
    </div>
  );
}