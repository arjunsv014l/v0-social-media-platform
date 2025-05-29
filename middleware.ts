import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is not signed in and the current path requires authentication
  if (!session && !req.nextUrl.pathname.startsWith("/login") && !req.nextUrl.pathname.startsWith("/signup")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // If user is signed in and tries to access login/signup pages
  if (session && (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
