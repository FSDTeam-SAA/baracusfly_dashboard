"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  ChevronDown,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ChangePasswordModal } from "@/components/dashboard/change-password-modal";
import { LogoutModal } from "@/components/dashboard/logout-modal";
import Image from "next/image";

const menuItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Bookings", href: "/dashboard/bookings", icon: Calendar },
  {
    title: "Management",
    icon: Users,
    children: [
      { title: "Customers", href: "/dashboard/customers" },
      { title: "Service Providers", href: "/dashboard/service-providers" },
      { title: "Seller Requests", href: "/dashboard/seller-requests" },
    ],
  },
  {
    title: "Services",
    icon: Settings,
    children: [
      { title: "Categories", href: "/dashboard/categories" },
      { title: "Services", href: "/dashboard/services" },
      { title: "Banners", href: "/dashboard/banners" },
    ],
  },
];

/** NEW: Top header bar */
export function Header({
  messagesCount = 0,
}: {
  messagesCount?: number;
  notificationsCount?: number;
}) {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F8FF] backdrop-blur">
      <div className="mx-auto flex items-center justify-end px-6 py-3">

        {/* Right: Actions */}
        <div className="flex items-end justify-end gap-3">
          <Link href="/dashboard/messages">
            <Button
              size="sm"
              className="rounded-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message ({messagesCount})
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedItems, setExpandedItems] = useState<string[]>([
    "Management",
    "Services",
  ]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLogout, setShowLogout] = useState(false);


  console.log(session?.user);


  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  return (
    <>
      <div className="w-64 bg-[#F8F8FF] border-r border-gray-200 h-screen flex flex-col">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center justify-center">
            <Link href={"/dashboard"}>
              <Image
                src="/image/logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="w-[76px] h-[100px]"
              />
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Menu
            </p>
            {menuItems.map((item) => (
              <div key={item.title}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleExpanded(item.title)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.title}
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform",
                          expandedItems.includes(item.title) ? "rotate-180" : ""
                        )}
                      />
                    </button>
                    {expandedItems.includes(item.title) && (
                      <div className="ml-8 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-3 py-2 text-sm rounded-lg transition-colors",
                              pathname === child.href
                                ? "bg-yellow-100 text-yellow-800 font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                            )}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href!}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      pathname === item.href
                        ? "bg-green-100 text-green-800"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Profile
            </p>
            <div
              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
              onClick={() => setShowChangePassword(true)}
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" />
                <AvatarFallback>JW</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session?.user?.email || "Jenny Wilson"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {session?.user?.role || "Jenny Wilson"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
              onClick={() => setShowLogout(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
      <LogoutModal open={showLogout} onOpenChange={setShowLogout} />
    </>
  );
}
