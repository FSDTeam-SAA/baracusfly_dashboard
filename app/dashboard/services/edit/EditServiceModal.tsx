"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "sonner"
import { categoryAPI, serviceAPI } from "@/lib/api"

type Props = {
  serviceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function EditServiceModal({ serviceId, open, onOpenChange, onSaved }: Props) {
  // Get categories for select
  const { data: categories = [] } = useQuery({
    queryKey: ["categories-for-service"],
    queryFn: () =>
      categoryAPI.getAllCategories().then((res) =>
        (res.data?.data || []).map((c: any) => ({ id: c._id, name: c.name }))
      ),
    enabled: open,
  })

  // Fetch all services and pick one (use getService if you have it)
  const { data: service, isLoading } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: async () => {
      if (!serviceId) return null
      const res = await serviceAPI.getAllServices()
      const arr = res.data?.data || []
      return arr.find((s: any) => s._id === serviceId) ?? null
    },
    enabled: open && !!serviceId,
  })

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [loyalityPoint, setLoyalityPoint] = useState("")
  const [image, setImage] = useState<File | null>(null)

  useEffect(() => {
    if (!service) return
    setTitle(service.title ?? service.name ?? "")
    setCategory(service.category?._id ?? service.category ?? "")
    setPrice(String(service.price ?? ""))
    setLoyalityPoint(String(service.loyality_point ?? service.loyalty_point ?? ""))
    // existing image shown via <img>, we only set file when user picks new
  }, [service])

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!serviceId) return
      const fd = new FormData()
      fd.append("title", title)
      if (category) fd.append("category", category)
      if (price !== "") fd.append("price", price)
      if (loyalityPoint !== "") fd.append("loyality_point", loyalityPoint)
      if (image) fd.append("image", image) // optional replace
      return serviceAPI.updateService(serviceId, fd)
    },
    onSuccess: () => {
      toast.success("Service updated")
      onOpenChange(false)
      onSaved()
    },
    onError: () => toast.error("Failed to update service"),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="space-y-5">
            <div>
              <Label htmlFor="es-title">Title</Label>
              <Input id="es-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="es-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="es-category">
                  <SelectValue placeholder="Select category…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="es-price">Price</Label>
                <Input id="es-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="es-loyalty">Loyalty Point</Label>
                <Input
                  id="es-loyalty"
                  type="number"
                  value={loyalityPoint}
                  onChange={(e) => setLoyalityPoint(e.target.value)}
                />
              </div>
            </div>

            {/* Current image preview */}
            <div>
              <Label>Current Image</Label>
              {service?.image || service?.serviceImage ? (
                <img
                  src={service.image ?? service.serviceImage}
                  alt="Current service"
                  className="mt-2 h-32 rounded border object-cover"
                />
              ) : (
                <p className="mt-2 text-sm text-gray-500">No image uploaded.</p>
              )}
            </div>

            <div>
              <Label htmlFor="es-image">Replace image (optional)</Label>
              <Input
                id="es-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty to keep current image.</p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || isLoading}>
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
