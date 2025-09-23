"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ArrowLeft } from "lucide-react"
import { categoryAPI } from "@/lib/api"
import { toast } from "sonner"
import Link from "next/link"

export default function AddCategoryPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    commission: "",
    image: null as File | null,
  })

  const createCategoryMutation = useMutation({
    mutationFn: (data: FormData) => categoryAPI.createCategory(data),
    onSuccess: () => {
      toast.success("Category created successfully")
      router.push("/dashboard/categories")
    },
    onError: () => {
      toast.error("Failed to create category")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = new FormData()
    data.append("name", formData.name)
    data.append("description", formData.description)
    data.append("commission", formData.commission)
    if (formData.image) {
      data.append("categoryImage", formData.image)
    }

    createCategoryMutation.mutate(data)
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
            <Link href="/dashboard/categories">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Add Category</h1>
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
          <span>Overview</span>
          <span>›</span>
          <span>Categories</span>
          <span>›</span>
          <span className="text-gray-900">Add Category</span>
        </nav>
      </div>

      <Card className="">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Category name..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Category description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="commission">Commission</Label>
              <Input
                id="commission"
                placeholder="5%"
                value={formData.commission}
                onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Category Image</Label>
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
                  <p className="text-gray-500">Upload category image</p>
                  {formData.image && (
                    <p className="text-sm text-green-600 mt-2">
                      {formData.image.name}
                    </p>
                  )}
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={createCategoryMutation.isPending}
              >
                {createCategoryMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/categories">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
