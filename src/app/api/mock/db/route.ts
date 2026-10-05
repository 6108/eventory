// [목업] 브라우저 쪽 supabase 호출을 받아 메모리 DB 엔진으로 실행하는 엔드포인트
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE, ctxFromCookie, execQuery, execRpc, getMockUser } from "@/src/lib/mock/engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const cookieStore = await cookies();
  const ctx = ctxFromCookie(cookieStore.get(AUTH_COOKIE)?.value);

  if (body.kind === "auth") return NextResponse.json({ user: getMockUser(ctx) });
  if (body.kind === "rpc") return NextResponse.json(execRpc(body.fn, body.args ?? {}, ctx));
  if (body.kind === "query") return NextResponse.json(execQuery(body.table, body.ops ?? [], ctx));

  return NextResponse.json({ data: null, error: { message: "bad request" } }, { status: 400 });
}
