import AddProductForm from "@/src/component/form/AddProductForm";
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

  // 해당 부스에 참여하고 있는 작가 ID 조회
  const { data: boothArtists, error: boothArtistsError } = await supabase
    .from("booth_artists")
    .select("artist_id")
    .eq("booth_id", boothId);

  if (boothArtistsError) {
    console.error("부스 작가 조회 실패:", boothArtistsError);
  }

  const artistIds =
    boothArtists?.map((artist) => artist.artist_id) ?? [];

  // 작가 정보 조회
  const { data: artists, error: artistsError } =
    artistIds.length > 0
      ? await supabase
        .from("users")
        .select("id, name")
        .in("id", artistIds)
      : { data: [], error: null };

  if (artistsError) {
    console.error("작가 정보 조회 실패:", artistsError);
  }

  return (
    <div className="px-4 py-6 sm:px-6 md:px-10 lg:px-40">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-semibold">
          상품 추가
        </h1>

        <AddProductForm
          eventId={eventId}
          boothId={boothId}
          artists={artists ?? []}
        />
      </div>
    </div>
  );
}