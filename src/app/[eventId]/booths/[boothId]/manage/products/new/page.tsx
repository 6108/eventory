// src/app/[eventId]/booths/[boothId]/products/new/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
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

  return (
    <div className="mx-auto w-full max-w-lg">
      <h1 className="mb-8 text-xl font-semibold text-white">
        상품 추가
      </h1>

      <AddProductForm
        eventId={eventId}
        boothId={boothId}
      />
    </div>
  );
}