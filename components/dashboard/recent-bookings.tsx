"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { DashboardRecentBooking } from "@/types/dashboard"

interface RecentBookingsProps {
  bookings?: DashboardRecentBooking[]
  isLoading?: boolean
}

const formatDate = (value?: string) => {
  if (!value) return "N/A"
  return new Date(value).toLocaleDateString()
}

const statusClassNames = (status?: string) => {
  if (status === "completed") return "bg-green-100 text-green-800"
  if (status === "pending") return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}

export function RecentBookings({ bookings = [], isLoading = false }: RecentBookingsProps) {
  const bookingData = bookings.slice(0, 5)

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Skeleton className="h-9 w-16" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Bookings</CardTitle>
          <p className="text-sm text-gray-600">View the latest customer appointments and their current status</p>
        </div>
        <Button variant="outline" size="sm">
          See all
        </Button>
      </CardHeader>
      <CardContent>
        {bookingData.length ? (
          <div className="space-y-4">
            {bookingData.map((booking) => (
              <div key={booking._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-sm font-medium text-gray-600">#{booking._id.slice(-5)}</div>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>{booking.seller?.email?.charAt(0).toUpperCase() || "S"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{booking.seller?.email || "Unknown Seller"}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{booking.service?.title || "Service"}</div>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>{booking.user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{booking.user?.email || "Guest User"}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant={booking.status === "completed" ? "default" : booking.status === "pending" ? "secondary" : "destructive"}
                    className={statusClassNames(booking.status)}
                  >
                    {booking.status || "unknown"}
                  </Badge>
                  <div className="text-sm text-gray-600">{formatDate(booking.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-52 flex items-center justify-center text-sm text-gray-500">
            No recent bookings available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
