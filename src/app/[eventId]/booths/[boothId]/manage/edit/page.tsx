import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";
import EditBoothForm from "@/src/component/form/EditBoothForm";

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

  return (
    <div className="mx-auto w-full max-w-lg">
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
  );
}