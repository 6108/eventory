// src/proxy.ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  if (
    !user &&
    request.nextUrl.pathname.endsWith("/booths/register")
  ) {
    const eventPath = request.nextUrl.pathname.replace(
      "/booths/register",
      ""
    );

    const url = new URL(eventPath, request.url);
    url.searchParams.set("login", "required");

    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};