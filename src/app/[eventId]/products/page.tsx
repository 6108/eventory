import ProductExplorer from "@/src/component/product/ProductExplorer";
import { getProductSummariesPaged, getFollowedBoothProductsPaged } from "@/src/lib/data/product";
import { getProductCategoryCounts, getFollowedBoothCategoryCounts } from "@/src/lib/data/productCategory";
import { createClient } from "@/src/lib/supabase/server";
import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ following?: string }>;
}) {
  const { following } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isFollowingOnly = following === "true" && !!user;

  const [initialPage, categoryCounts, followedCategoryCounts] = await Promise.all([
    isFollowingOnly ? getFollowedBoothProductsPaged(user!.id, 0) : getProductSummariesPaged(0),
    getProductCategoryCounts(),
    user ? getFollowedBoothCategoryCounts(user.id) : Promise.resolve({ categories: [], subCategories: [] }),
  ]);

  return (
    <Suspense fallback={<div>불러오는 중...</div>}>
      <ProductExplorer
        initialPage={initialPage}
        currentUserId={user?.id}
        categoryCounts={categoryCounts}
        followedCategoryCounts={followedCategoryCounts}
      />
    </Suspense>
  );
}