import Image from "next/image";
import { mockProducts } from "@/src/mocks/products";
import { mockBooths } from "@/src/mocks/booths";
import { mockArtists } from "@/src/mocks/user";
import { getCategoryLabel, getSubCategoryLabel } from "@/src/utils/product";
import Link from "next/link";

export default async function Page({
  params,
}: {
  params: Promise<{
    eventId: string;
    productId: string;
  }>;
}) {
  const { eventId, productId } = await params;

  const product = mockProducts.find(
    (product) => product.id == productId
  );

  if (!product) {
    return <div>상품을 찾을 수 없습니다.</div>;
  }

  const booth = mockBooths.find(
    (booth) => booth.id === product.boothId
  );

  const artists = mockArtists.filter((artist) =>
    product.artistIds?.includes(artist.id)
  );

  return (
    <div className="flex flex-col gap-6 px-40">
      {/* 이미지 */}
      <div className="relative aspect-square w-1/4 max-w-md">
        <Image
          src={product.mainImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 448px"
          className="rounded object-cover"
          priority
        />
      </div>

      {/* 정보 */}
      <div className="flex flex-col gap-2">
        <div className="flex min-w-0 items-center text-sm text-zinc-500">
          <Link
            href={`/${eventId}/booths/${booth?.id}`}
            className="max-w-32 truncate hover:underline"
          >
            {booth?.boothName}
          </Link>

          <span className="shrink-0">{" > "}</span>

          <Link
            href={`/${eventId}/booths/${booth?.id}?category=${product.category}`}
          >
            {getCategoryLabel(product.category)}
          </Link>

          <span className="shrink-0">{" > "}</span>

          <Link
            href={`/${eventId}/booths/${booth?.id}?category=${product.category}&subCategory=${product.subCategory}`}
          >
            {getSubCategoryLabel(product.subCategory)}
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-zinc-500">
            {artists.map((a) => a.artistName).join(", ")}
          </p>
          <h1 >{product.name}</h1>
          <p className="text-lg">{product.price.toLocaleString()}원</p>
        </div>

        <p>
          {product.description}
        </p>
      </div>

      {/* 옵션 */}
      {product.options && product.options.length > 0 && (
        <div>
          <h2>옵션</h2>

          <ul>
            {product.options.map((option) => (
              <li key={option.id}>
                {option.name} ({option.quantity ?? "무제한"}개)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 재고 */}
      {product.totalQuantity && (
        <p>
          총 수량: {product.totalQuantity}개
        </p>
      )}

      {/* 구매 제한 */}
      {product.purchaseLimit && (
        <p>
          1인 구매 제한: {product.purchaseLimit}개
        </p>
      )}

      {/* 샘플 이미지 */}
      {product.sampleImages && product.sampleImages.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2>상세 이미지</h2>

          {product.sampleImages.map((image, index) => (
            <Image
              key={`${image}-${index}`}
              src={image}
              alt={product.name}
              width={800}
              height={800}
              className="rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
}