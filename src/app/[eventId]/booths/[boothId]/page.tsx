import ProductExplorer from "@/src/component/product/ProductExplorer";
import { createClient } from "@/src/lib/supabase/server";
import { mockProducts } from "@/src/mocks/products";
import { mockArtists } from "@/src/mocks/user";
import { Booth } from "@/src/types/booth";
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

  const booth: Booth = {
    id: boothData.id,
    eventId: boothData.event_id,
    boothNumber: boothData.booth_number,
    boothName: boothData.booth_name,
    artistName: boothData.artist_name,
    artistIds: boothData.artist_ids ?? [],
    category: boothData.category,
    description: boothData.description,
  };

  const products = mockProducts.filter(
    (product) => product.boothId === booth.id
  );
  const artists = mockArtists.filter(
    (artist) => booth.artistIds.includes(artist.id)
  );

  return (
    <div>
      <h1>{booth.boothName}</h1>
      <p>부스번호: {booth.boothNumber}</p>
      <p>
        작가: {artists.map((artist) => artist.name).join(", ")}
      </p>
      <p>구분: {booth.category}</p>
      <p>선입금 링크: </p>
      <h2 className="pt-24">판매 제품</h2>

      <Suspense fallback={<div>불러오는 중...</div>}>
        <ProductExplorer products={products} />
      </Suspense>
    </div>
  );
}