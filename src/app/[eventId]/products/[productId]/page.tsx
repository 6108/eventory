import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { getCategoryLabel, getSubCategoryLabel } from "@/src/utils/product";
import { getBooth } from "@/src/lib/data/booth";
import { getProduct } from "@/src/lib/data/product";
import AddToCartButton from "@/src/component/cart/AddToCartButton";

export default async function Page({
  params,
}: {
  params: Promise<{
    eventId: string;
    productId: string;
  }>;
}) {
  const { eventId, productId } = await params;

  const product = await getProduct(productId);

  if (!product) {
    return notFound();
  }

  const booth = await getBooth(product.boothId);

  if (!booth) {
    return <div>부스를 찾을 수 없습니다.</div>;
  }

  const sanitizedDescription = product.description
    ? DOMPurify.sanitize(product.description)
    : "";

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 md:px-10 lg:px-40 py-6">
      {/* 이미지 */}
      <div className="relative aspect-square w-full sm:w-1/2 md:w-1/3 lg:w-1/4 max-w-md mx-auto sm:mx-0">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 448px"
            className="rounded object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-zinc-100 text-sm text-zinc-400">
            이미지 없음
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-1 text-sm text-zinc-500">
          <Link
            href={`/${eventId}/booths/${booth.id}`}
            className="max-w-32 sm:max-w-40 truncate hover:underline"
          >
            {booth.boothName}
          </Link>

          <span className="shrink-0">{">"}</span>

          <Link
            href={`/${eventId}/booths/${booth.id}?category=${product.category}`}
            className="truncate hover:underline"
          >
            {getCategoryLabel(product.category)}
          </Link>

          <span className="shrink-0">{">"}</span>

          <Link
            href={`/${eventId}/booths/${booth.id}?category=${product.category}&subCategory=${product.subCategory}`}
            className="truncate hover:underline"
          >
            {getSubCategoryLabel(product.subCategory)}
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          {product.artistNames.length > 0 && (
            <p className="text-sm text-zinc-500">
              {product.artistNames.join(", ")}
            </p>
          )}

          <h1 className="text-xl sm:text-2xl font-semibold wrap-break-word">
            {product.name}
          </h1>

          <p className="text-base sm:text-lg font-medium">
            {product.price.toLocaleString()}원
          </p>
        </div>

        <AddToCartButton product={product} boothName={booth.boothName} />

        {product.description && (
          <div
            className="ql-editor !p-0 text-sm sm:text-base wrap-break-word [&_img]:max-w-full [&_img]:rounded"
            dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
          />
        )}
      </div>

      {/* 옵션 */}
      {product.options.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-2">
            옵션
          </h2>

          <ul className="flex flex-col gap-1 text-sm sm:text-base">
            {product.options.map((option) => (
              <li key={option.id} className="wrap-break-word">
                {option.name} ({option.initialQuantity}개)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 재고 */}
      {product.initialQuantity != null && (
        <p className="text-sm sm:text-base">
          총 수량: {product.initialQuantity}개
        </p>
      )}

      {/* 구매 제한 */}
      {product.purchaseLimit != null && (
        <p className="text-sm sm:text-base">
          1인 구매 제한: {product.purchaseLimit}개
        </p>
      )}

      {/* 샘플 이미지 */}
      {product.sampleImages.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-base sm:text-lg font-semibold">
            상세 이미지
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.sampleImages.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative w-full aspect-square"
              >
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="rounded object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}