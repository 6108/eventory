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

  // 로그인 안 한 유저가 URL을 직접 조작해 following=true로 들어와도
  // 무시하고 전체 상품을 보여준다 (버튼 자체도 비로그인 시 숨김 처리됨)
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