"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { categoryAPI } from "@/lib/api"

type Props = {
  categoryId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function EditCategoryModal({
  categoryId,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["category", categoryId],
    queryFn: async () => {
      if (!categoryId) return null
      const res = await categoryAPI.getAllCategories() // Or a single `getCategory` if available
      // If you have `getCategory(id)`, replace with that
      const found = res.data?.data?.find((c: any) => c._id === categoryId)
      return found
    },
    enabled: open && !!categoryId,
  })

  const [name, setName] = useState("")
  const [commission, setCommission] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<File | null>(null)

  useEffect(() => {
    if (!data) return
    setName(data.name ?? "")
    setCommission(data.commission ?? "")
    setDescription(data.description ?? "")
  }, [data])

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!categoryId) return
      const fd = new FormData()
      fd.append("name", name)
      fd.append("commission", commission)
      fd.append("description", description)
      if (image) fd.append("categoryImage", image)
      return categoryAPI.updateCategory(categoryId, fd)
    },
    onSuccess: () => {
      toast.success("Category updated")
      onOpenChange(false)
      onSaved()
    },
    onError: () => toast.error("Failed to update category"),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="space-y-5">
            <div>
              <Label htmlFor="ec-name">Name</Label>
              <Input
                id="ec-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="ec-description">Description</Label>
              <Input
                id="ec-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="ec-commission">Commission</Label>
              <Input
                id="ec-commission"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                required
              />
            </div>

            {/* Show current image */}
            <div>
              <Label>Current Image</Label>
              {data?.catImage ? (
                <img
                  src={data.catImage}
                  alt="Current category"
                  className="mt-2 h-32 rounded border object-cover"
                />
              ) : (
                <p className="mt-2 text-sm text-gray-500">No image uploaded.</p>
              )}
            </div>

            <div>
              <Label htmlFor="ec-image">Replace image (optional)</Label>
              <Input
                id="ec-image"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] ?? null)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave empty to keep current image.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || isLoading}
          >
            {updateMutation.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
