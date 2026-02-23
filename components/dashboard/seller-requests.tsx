"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal } from "lucide-react"
import type { DashboardPendingProfessional } from "@/types/dashboard"

interface SellerRequestsProps {
  sellers?: DashboardPendingProfessional[]
  isLoading?: boolean
}

export function SellerRequests({ sellers = [], isLoading = false }: SellerRequestsProps) {
  const sellerData = sellers.slice(0, 5)

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
        {sellerData.length ? (
          <div className="space-y-4">
            {sellerData.map((seller) => {
              const displayName = seller.fullName || seller.email || "Unknown Seller"

              return (
                <div key={seller._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={seller.profileImage || seller.avatar || "/placeholder.svg?height=40&width=40"} />
                      <AvatarFallback>{displayName.charAt(0).toUpperCase() || "S"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{displayName}</p>
                      <p className="text-xs text-gray-500">{seller.serviceName || seller.email || "Pending review"}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-52 flex items-center justify-center text-sm text-gray-500">
            No pending seller requests
          </div>
        )}
      </CardContent>
    </Card>
  )
}
