"use client"

import { StatsCard } from "@/components/dashboard/stats-card"
import { EarningsChart } from "@/components/dashboard/earnings-chart"
import { BookingDistribution } from "@/components/dashboard/booking-distribution"
import { RecentBookings } from "@/components/dashboard/recent-bookings"
import { SellerRequests } from "@/components/dashboard/seller-requests"

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Users" value="$12,426" change="+ 38%" isPositive={true} />
        <StatsCard title="Total Professionals" value="$12,426" change="- 14%" isPositive={false} />
        <StatsCard title="Total Bookings" value="$12,426" change="+ 36%" isPositive={true} />
        <StatsCard title="Total Earnings" value="$12,426" change="+ 38%" isPositive={true} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EarningsChart />
        <BookingDistribution />
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentBookings />
        <SellerRequests />
      </div>
    </div>
  )
}
