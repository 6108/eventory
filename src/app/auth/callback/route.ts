import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  //피싱 링크 방지
  const rawNext = searchParams.get("next") ?? "/";
  const isSafeNext =
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//") &&
    !rawNext.startsWith("/\\") &&
    !rawNext.includes("://") &&
    !/^\/[\\/]/.test(rawNext);

  const next = isSafeNext ? rawNext : "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}