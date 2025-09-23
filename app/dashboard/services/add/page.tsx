"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { categoryAPI, serviceAPI } from "@/lib/api"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function AddServicePage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    category: "",          // category _id
    price: "",
    loyality_point: "",
    image: null as File | null,
  })

  // Fetch categories for the select
  const { data: categories = [] } = useQuery({
    queryKey: ["categories-for-service"],
    queryFn: () =>
      categoryAPI.getAllCategories().then((res) =>
        (res.data?.data || []).map((c: any) => ({ id: c._id, name: c.name }))
      ),
  })

  const createServiceMutation = useMutation({
    mutationFn: (fd: FormData) => serviceAPI.createService(fd),
    onSuccess: () => {
      toast.success("Service created successfully")
      router.push("/dashboard/services")
    },
    onError: () => toast.error("Failed to create service"),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append("title", formData.title)
    fd.append("category", formData.category)
    fd.append("price", formData.price)
    fd.append("loyality_point", formData.loyality_point)
    if (formData.image) fd.append("image", formData.image)
    createServiceMutation.mutate(fd)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((s) => ({ ...s, image: file }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/services">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Add Service</h1>
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
          <span>Overview</span><span>›</span><span>Services</span><span>›</span>
          <span className="text-gray-900">Add</span>
        </nav>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Hair color"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="150"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="loyalty">Loyalty Point</Label>
                <Input
                  id="loyalty"
                  type="number"
                  min="0"
                  placeholder="15"
                  value={formData.loyality_point}
                  onChange={(e) => setFormData({ ...formData, loyality_point: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Image</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                <input id="image-upload" className="hidden" type="file" accept="image/*" onChange={handleImageChange} />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Upload service image</p>
                  {formData.image && <p className="text-sm text-green-600 mt-2">{formData.image.name}</p>}
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={createServiceMutation.isPending}
              >
                {createServiceMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/services">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
