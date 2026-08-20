import { createClient } from "@/src/lib/supabase/server";
import { Booth, FollowedBooth } from "@/src/types/booth";

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

export type MyEvent = {
  eventId: string;
  eventName: string;
  booths: {
    boothId: string;
    boothNumber: string;
    boothName: string;
    artistName: string;
  }[];
};


// 내가 참여 중인 행사/부스 목록 조회
export async function getMyBooths(
  userId: string
): Promise<MyEvent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booth_artists")
    .select(
      `booth_id, artist_name,
      booths ( id, event_id, booth_number, name, events ( id, name ) )`
    )
    .eq("artist_id", userId);

  if (error) {
    console.error("내 부스 조회 실패:", error);
    return [];
  }

  const eventMap = new Map<string, MyEvent>();

  for (const boothArtist of data) {
    const booth = boothArtist.booths;
    if (!booth) continue;

    const event = booth.events;
    if (!event) continue;

    let eventGroup = eventMap.get(event.id);

    if (!eventGroup) {
      eventGroup = {
        eventId: event.id,
        eventName: event.name,
        booths: [],
      };

      eventMap.set(event.id, eventGroup);
    }

    eventGroup.booths.push({
      boothId: booth.id,
      boothNumber: booth.booth_number,
      boothName: booth.name,
      artistName: boothArtist.artist_name ?? "",
    });
  }

  return Array.from(eventMap.values());
}

// 팔로우한 부스 조회
export async function getFollowedBooths(userId: string): Promise<FollowedBooth[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booth_follows")
    .select(
      `
      id, created_at,
      booths (
        id, event_id, booth_number, name, artist_names, category, description
      )
      `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("팔로우한 부스 조회 실패:", error);
    return [];
  }

  return (data ?? [])
    .map((follow) => {
      const booth = Array.isArray(follow.booths) ? follow.booths[0] : follow.booths;
      if (!booth) return null;

      return {
        followId: follow.id,
        followedAt: follow.created_at,
        booth: {
          id: booth.id,
          eventId: booth.event_id,
          boothNumber: booth.booth_number,
          boothName: booth.name,
          artistNames: booth.artist_names ?? [],
          category: booth.category as "ADULT" | "GENERAL",
          description: booth.description ?? "",
        },
      };
    })
    .filter((item): item is FollowedBooth => item !== null);
}