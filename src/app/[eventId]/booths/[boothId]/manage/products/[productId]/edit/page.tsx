// src/app/[eventId]/booths/[boothId]/manage/products/[productId]/edit/page.tsx
import ProductForm from "@/src/component/form/ProductForm";
import { getProduct } from "@/src/lib/data/product";
import { getBoothArtists } from "@/src/lib/data/artist";

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

  const product = await getProduct(productId, boothId);

  if (!product) {
    return <div>상품이 없습니다.</div>;
  }

  const artists = await getBoothArtists(boothId);

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="mb-8 text-xl font-semibold text-white">상품 수정</h1>
      <ProductForm
        eventId={eventId}
        boothId={boothId}
        productId={productId}
        product={product}
        artists={artists}
      />
    </div>
  );
}