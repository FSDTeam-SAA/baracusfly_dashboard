// app/dashboard/banners/add/page.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { bannerAPI } from "@/lib/api" // ✅ use your banner API wrapper

export default function AddBannerPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    status: "",              // "active" | "schedule" | "expired"
    startDate: "",           // yyyy-mm-dd
    endDate: "",             // yyyy-mm-dd
    bannerImage: null as File | null,
  })

  const createBannerMutation = useMutation({
    mutationFn: (data: FormData) => bannerAPI.createBanner(data),
    onSuccess: () => {
      toast.success("Banner created successfully")
      router.push("/dashboard/banners")
    },
    onError: () => toast.error("Failed to create banner"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // quick client guard: endDate >= startDate
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) {
        toast.error("End date cannot be earlier than start date")
        return
      }
    }

    const data = new FormData()
    // 🔑 exact keys your API expects
    data.append("name", formData.name)

    // backend returns "active" in success payload, so send lowercase values
    if (formData.status) data.append("status", formData.status) // already lowercase via <Select> values

    // match your Postman example: full ISO strings
    if (formData.startDate) data.append("startDate", `${formData.startDate}T00:00:00.000Z`)
    if (formData.endDate) data.append("endDate", `${formData.endDate}T23:59:59.000Z`)

    if (formData.bannerImage) data.append("bannerImage", formData.bannerImage)

    createBannerMutation.mutate(data)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFormData((s) => ({ ...s, bannerImage: file }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/banners">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Banner Ads</h1>
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
          <span>Overview</span><span>›</span><span>Settings</span><span>›</span>
          <span className="text-gray-900">Banner Ads</span>
        </nav>
      </div>

      <Card className="">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Banner Image</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Upload your banner</p>
                  {formData.bannerImage && <p className="text-sm text-green-600 mt-2">{formData.bannerImage.name}</p>}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Title / Name</Label>
                <Input
                  id="name"
                  placeholder="Name..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* send lowercase values to match backend ("active" in response) */}
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/banners">Cancel</Link>
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={createBannerMutation.isPending}
              >
                {createBannerMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
