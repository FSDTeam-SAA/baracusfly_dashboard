"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import type { DashboardBookingDistributionItem } from "@/types/dashboard"

const COLORS = ["#10b981", "#84cc16", "#22c55e", "#16a34a", "#15803d", "#0891b2", "#2563eb", "#4f46e5"]

interface BookingDistributionProps {
  data?: DashboardBookingDistributionItem[]
  isLoading?: boolean
}

const normalizeDistributionData = (data: DashboardBookingDistributionItem[]) => {
  const grouped = new Map<string, { name: string; value: number }>()

  for (const item of data) {
    const name = item.serviceName?.trim() || "Unknown Service"
    const key = name.toLowerCase()
    const current = grouped.get(key)

    if (current) {
      current.value += Number(item.count) || 0
    } else {
      grouped.set(key, { name, value: Number(item.count) || 0 })
    }
  }

  return Array.from(grouped.values())
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
}

export function BookingDistribution({ data = [], isLoading = false }: BookingDistributionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Booking Distribution</CardTitle>
            <p className="text-sm text-gray-600">See which services are booked the most by users</p>
          </div>
          <Skeleton className="h-9 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = normalizeDistributionData(data)
  const totalBookings = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Booking Distribution</CardTitle>
          <p className="text-sm text-gray-600">See which services are booked the most by users</p>
        </div>
        <Select defaultValue="monthly">
          <SelectTrigger className="w-32" disabled>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-500">
              No booking distribution data available
            </div>
          )}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {chartData.map((item, index) => {
            const percentage = totalBookings ? Math.round((item.value / totalBookings) * 100) : 0

            return (
              <div key={`${item.name}-${index}`} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-sm text-gray-600">
                  {item.name} ({item.value}, {percentage}%)
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
