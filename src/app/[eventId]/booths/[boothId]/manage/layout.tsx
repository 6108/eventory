// src/app/[eventId]/booths/[boothId]/manage/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

// 부스 주인인지 검증
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string; boothId: string }>;
}) {
  const { eventId, boothId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${eventId}/booths/${boothId}`);
  }

  const { data: artist } = await supabase
    .from("booth_artists")
    .select("booth_id")
    .eq("booth_id", boothId)
    .eq("artist_id", user.id)
    .maybeSingle();

  if (!artist) {
    redirect(`/${eventId}/booths/${boothId}`); // 부스 설명(상세) 페이지로
  }

  return <>{children}</>;
}