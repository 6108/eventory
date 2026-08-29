import ProductExplorer from "@/src/component/product/ProductExplorer";
import { getProductSummaries, getFollowedBoothProducts } from "@/src/lib/data/product";
import { createClient } from "@/src/lib/supabase/server";
import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ following?: string }>;
}) {
  const { following } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const products =
    following === "true" && user
      ? await getFollowedBoothProducts(user.id)
      : await getProductSummaries();

  return (
    <Suspense fallback={<div>불러오는 중...</div>}>
      <ProductExplorer products={products} currentUserId={user?.id} showFollowingFilter />
    </Suspense>
  );
}