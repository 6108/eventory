// src/app/[eventId]/booths/[boothId]/manage/products/page.tsx
import Link from "next/link";
import ProductManageExplorer from "@/src/component/product/ProductManageExplorer";
import { getProductSummaries } from "@/src/lib/data/product";

export default async function Page({
  params,
}: {
  params: Promise<{
    eventId: string;
    boothId: string;
  }>;
}) {
  const { eventId, boothId } = await params;

  const products = await getProductSummaries(boothId);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">회지 & 굿즈 관리</h1>
        <Link
          href={`/${eventId}/booths/${boothId}/manage/products/new`}
          className="rounded bg-primary px-3 py-1.5 text-sm text-white"
        >
          + 추가
        </Link>
      </div>

      <ProductManageExplorer
        products={products ?? []}
        eventId={eventId}
        boothId={boothId}
      />
    </div>
  );
}