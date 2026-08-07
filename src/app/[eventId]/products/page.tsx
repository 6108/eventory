"use client";

import ProductExplorer from "@/src/component/product/ProductExplorer";
import { mockProducts } from "@/src/mocks/products";

export default function Page() {
  return <ProductExplorer products={mockProducts} />;
}