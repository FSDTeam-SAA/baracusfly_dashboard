"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useQuery } from "@tanstack/react-query"
import { userAPI } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal } from "lucide-react"

export function SellerRequests() {
  const { data: sellers, isLoading } = useQuery({
    queryKey: ["seller-requests"],
    queryFn: () => userAPI.getRequestedSellers(1, 5),
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Seller Requests</CardTitle>
          <Skeleton className="h-9 w-16" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-6" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const sellerData = sellers?.data?.data?.requestedSeller || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Seller Requests</CardTitle>
          <p className="text-sm text-gray-600">Approve pending seller requests</p>
        </div>
        <Button variant="outline" size="sm">
          See all
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sellerData.map((seller: any) => (
            <div key={seller._id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={seller.profileImage || "/placeholder.svg?height=40&width=40"} />
                  <AvatarFallback>{seller.fullName?.charAt(0).toUpperCase() || "S"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{seller.fullName}</p>
                  <p className="text-xs text-gray-500">Product Designer</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
