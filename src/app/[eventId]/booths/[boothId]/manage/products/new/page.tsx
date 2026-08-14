// src/app/[eventId]/booths/[boothId]/manage/products/new/page.tsx
import AddProductForm from "@/src/component/form/AddProductForm";

export default async function Page({
  params,
}: {
  params: Promise<{
    eventId: string;
    boothId: string;
  }>;
}) {
  const { eventId, boothId } = await params;

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="mb-8 text-xl font-semibold text-white">상품 추가</h1>

      <AddProductForm eventId={eventId} boothId={boothId} />
    </div>
  );
}