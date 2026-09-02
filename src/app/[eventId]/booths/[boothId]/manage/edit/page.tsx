import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import { getBoothArtists } from "@/src/lib/data/artist";
import EditBoothForm from "@/src/component/form/EditBoothForm";
import BoothArtistManager from "@/src/component/booth/BoothArtistManager";

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

  const { data: booth } = await supabase
    .from("booths")
    .select("id, booth_name, description, category")
    .eq("id", boothId)
    .single();

  if (!booth) {
    return <div>부스를 찾을 수 없습니다.</div>;
  }

  const artists = await getBoothArtists(boothId);

  return (
    <div className="mx-auto w-full max-w-lg flex flex-col gap-10">
      <div>
        <h1 className="mb-8 text-xl font-semibold text-white">
          부스 정보 수정
        </h1>

        <EditBoothForm
          boothId={boothId}
          eventId={eventId}
          boothName={booth.booth_name}
          description={booth.description}
          category={booth.category}
        />
      </div>

      <BoothArtistManager
        boothId={boothId}
        eventId={eventId}
        initialArtists={artists}
        currentUserId={user.id}
      />
    </div>
  );
}