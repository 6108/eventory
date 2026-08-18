import ProductExplorer from "@/src/component/product/ProductExplorer";
import { getProductSummaries } from "@/src/lib/data/product";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{
    eventId: string;
    boothId: string;
  }>;
}) {
  const { boothId } = await params;

  const products = await getProductSummaries(boothId);

  if (!products) {
    return <div>상품이 없습니다.</div>;
  }

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-40 py-6">
      <Suspense fallback={<div>불러오는 중...</div>}>
        <ProductExplorer products={products} />
      </Suspense>
    </div>
  );
}