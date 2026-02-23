"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import type { DashboardEarningsItem } from "@/types/dashboard"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

interface EarningsChartProps {
  data?: DashboardEarningsItem[]
  isLoading?: boolean
}

const normalizeEarningsData = (data: DashboardEarningsItem[]) =>
  [...data]
    .sort((a, b) => {
      if (a._id.year !== b._id.year) {
        return a._id.year - b._id.year
      }
      return a._id.month - b._id.month
    })
    .map((item) => {
      const monthLabel = MONTHS[item._id.month - 1] || "N/A"

      return {
        label: `${monthLabel} ${String(item._id.year).slice(-2)}`,
        fullLabel: `${monthLabel} ${item._id.year}`,
        value: Number(item.total) || 0,
      }
    })

export function EarningsChart({ data = [], isLoading = false }: EarningsChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Earnings Overview</CardTitle>
            <p className="text-sm text-gray-600">Track total revenue, platform commission, and payouts over time</p>
          </div>
          <Skeleton className="h-9 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
          <div className="mt-4 text-center space-y-2">
            <Skeleton className="h-4 w-28 mx-auto" />
            <Skeleton className="h-8 w-24 mx-auto" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = normalizeEarningsData(data)
  const latestPoint = chartData.at(-1)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Earnings Overview</CardTitle>
          <p className="text-sm text-gray-600">Track total revenue, platform commission, and payouts over time</p>
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
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#666" }}
                  tickFormatter={(value: number) => moneyFormatter.format(value)}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#f59e0b", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-500">No earnings data available</div>
          )}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">{latestPoint?.fullLabel || "No data"}</p>
          <p className="text-2xl font-bold text-gray-900">{moneyFormatter.format(latestPoint?.value || 0)}</p>
        </div>
      </CardContent>
    </Card>
  )
}
