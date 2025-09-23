"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Check, X } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { CheckedState } from "@radix-ui/react-checkbox"
import { DeleteConfirmModal } from "@/components/dashboard/delete-confirm-modal"
import { userAPI } from "@/lib/api" // <- your snippet's file

type Status = "pending" | "approved" | "rejected"

interface ApiSeller {
  _id: string
  email: string
  fullName: string
  phone?: string
  gender?: string
  avatar?: string
  serviceName?: string
  status?: Status
}

interface SellerRequest {
  id: string
  serviceProvider: {
    name: string
    email: string
    avatar: string
  }
  serviceName: string
  status: Status
}

export default function SellerRequestsPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [modalTarget, setModalTarget] = useState<SellerRequest | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const qc = useQueryClient()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["seller-requests", page, limit],
    queryFn: async () => {
      const res = await userAPI.getRequestedSellers(page, limit)
      return res.data
    },
    keepPreviousData: true,
  })

  const requests: SellerRequest[] = useMemo(() => {
    const arr: ApiSeller[] = data?.data?.requestedSeller ?? []
    return arr.map((r) => ({
      id: r._id,
      serviceProvider: { name: r.fullName, email: r.email, avatar: r.avatar || "" },
      serviceName: r.serviceName || "—",
      status: (r.status as Status) || "pending",
    }))
  }, [data])

  const hasNextPage = (data?.data?.requestedSeller?.length ?? 0) === limit
  const hasPrevPage = page > 1

  const approveOne = useMutation({
    mutationFn: (id: string) => userAPI.updateSellerStatus(id, "approved"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-requests"] })
      toast.success("Seller request approved")
    },
    onError: () => toast.error("Failed to approve seller request"),
  })

  const rejectOne = useMutation({
    mutationFn: (id: string) => userAPI.updateSellerStatus(id, "rejected"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-requests"] })
      toast.success("Seller request rejected")
      setModalTarget(null)
    },
    onError: () => toast.error("Failed to reject seller request"),
  })

  const approveBulk = useMutation({
    mutationFn: async () => {
      const ids = (selected.length ? selected : requests.map((r) => r.id))
      if (ids.length === 0) return
      await Promise.all(ids.map((id) => userAPI.updateSellerStatus(id, "approved")))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-requests"] })
      setSelected([])
      toast.success("Approved selected requests")
    },
    onError: () => toast.error("Failed to approve selected requests"),
  })

  const onToggleAll = (checked: CheckedState) => {
    if (checked) setSelected(requests.map((r) => r.id))
    else setSelected([])
  }

  const onToggleRow = (id: string, checked: CheckedState) => {
    if (checked) setSelected((prev) => (prev.includes(id) ? prev : [...prev, id]))
    else setSelected((prev) => prev.filter((x) => x !== id))
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Review and act on pending seller applications.</p>
        </div>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => approveBulk.mutate()}
          disabled={approveBulk.isPending || requests.length === 0}
        >
          {approveBulk.isPending ? "Approving..." : "Approve Selected / All"}
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    aria-label="Select all"
                    checked={requests.length > 0 && selected.length === requests.length}
                    onCheckedChange={onToggleAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length ? (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={selected.includes(r.id)}
                        onCheckedChange={(c) => onToggleRow(r.id, c)}
                        aria-label={`Select ${r.serviceProvider.name}`}
                      />
                    </td>
                    <td className="px-4 py-4 font-medium">#{r.id.slice(-5)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={r.serviceProvider.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{r.serviceProvider.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{r.serviceProvider.name}</p>
                          <p className="text-sm text-gray-500">{r.serviceProvider.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-900">{r.serviceName}</td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium " +
                          (r.status === "approved"
                            ? "bg-green-50 text-green-700"
                            : r.status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700")
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/service-providers/${r.id}`}>
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => approveOne.mutate(r.id)}
                          disabled={approveOne.isPending}
                          aria-label="Approve"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setModalTarget(r)}
                          aria-label="Reject"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} • Showing {requests.length} result{requests.length === 1 ? "" : "s"}
            {isFetching && <span className="ml-2 text-gray-400">(updating…)</span>}
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled={!hasPrevPage} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              ‹
            </Button>
            <Button variant="default" size="sm" className="bg-green-600">{page}</Button>
            <Button variant="outline" size="sm" disabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>
              ›
            </Button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        open={!!modalTarget}
        onOpenChange={() => setModalTarget(null)}
        onConfirm={() => modalTarget && rejectOne.mutate(modalTarget.id)}
        title="Reject Seller Request"
        description={
          modalTarget
            ? `Are you sure you want to reject the request from "${modalTarget.serviceProvider.name}"?`
            : ""
        }
        isLoading={rejectOne.isPending}
      />
    </div>
  )
}
