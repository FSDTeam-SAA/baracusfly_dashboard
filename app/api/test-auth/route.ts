import { NextResponse } from "next/server"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "❌ NOT SET",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "✅ SET" : "❌ NOT SET",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "❌ NOT SET",
      NODE_ENV: process.env.NODE_ENV,
    },
    nextAuthConfig: {
      hasCredentialsProvider: true,
      hasJWTStrategy: true,
      hasCallbacks: true,
    },
  }

  return NextResponse.json(diagnostics)
}
