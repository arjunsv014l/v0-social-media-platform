import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname
  const pathname = req.nextUrl.pathname

  // Define protected and public routes
  const protectedRoutes = [
    "/profile",
    "/messages",
    "/friends",
    "/courses",
    "/events",
    "/create",
    "/settings",
    "/university/dashboard",
    "/corporate/dashboard",
  ]
  const publicRoutes = ["/login", "/signup", "/forgot-password"]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)
  const isApiRoute = pathname.startsWith("/api")
  const isStaticAsset = pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico)$/i)

  // Skip middleware for static assets and API routes
  if (isApiRoute || isStaticAsset) {
    return res
  }

  // For protected routes, redirect to login if no session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // For public routes, redirect to home if session exists
  if (isPublicRoute && session) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // For all routes, add security headers
  const response = NextResponse.next()
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "origin-when-cross-origin")

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
