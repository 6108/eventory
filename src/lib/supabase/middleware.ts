// [목업] 세션 갱신 대신 쿠키로 로그인 여부만 판단합니다. (원본: supabase.auth.getUser)
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/src/lib/mock/constants";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const user = request.cookies.get(AUTH_COOKIE)?.value === "out" ? null : { id: "mock" };
  return { response, user };
}
