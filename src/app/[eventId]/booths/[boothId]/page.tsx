import ProductExplorer from "@/src/component/product/ProductExplorer";
import { createClient } from "@/src/lib/supabase/server";
import { mockArtists } from "@/src/mocks/user";
import { Product } from "@/src/types/product";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ boothId: string }>;
}) {
  const { boothId } = await params;

  const supabase = await createClient();

  const { data: boothData } = await supabase
    .from("booths")
    .select(
      "id, event_id, booth_number, booth_name, artist_name, artist_ids, category, description"
    )
    .eq("id", boothId)
    .single();

  if (!boothData) {
    return <div>부스를 찾을 수 없습니다.</div>;
  }

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select(
      "id, booth_id, main_image_url, sample_images, name, price, category, sub_category, total_quantity, purchase_limit, description, options, artist_ids"
    )
    .eq("booth_id", boothId);

  if (productError) {
    console.error("상품 조회 실패:", productError);

    return <div>상품을 불러오지 못했습니다.</div>;
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

  const artists = mockArtists.filter((artist) =>
    (boothData.artist_ids ?? []).includes(artist.id)
  );

  return (
    <div>
      <h1>{boothData.booth_name}</h1>

      <p>부스번호: {boothData.booth_number}</p>

      <p>
        작가: {artists.map((artist) => artist.name).join(", ")}
      </p>

      <p>구분: {boothData.category}</p>

      <p>선입금 링크: </p>

      <h2 className="pt-24">판매 제품</h2>

      <Suspense fallback={<div>불러오는 중...</div>}>
        <ProductExplorer products={products} />
      </Suspense>
    </div>
  );
}