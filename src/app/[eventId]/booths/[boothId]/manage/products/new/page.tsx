import ProductForm from "@/src/component/form/ProductForm";
import { getBoothArtists } from "@/src/lib/data/artist";

export default async function Page({
  params,
}: {
  params: Promise<{
    eventId: string;
    boothId: string;
  }>;
}) {
  const { eventId, boothId } = await params;

  const artists = await getBoothArtists(boothId);

  return (
    <div className="px-4 py-6 sm:px-6 md:px-10 lg:px-40">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold">
          작품 정보 추가
        </h1>

        <ProductForm
          eventId={eventId}
          boothId={boothId}
          artists={artists}
        />
      </div>
    </div>
  );
}