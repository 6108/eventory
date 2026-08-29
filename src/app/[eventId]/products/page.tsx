import ProductExplorer from "@/src/component/product/ProductExplorer";
import {
  getProductSummariesPaged,
  getFollowedBoothProductsPaged,
  ProductListFilter,
} from "@/src/lib/data/product";
import { createClient } from "@/src/lib/supabase/server";
import { ProductCategory, ProductSubCategory } from "@/src/types/product";
import { Suspense } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    following?: string;
    category?: string;
    subCategory?: string;
  }>;
}) {
  const { following, category, subCategory } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const filter: ProductListFilter = {
    category: (category as ProductCategory | undefined) ?? "ALL",
    subCategory: (subCategory as ProductSubCategory | undefined) ?? "ALL",
  };

  const isFollowingOnly = following === "true" && !!user;

  const initialPage = isFollowingOnly
    ? await getFollowedBoothProductsPaged(user!.id, 0, filter)
    : await getProductSummariesPaged(0, filter);

  return (
    <Suspense fallback={<div>불러오는 중...</div>}>
      <ProductExplorer
        initialPage={initialPage}
        currentUserId={user?.id}
        showFollowingFilter
      />
    </Suspense>
  );
}