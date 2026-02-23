"use client"

import { useQuery } from "@tanstack/react-query"
import { StatsCard } from "@/components/dashboard/stats-card"
import { EarningsChart } from "@/components/dashboard/earnings-chart"
import { BookingDistribution } from "@/components/dashboard/booking-distribution"
import { RecentBookings } from "@/components/dashboard/recent-bookings"
import { SellerRequests } from "@/components/dashboard/seller-requests"
import { adminAPI } from "@/lib/api"
import type { AdminOverviewPayload } from "@/types/dashboard"

const numberFormatter = new Intl.NumberFormat("en-US")
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export default function DashboardPage() {
  const { data: overviewResponse, isLoading, isError } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminAPI.getOverview(),
  })

  const overviewData: AdminOverviewPayload | undefined = overviewResponse?.data?.data
  const stats = overviewData?.stats

  return (
    <div className="p-6 space-y-6">
      {isError && (
        <p className="text-sm text-red-600">Failed to fetch dashboard overview. Showing available fallback data.</p>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Users" value={isLoading ? "Loading..." : numberFormatter.format(stats?.totalUsers || 0)} />
        <StatsCard
          title="Total Professionals"
          value={isLoading ? "Loading..." : numberFormatter.format(stats?.totalProfessionals || 0)}
        />
        <StatsCard title="Total Bookings" value={isLoading ? "Loading..." : numberFormatter.format(stats?.totalBookings || 0)} />
        <StatsCard title="Total Earnings" value={isLoading ? "Loading..." : moneyFormatter.format(stats?.totalEarnings || 0)} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsChart data={overviewData?.earningsOverview || []} isLoading={isLoading} />
        <BookingDistribution data={overviewData?.bookingDistribution || []} isLoading={isLoading} />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentBookings bookings={overviewData?.recentBookings || []} isLoading={isLoading} />
        <SellerRequests sellers={overviewData?.pendingPros || []} isLoading={isLoading} />
      </div>
    </div>
  )
}
