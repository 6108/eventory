import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { error } = await supabase
    .from("booth_follows")
    .insert({ user_id: user.id, booth_id: boothId });

  // 이미 팔로우 중(unique 제약 위반)이면 그냥 성공 처리
  if (error && error.code !== "23505") {
    console.error("팔로우 실패:", error);
    return NextResponse.json({ error: "팔로우에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ followed: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ boothId: string }> }
) {
  const { boothId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { error } = await supabase
    .from("booth_follows")
    .delete()
    .eq("user_id", user.id)
    .eq("booth_id", boothId);

  if (error) {
    console.error("언팔로우 실패:", error);
    return NextResponse.json({ error: "언팔로우에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ followed: false });
}