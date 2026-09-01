import Link from "next/link";

import ProductExplorer from "@/src/component/product/ProductExplorer";
import FollowButton from "@/src/component/booth/FollowButton";

import { createClient } from "@/src/lib/supabase/server";
import {
  getBooth,
  isFollowingBooth,
} from "@/src/lib/data/booth";
import { getProductSummaries } from "@/src/lib/data/product";
import {
  ProductCategory,
  ProductCategoryCounts,
  ProductSubCategory,
} from "@/src/types/product";
import { isBoothArtist } from "@/src/lib/data/artist";

function buildCategoryCounts(
  products: {
    category: ProductCategory;
    subCategory: ProductSubCategory;
  }[]
): ProductCategoryCounts {
  const categoryMap = new Map<ProductCategory, number>();
  const subCategoryMap = new Map<ProductSubCategory, number>();

  for (const product of products) {
    if (product.category) {
      categoryMap.set(
        product.category,
        (categoryMap.get(product.category) ?? 0) + 1
      );
    }

    if (product.subCategory) {
      subCategoryMap.set(
        product.subCategory,
        (subCategoryMap.get(product.subCategory) ?? 0) + 1
      );
    }
  }

  return {
    categories: Array.from(categoryMap.entries()).map(([value, count]) => ({
      value,
      count,
    })),
    subCategories: Array.from(subCategoryMap.entries()).map(
      ([value, count]) => ({
        value,
        count,
      })
    ),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ eventId: string; boothId: string }>;
}) {
  const { eventId, boothId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const booth = await getBooth(boothId);

  if (!booth) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <p className="text-center text-zinc-500">
          부스를 찾을 수 없습니다.
        </p>
      </main>
    );
  }

  // 현재 로그인한 사용자가 이 부스의 작가인지 확인
  const isMyBooth = user
    ? await isBoothArtist(user.id, boothId)
    : false;

  const [products, initialFollowed] = await Promise.all([
    getProductSummaries(boothId),

    // 내 부스라면 팔로우 상태를 조회하지 않음
    user && !isMyBooth
      ? isFollowingBooth(user.id, boothId)
      : Promise.resolve(false),
  ]);

  const initialPage = {
    products,
    hasMore: false,
    nextPage: null,
    total: products.length,
  };

  const categoryCounts = buildCategoryCounts(products);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Booth */}
      <header className="border-b border-zinc-800 pb-10">
        <div className="flex items-start justify-between gap-8">
          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-md font-medium text-zinc-400">
                    <span>[{booth.boothNumber}]</span>
                    <span
                      className={
                        booth.category === "ADULT"
                          ? "text-primary"
                          : "text-zinc-400"
                      }
                    >
                      {booth.category === "ADULT" ? "성인 부스" : "일반 부스"}
                    </span>
                  </div>

                  <h1 className="pt-1 text-2xl font-bold tracking-tight text-white sm:text-4xl">
                    {booth.boothName}
                  </h1>
                </div>

                {/* 내 부스면 수정 버튼, 아니면 팔로우 버튼 */}
                {isMyBooth ? (
                  <div className="ml-auto shrink-0">
                    <Link
                      href={`/${eventId}/booths/${boothId}/manage/edit`}
                      className="rounded bg-primary px-4 py-2 text-center text-sm text-white"
                    >
                      부스 정보 수정
                    </Link>
                  </div>
                ) : (
                  <div className="ml-auto shrink-0">
                    <FollowButton
                      boothId={booth.id}
                      currentUserId={user?.id}
                      initialFollowed={initialFollowed}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {booth.description && (
              <p className="mt-5 max-w-2xl whitespace-pre-wrap text-base leading-7 text-zinc-300">
                {booth.description}
              </p>
            )}

            {/* Artists */}
            {booth.artistNames.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {booth.artistNames.map((artistName) => (
                  <span
                    key={artistName}
                    className="rounded-full border border-primary px-3 py-1 text-sm font-medium text-zinc-300"
                  >
                    {artistName}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Products */}
      <section className="pt-10">
        <div className="mb-6 flex items-baseline">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            작품 {products.length}개
          </h2>
        </div>

        <ProductExplorer
          initialPage={initialPage}
          currentUserId={user?.id}
          boothId={boothId}
          categoryCounts={categoryCounts}
        />
      </section>
    </main>
  );
}