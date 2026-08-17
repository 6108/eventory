import { createClient } from "@/src/lib/supabase/server";
import { Booth } from "@/src/types/booth";

// 부스 단일 조회
export async function getBooth(
  boothId: string
): Promise<Booth | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booths")
    .select(
      "id, event_id, booth_number, name, category, description, artist_names"
    )
    .eq("id", boothId)
    .single();

  if (error || !data) {
    console.error("부스 조회 실패:", error);
    return null;
  }

  return {
    id: data.id,
    eventId: data.event_id,
    boothNumber: data.booth_number,
    boothName: data.name,
    artistNames: data.artist_names ?? [],
    category: data.category,
    description: data.description ?? "",
  };
}

// 부스 목록 조회
export async function getBooths(): Promise<Booth[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booths")
    .select(
      "id, event_id, booth_number, name, category, description, artist_names"
    )
    .order("booth_number", { ascending: true });

  if (error) {
    console.error("부스 목록 조회 실패:", error);
    return [];
  }

  return data.map((booth) => ({
    id: booth.id,
    eventId: booth.event_id,
    boothNumber: booth.booth_number,
    boothName: booth.name,
    artistNames: booth.artist_names ?? [],
    category: booth.category,
    description: booth.description ?? "",
  }));
}