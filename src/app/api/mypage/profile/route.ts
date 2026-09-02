import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function PATCH(request: Request) {
  const { name } = await request.json();

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "이름을 입력해주세요." },
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

  const trimmedName = name.trim();

  const { error } = await supabase
    .from("users")
    .update({
      name: trimmedName,
    })
    .eq("id", user.id);

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "이름 수정에 실패했습니다." },
      { status: 500 }
    );
  }

  // users.name 변경을 booth_artists.artist_name / booths.artist_names /
  // products.artist_names 스냅샷에도 반영. DB 함수(RPC) 하나로 원자적 처리.
  // 여기서 실패해도 이름 변경 자체는 이미 성공했으므로 500으로 막지 않고
  // 로그만 남긴다.
  const { error: syncError } = await supabase.rpc("sync_artist_name", {
    p_user_id: user.id,
    p_new_name: trimmedName,
  });

  if (syncError) {
    console.error("작가 이름 동기화 실패:", syncError);
  }

  return NextResponse.json({
    success: true,
  });
}

export async function DELETE() {
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

  // users 테이블의 사용자 정보 삭제
  const { error: userError } = await supabase
    .from("users")
    .delete()
    .eq("id", user.id);

  if (userError) {
    console.error(userError);

    return NextResponse.json(
      { error: "회원 정보 삭제에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
  });
}