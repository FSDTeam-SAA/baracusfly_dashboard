"use client"

import { useState } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Trash2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { DeleteConfirmModal } from "@/components/dashboard/delete-confirm-modal"
import Link from "next/link"

export function ServiceProvidersTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [providerToDelete, setProviderToDelete] = useState<any>(null)
  const queryClient = useQueryClient()

  const { data: providers, isLoading } = useQuery({
    queryKey: ["service-providers", currentPage],
    queryFn: () => api.get(`/user/all-seller?page=${currentPage}&limit=10`).then((res) => res.data),
  })

  const deleteSellerMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/user/delete-seller/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-providers"] })
      toast.success("Service provider deleted successfully")
      setDeleteModalOpen(false)
      setProviderToDelete(null)
    },
    onError: () => {
      toast.error("Failed to delete service provider")
    },
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allProviderIds = providers?.data?.sellers?.map((provider: any) => provider._id) || []
      setSelectedProviders(allProviderIds)
    } else {
      setSelectedProviders([])
    }
  }

  const handleSelectProvider = (providerId: string, checked: boolean) => {
    if (checked) {
      setSelectedProviders((prev) => [...prev, providerId])
    } else {
      setSelectedProviders((prev) => prev.filter((id) => id !== providerId))
    }
  }

  const handleDeleteClick = (provider: any) => {
    setProviderToDelete(provider)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (providerToDelete) {
      deleteSellerMutation.mutate(providerToDelete._id)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(10)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const providerData = providers?.data?.sellers || []
  const totalPages = Math.ceil((providers?.data?.count || 0) / 10)

  return (
    <>
      <div className="space-y-4">
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProviders.length === providerData.length && providerData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <span>#ID</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </TableHead>
                <TableHead>Service Provider</TableHead>
                <TableHead>Total Commissions</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providerData.map((provider: any) => (
                <TableRow key={provider._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProviders.includes(provider._id)}
                      onCheckedChange={(checked) => handleSelectProvider(provider._id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">#{provider._id.slice(-5)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={provider.profileImage || "/placeholder.svg?height=32&width=32"} />
                        <AvatarFallback>
                          {provider.fullName?.charAt(0).toUpperCase() || provider.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{provider.fullName || "Unknown Provider"}</p>
                        <p className="text-sm text-gray-500">{provider.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>${provider.totalCommission || 1234}</TableCell>
                  <TableCell>
                    {provider.lastActivity ? new Date(provider.lastActivity).toLocaleDateString() : "Jan 6, 2022"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="p-2" asChild>
                        <Link href={`/dashboard/service-providers/${provider._id}`}>
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2" onClick={() => handleDeleteClick(provider)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {Math.min((currentPage - 1) * 10 + 1, providerData.length)} to{" "}
            {Math.min(currentPage * 10, providerData.length)} of {providerData.length} results
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {pageNum}
                </Button>
              )
            })}
            {totalPages > 5 && (
              <>
                <span className="text-gray-500">...</span>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Service Provider"
        description={`Are you sure you want to delete "${providerToDelete?.fullName || "this service provider"}"? This action cannot be undone.`}
        isLoading={deleteSellerMutation.isPending}
      />
    </>
  )
}
