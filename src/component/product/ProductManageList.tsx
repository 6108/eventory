// src/component/product/ProductManageList.tsx
import { ProductSummary } from "@/src/types/product";
import ProductManageListItem from "./ProductManageListItem";

interface ProductManageListProps {
  eventId: string;
  boothId: string;
  products: ProductSummary[];
}

export default function ProductManageList({ eventId, boothId, products }: ProductManageListProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-zinc-800 py-16 text-center">
        <p className="text-sm font-medium text-zinc-300">등록된 상품이 없어요</p>
        <p className="text-xs text-zinc-500">상품을 등록하면 이곳에 표시돼요</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => (
        <ProductManageListItem
          key={product.id}
          href={`/${eventId}/booths/${boothId}/manage/products/${product.id}/edit`}
          product={product}
          priority={index < 4}
        />
      ))}
    </div>
  );
}