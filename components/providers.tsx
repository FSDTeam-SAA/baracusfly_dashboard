"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"

function MockSessionProvider({ children }: { children: React.ReactNode }) {
  const [mockSession, setMockSession] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem("mock-session")
    if (stored) {
      try {
        const session = JSON.parse(stored)
        if (new Date(session.expires) > new Date()) {
          setMockSession(session)
        } else {
          localStorage.removeItem("mock-session")
        }
      } catch (error) {
        localStorage.removeItem("mock-session")
      }
    }
  }, [])

  // Add mock session to window for debugging
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).mockSession = mockSession
    }
  }, [mockSession])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <MockSessionProvider>{children}</MockSessionProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
