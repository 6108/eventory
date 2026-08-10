"use client";

import ProductExplorer from "@/src/component/product/ProductExplorer";
import { mockProducts } from "@/src/mocks/products";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>불러오는 중...</div>}>
      <ProductExplorer products={mockProducts} />
    </Suspense>
  );
}