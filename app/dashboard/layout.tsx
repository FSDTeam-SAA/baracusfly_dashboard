"use client";

import type React from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/sidebar"; // ← exported alongside Sidebar

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session.user.role !== "admin") {
      router.push("/auth/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  // Optional: derive a simple title from the path
  const title =
    pathname === "/dashboard"
      ? "Dashboard"
      : pathname
          ?.replace("/dashboard/", "")
          .split("/")
          .map((s) => s.replace(/-/g, " "))
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" • ") || "Dashboard";

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header at the top of the content column */}
        <Header messagesCount={12} notificationsCount={12} />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-[#EFEBE8]">
          <h1 className="sr-only">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}
