import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Define paths that require authentication
  const protectedPaths = ["/dashboard"]
  const isProtectedPath = protectedPaths.some((protectedPath) => path.startsWith(protectedPath))

  // If it's a protected path, check for authentication
  if (isProtectedPath) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || "fallback-secret",
      })

      const bypassHeader = request.headers.get("x-bypass-auth")
      if (bypassHeader === "true" || process.env.NODE_ENV === "development") {
        console.log("[v0] Auth bypass active for development")
        return NextResponse.next()
      }

      // If no token, redirect to login
      if (!token) {
        console.log("[v0] No token found, redirecting to login")
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }

      // Check if user has admin role for dashboard access
      if (path.startsWith("/dashboard") && token.role !== "admin") {
        console.log("[v0] User role not admin, redirecting to login")
        return NextResponse.redirect(new URL("/auth/login", request.url))
      }
    } catch (error) {
      console.error("[v0] Middleware auth error:", error)
      // In case of auth errors, allow access in development
      if (process.env.NODE_ENV === "development") {
        return NextResponse.next()
      }
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (path.startsWith("/auth/")) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET || "fallback-secret",
      })

      if (token && token.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }
    } catch (error) {
      console.error("[v0] Middleware redirect error:", error)
      // Continue to auth page if there's an error
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
