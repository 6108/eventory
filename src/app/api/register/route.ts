import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

//부스 등록 코드로 아티스트 부스 연결
export async function POST(request: Request) {
  const { boothNumber, code } = await request.json();

  if (!boothNumber || !code) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // id만 조회 — register_code 값 자체는 응답에 안 담김
  const { data: booth } = await supabase
    .from("booths")
    .select("id, event_id")
    .eq("booth_number", boothNumber.trim())
    .eq("register_code", code.trim())
    .single();

  if (!booth) {
    return NextResponse.json(
      { error: "부스번호 또는 코드가 올바르지 않습니다." },
      { status: 404 }
    );
  }

  const { error: insertError } = await supabase
    .from("booth_artists")
    .upsert(
      { booth_id: booth.id, artist_id: user.id },
      { onConflict: "booth_id,artist_id" }
    );

  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ error: "연결 중 문제가 발생했어요." }, { status: 500 });
  }

  return NextResponse.json({ boothId: booth.id, eventId: booth.event_id, });
}