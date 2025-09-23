"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

export default function AddSubServicePage() {
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    loyaltyPoints: "",
    image: null as File | null,
  })

  const createSubServiceMutation = useMutation({
    mutationFn: (data: FormData) => api.post(`/services/${params.id}/sub-services`, data),
    onSuccess: () => {
      toast.success("Sub-service created successfully")
      router.push(`/dashboard/services/${params.id}/sub-services`)
    },
    onError: () => {
      toast.error("Failed to create sub-service")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = new FormData()
    data.append("title", formData.title)
    data.append("price", formData.price)
    data.append("loyaltyPoints", formData.loyaltyPoints)
    if (formData.image) {
      data.append("image", formData.image)
    }

    createSubServiceMutation.mutate(data)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/services/${params.id}/sub-services`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Services</h1>
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
          <span>Overview</span>
          <span>›</span>
          <span>Services</span>
          <span>›</span>
          <span className="text-gray-900">Add Services</span>
        </nav>
      </div>

      <Card className="max-w-4xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Name..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Services Image</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Upload your banner</p>
                    {formData.image && <p className="text-sm text-green-600 mt-2">{formData.image.name}</p>}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="price">Prices</Label>
              <Input
                id="price"
                placeholder="0.00"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="loyaltyPoints">Loyalty Point</Label>
              <Input
                id="loyaltyPoints"
                placeholder="120"
                type="number"
                value={formData.loyaltyPoints}
                onChange={(e) => setFormData({ ...formData, loyaltyPoints: e.target.value })}
                required
              />
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={createSubServiceMutation.isPending}
              >
                {createSubServiceMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/services/${params.id}/sub-services`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
