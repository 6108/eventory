import ProductExplorer from "@/src/component/product/ProductExplorer";
import FollowButton from "@/src/component/booth/FollowButton";

import { createClient } from "@/src/lib/supabase/server";
import { getBooth, isFollowingBooth } from "@/src/lib/data/booth";
import { getProductSummaries } from "@/src/lib/data/product";

export default async function Page({
  params,
}: {
  params: Promise<{ boothId: string }>;
}) {
  const { boothId } = await params;

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

  const [products, initialFollowed] = await Promise.all([
    getProductSummaries(boothId),
    user ? isFollowingBooth(user.id, boothId) : Promise.resolve(false),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Booth header */}
      <header className="border-b border-zinc-800 pb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
              {booth.boothNumber}
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {booth.boothName}
            </h1>

            <p className="mt-3 text-sm text-zinc-400">
              {booth.artistNames.join(" · ")}
            </p>
          </div>

          <FollowButton
            boothId={booth.id}
            currentUserId={user?.id}
            initialFollowed={initialFollowed}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500">
          <span>{booth.category}</span>

          <span className="text-zinc-700">•</span>

          <span>작가 {booth.artistNames.length}명</span>
        </div>
      </header>

      {/* Products */}
      <section className="pt-10">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">
            판매 제품
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {products.length}개의 상품
          </p>
        </div>

        <ProductExplorer
          products={products}
          currentUserId={user?.id}
        />
      </section>
    </main>
  );
}