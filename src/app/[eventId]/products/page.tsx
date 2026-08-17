import ProductExplorer from "@/src/component/product/ProductExplorer";
import { getProductSummaries } from "@/src/lib/data/product";
import { Suspense } from "react";

export default async function Page() {
  const products = await getProductSummaries();

  return (
    <Suspense fallback={<div>불러오는 중...</div>}>
      <ProductExplorer products={products} />
    </Suspense>
  );
}