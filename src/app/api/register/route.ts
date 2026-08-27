import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

// 부스 등록 코드로 아티스트 부스 연결
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

  // 코드 검증 + booth_artists 연결을 claim_booth 하나로 처리
  // (booth_codes는 RLS로 전부 막혀있어서 SECURITY DEFINER RPC로만 접근 가능)
  const { data: boothId, error } = await supabase.rpc("claim_booth", {
    p_booth_number: boothNumber.trim(),
    p_code: code.trim(),
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "연결 중 문제가 발생했습니다." }, { status: 500 });
  }

  if (!boothId) {
    return NextResponse.json(
      { error: "부스번호 또는 코드가 올바르지 않습니다." },
      { status: 404 }
    );
  }

  // claim_booth는 booth_id만 반환하므로 event_id는 별도 조회
  const { data: booth } = await supabase
    .from("booths")
    .select("event_id")
    .eq("id", boothId)
    .single();

  return NextResponse.json({ boothId, eventId: booth?.event_id ?? null });
}