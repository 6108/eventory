import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

//로그인한 아티스트의 부스 ID 조회
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ boothId: null });
  }

  const { data } = await supabase
    .from("booth_artists")
    .select("booth_id")
    .eq("artist_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    boothId: data?.booth_id ?? null,
  });
}