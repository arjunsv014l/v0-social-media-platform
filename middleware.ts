import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Get the pathname
  const pathname = req.nextUrl.pathname

  // Define protected routes that require authentication
  const protectedRoutes = [
    "/profile",
    "/messages",
    "/friends",
    "/courses",
    "/events",
    "/create",
    "/settings",
    "/professional/dashboard",
    "/corporate/dashboard",
  ]

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/forgot-password"]

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)

  // For protected routes, we'll let the AuthContext handle the redirection
  // This middleware just ensures proper headers are set
  if (isProtectedRoute || isPublicRoute) {
    const response = NextResponse.next()

    // Add security headers
    response.headers.set("X-Frame-Options", "DENY")
    response.headers.set("X-Content-Type-Options", "nosniff")
    response.headers.set("Referrer-Policy", "origin-when-cross-origin")

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
