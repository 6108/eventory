import ProductExplorer from "@/src/component/product/ProductExplorer";
import { getProductSummariesPaged } from "@/src/lib/data/product";
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

  const initialPage = await getProductSummariesPaged(0, { boothIds: [boothId] });

  if (initialPage.products.length === 0) {
    return <div>작품이 없습니다.</div>;
  }

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-40 py-6">
      <Suspense fallback={<div>불러오는 중...</div>}>
        <ProductExplorer initialPage={initialPage} boothId={boothId} />
      </Suspense>
    </div>
  );
}