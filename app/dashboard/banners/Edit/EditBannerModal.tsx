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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { toast } from "sonner"
import { bannerAPI } from "@/lib/api"

type Props = {
  bannerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function EditBannerModal({
  bannerId,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["banner", bannerId],
    queryFn: async () => {
      if (!bannerId) return null
      const res = await bannerAPI.getBanner(bannerId)
      return res.data
    },
    enabled: open && !!bannerId,
  })

  const [name, setName] = useState("")
  const [status, setStatus] = useState("")
  const [startDate, setStartDate] = useState("") // yyyy-mm-dd
  const [endDate, setEndDate] = useState("")
  const [bannerImage, setBannerImage] = useState<File | null>(null)

  // hydrate fields when data loads
  useEffect(() => {
    const b = data?.data ?? data
    if (!b) return
    setName(b.name ?? b.title ?? "")
    setStatus(b.status ?? "")
    // handle either ISO date or yyyy-mm-dd
    const toInput = (v?: string) =>
      v ? new Date(v).toISOString().slice(0, 10) : ""
    setStartDate(toInput(b.startDate ?? b.start))
    setEndDate(toInput(b.endDate ?? b.end))
  }, [data])

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!bannerId) return
      const fd = new FormData()
      fd.append("name", name)
      if (status) fd.append("status", status)
      if (startDate) fd.append("startDate", `${startDate}T00:00:00.000Z`)
      if (endDate) fd.append("endDate", `${endDate}T23:59:59.000Z`)
      if (bannerImage) fd.append("bannerImage", bannerImage)
      return bannerAPI.updateBanner(bannerId, fd)
    },
    onSuccess: () => {
      toast.success("Banner updated")
      onOpenChange(false)
      onSaved()
    },
    onError: () => toast.error("Failed to update banner"),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit banner</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-sm text-gray-500">Loading…</div>
        ) : (
          <div className="space-y-5">
            <div>
              <Label htmlFor="eb-name">Name</Label>
              <Input
                id="eb-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="eb-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="eb-status">
                  <SelectValue placeholder="Select status…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="schedule">Schedule</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eb-start">Start date</Label>
                <Input
                  id="eb-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="eb-end">End date</Label>
                <Input
                  id="eb-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Show current image */}
            <div>
              <Label>Current Image</Label>
              {data?.data?.image ? (
                <img
                  src={data.data.image}
                  alt="Current banner"
                  className="mt-2 h-32 rounded border object-cover"
                />
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  No image uploaded.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="eb-image">Replace image (optional)</Label>
              <Input
                id="eb-image"
                type="file"
                accept="image/*"
                onChange={(e) => setBannerImage(e.target.files?.[0] ?? null)}
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
