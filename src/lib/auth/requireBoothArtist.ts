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
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // getUser()는 세션이 없으면 보통 user: null만 반환하지만,
    // 손상되거나 만료된 리프레시 토큰 등으로 예외 대신 error 필드를
    // 채워서 돌아오는 경우도 있다. 이 경우도 그냥 "로그인이 필요합니다"로
    // 처리해서 500 대신 명확한 401을 준다.
    if (userError || !user) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { data: artist, error: artistError } = await supabase
      .from("booth_artists")
      .select("booth_id")
      .eq("booth_id", boothId)
      .eq("artist_id", user.id)
      .maybeSingle();

    if (artistError) {
      console.error("부스 권한 확인 실패:", artistError);
      return NextResponse.json(
        { error: "권한 확인 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    if (!artist) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    return { supabase, user };
  } catch (error) {
    // supabase 클라이언트 생성/세션 조회 자체가 예외를 던지는 경우
    // (예: 손상된 쿠키, 네트워크 문제 등). 잡지 않으면 Next.js 기본
    // 500 페이지로 새어나가 원인 파악이 어려워진다.
    console.error("requireBoothArtist 예외:", error);
    return NextResponse.json(
      { error: "인증 확인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}