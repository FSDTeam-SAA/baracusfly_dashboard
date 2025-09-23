"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const data = [
  { month: "Feb", value: 20000 },
  { month: "Mar", value: 25000 },
  { month: "Apr", value: 30000 },
  { month: "May", value: 35000 },
  { month: "Jun", value: 40000 },
  { month: "Jul", value: 42000 },
  { month: "Aug", value: 38000 },
  { month: "Sep", value: 45000 },
  { month: "Oct", value: 48000 },
  { month: "Nov", value: 46000 },
  { month: "Dec", value: 50000 },
  { month: "Jan", value: 45591 },
]

export function EarningsChart() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Earnings Overview</CardTitle>
          <p className="text-sm text-gray-600">Track total revenue, platform commission, and payouts over time</p>
        </div>
        <Select defaultValue="monthly">
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#666" }}
                tickFormatter={(value) => `$${value / 1000}k`}
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
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">June 2022</p>
          <p className="text-2xl font-bold text-gray-900">$45,591</p>
        </div>
      </CardContent>
    </Card>
  )
}
