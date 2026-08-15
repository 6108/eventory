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

  const { error } = await supabase
    .from("users")
    .update({
      name: name.trim(),
    })
    .eq("id", user.id);

  if (error) {
    console.error(error);

    return NextResponse.json(
      { error: "이름 수정에 실패했습니다." },
      { status: 500 }
    );
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