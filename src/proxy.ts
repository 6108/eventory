// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";


export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  if (
    !user &&
    request.nextUrl.pathname.endsWith("/booths/register")
  ) {
    return NextResponse.redirect(
      new URL("/", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};