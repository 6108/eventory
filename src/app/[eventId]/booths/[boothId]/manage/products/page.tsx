// src/app/[eventId]/booths/[boothId]/manage/products/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/src/lib/supabase/server";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${eventId}`);
  }

  const { data: artist } = await supabase
    .from("booth_artists")
    .select("booth_id")
    .eq("booth_id", boothId)
    .eq("artist_id", user.id)
    .maybeSingle();

  if (!artist) {
    redirect(`/${eventId}/booths`);
  }

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
              <Link
                href={`/${eventId}/booths/${boothId}/products/${product.id}/edit`}
                className="flex items-center gap-3 rounded border border-zinc-800 p-3 hover:bg-zinc-900"
              >
                <div className="aspect-square w-full overflow-hidden rounded bg-zinc-900">
                  {product.main_image_url && (
                    <Image
                      src={product.main_image_url}
                      alt={product.name}
                      width={300}
                      height={300}
                      priority={index < 4} // 처음 4개(첫 줄)만 우선 로드
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {product.name}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {product.price.toLocaleString()}원
                  </p>
                </div>

                <span className="flex-shrink-0 text-xs text-zinc-500">
                  재고 {product.total_quantity ?? "-"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}