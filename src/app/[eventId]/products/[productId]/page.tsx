import Image from "next/image";
import { mockArtists } from "@/src/mocks/user";
import { getCategoryLabel, getSubCategoryLabel, } from "@/src/utils/product";
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import { ProductCategory, ProductOption } from "@/src/types/product";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{
    eventId: string;
    productId: string;
  }>;
}) {
  const { eventId, productId } = await params;

  const supabase = await createClient();

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select(
      "id, booth_id, main_image_url, sample_images, name, price, category, sub_category, total_quantity, purchase_limit, description, options, artist_ids"
    )
    .eq("id", productId)
    .single();

  if (productError || !productData) {
    return notFound();
  }

  const { data: boothData } = await supabase
    .from("booths")
    .select(
      "id, booth_number, booth_name, artist_name, artist_ids, category, description"
    )
    .eq("id", productData.booth_id)
    .single();

  if (!boothData) {
    return <div>부스를 찾을 수 없습니다.</div>;
  }

  // 상품에 artist_ids가 있으면 사용하고,
  // 없으면 부스 소속 작가를 사용
  const artistIds =
    productData.artist_ids && productData.artist_ids.length > 0
      ? productData.artist_ids
      : boothData.artist_ids ?? [];

  const artists = mockArtists.filter((artist) =>
    artistIds.includes(artist.id)
  );

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 md:px-10 lg:px-40 py-6">
      {/* 이미지 */}
      <div className="relative aspect-square w-full sm:w-1/2 md:w-1/3 lg:w-1/4 max-w-md mx-auto sm:mx-0">
        {productData.main_image_url ? (
          <Image
            src={productData.main_image_url}
            alt={productData.name}
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
            href={`/${eventId}/booths/${boothData.id}`}
            className="max-w-[8rem] sm:max-w-[10rem] truncate hover:underline"
          >
            {boothData.booth_name}
          </Link>

          <span className="shrink-0">{">"}</span>

          <Link
            href={`/${eventId}/booths/${boothData.id}?category=${productData.category}`}
            className="truncate hover:underline"
          >
            {getCategoryLabel(productData.category as ProductCategory)}
          </Link>

          <span className="shrink-0">{">"}</span>

          <Link
            href={`/${eventId}/booths/${boothData.id}?category=${productData.category}&subCategory=${productData.sub_category}`}
            className="truncate hover:underline"
          >
            {getSubCategoryLabel(productData.sub_category)}
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          {artists.length > 0 && (
            <p className="text-sm text-zinc-500">
              {artists.map((artist) => artist.artistName).join(", ")}
            </p>
          )}

          <h1 className="text-xl sm:text-2xl font-semibold break-words">
            {productData.name}
          </h1>

          <p className="text-base sm:text-lg font-medium">
            {productData.price.toLocaleString()}원
          </p>
        </div>

        {productData.description && (
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words">
            {productData.description}
          </p>
        )}
      </div>

      {/* 옵션 */}
      {productData.options && productData.options.length > 0 && (
        <div>
          <h2 className="text-base sm:text-lg font-semibold mb-2">옵션</h2>

          <ul className="flex flex-col gap-1 text-sm sm:text-base">
            {productData.options.map((option: ProductOption) => (
              <li key={option.id} className="break-words">
                {option.name} ({option.quantity}개)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 재고 */}
      {productData.total_quantity != null && (
        <p className="text-sm sm:text-base">
          총 수량: {productData.total_quantity}개
        </p>
      )}

      {/* 구매 제한 */}
      {productData.purchase_limit != null && (
        <p className="text-sm sm:text-base">
          1인 구매 제한: {productData.purchase_limit}개
        </p>
      )}

      {/* 샘플 이미지 */}
      {productData.sample_images &&
        productData.sample_images.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-base sm:text-lg font-semibold">
              상세 이미지
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {productData.sample_images.map((image: string, index: number) => (
                <div
                  key={`${image}-${index}`}
                  className="relative w-full aspect-square"
                >
                  <Image
                    src={image}
                    alt={productData.name}
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