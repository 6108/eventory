// src/lib/auth/requireBoothArtist.ts
import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

type AuthorizedResult = {
  supabase: SupabaseClient;
  user: User;
};

export async function requireBoothArtist(
  boothId: string
): Promise<AuthorizedResult | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: artist } = await supabase
    .from("booth_artists")
    .select("booth_id")
    .eq("booth_id", boothId)
    .eq("artist_id", user.id)
    .maybeSingle();

  if (!artist) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  return { supabase, user };
}