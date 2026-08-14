// src/app/[eventId]/booths/[boothId]/manage/products/page.tsx
import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import ProductManageListItem from "@/src/component/product/ProductManageListItem";

export default async function Page({
  params,
}: {
  params: Promise<{
    eventId: string;
    boothId: string;
  }>;
}) {
  const { eventId, boothId } = await params;

  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, main_image_url, total_quantity, category")
    .eq("booth_id", boothId)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">상품 관리</h1>
        <Link
          href={`/${eventId}/booths/${boothId}/manage/products/new`}
          className="rounded bg-primary px-3 py-1.5 text-sm text-white"
        >
          + 상품 추가
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <p className="text-sm text-zinc-400">등록된 상품이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {products.map((product, index) => (
            <li key={product.id}>
              <ProductManageListItem
                href={`/${eventId}/booths/${boothId}/manage/products/${product.id}/edit`}
                name={product.name}
                price={product.price}
                mainImageUrl={product.main_image_url}
                totalQuantity={product.total_quantity}
                priority={index < 4}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}