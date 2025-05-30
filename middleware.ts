import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // In next-lite, middleware for auth redirection is not fully supported.
  // Client-side routing protection in AuthContext will handle this.
  return NextResponse.next()
}

export const config = {
  // Apply this minimal middleware to all paths to avoid errors,
  // but it won't perform auth-related redirects.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
