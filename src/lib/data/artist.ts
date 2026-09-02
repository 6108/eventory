import { createClient } from "@/src/lib/supabase/server";
import type { User } from "@/src/types/user";

export async function getBoothArtists(
  boothId: string
): Promise<User[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booth_artists")
    .select("artist_id, artist_name")
    .eq("booth_id", boothId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("부스 아티스트 조회 실패:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.artist_id,
    email: null,
    name: row.artist_name,
    profileImage: "",
  }));
}

export async function isBoothArtist(
  userId: string,
  boothId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booth_artists")
    .select("artist_id")
    .eq("booth_id", boothId)
    .eq("artist_id", userId)
    .maybeSingle();

  if (error) {
    console.error("부스 아티스트 여부 조회 실패:", error);
    return false;
  }

  return !!data;
}