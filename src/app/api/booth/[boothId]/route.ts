import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

// 로그인한 부스 참여자가 부스명, 설명, 유형을 수정하는 API
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;
  const { boothName, description, category } = await request.json();

  if (!boothName?.trim()) {
    return NextResponse.json(
      { error: "부스명을 입력해주세요." },
      { status: 400 }
    );
  }

  if (category !== "GENERAL" && category !== "ADULT") {
    return NextResponse.json(
      { error: "올바르지 않은 부스 유형입니다." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const { data: artist } = await supabase
    .from("booth_artists")
    .select("booth_id")
    .eq("booth_id", boothId)
    .eq("artist_id", user.id)
    .maybeSingle();

  if (!artist) {
    return NextResponse.json(
      { error: "수정 권한이 없습니다." },
      { status: 403 }
    );
  }

  const { data: booth, error } = await supabase
    .from("booths")
    .update({
      name: boothName.trim(),
      description: description?.trim() ?? "",
      category,
    })
    .eq("id", boothId)
    .select("id, name, description, category")
    .single();

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "부스 정보 수정에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({ booth });
}