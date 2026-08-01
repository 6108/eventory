import ProductList from "@/src/component/booth/ProductList";
import ProductListItem from "@/src/component/booth/ProductListItem";
import { mockBooths } from "@/src/mocks/booths";
import { mockProducts } from "@/src/mocks/products";
import { mockArtists } from "@/src/mocks/user";

export default async function Page({
  params,
}: {
  params: Promise<{ boothId: string }>;
}) {
  const { boothId } = await params;

  const booth = mockBooths.find((booth) => booth.id === boothId);

  if (!booth) {
    return <div>부스를 찾을 수 없습니다.</div>;
  }

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

      <h2>판매 제품</h2>

      <ProductList products={products} />

    </div>
  );
}