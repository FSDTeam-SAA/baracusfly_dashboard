"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, Trash2, Plus, Search, Edit } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { DeleteConfirmModal } from "@/components/dashboard/delete-confirm-modal"
import { EditServiceModal } from "./edit/EditServiceModal" // <-- create folder 'edit' and drop the modal

interface Service {
  id: string
  name: string
  image: string
  subServiceCount: number
  serviceProviderCount: number
  commission: string
  date: string
}

export default function ServicesPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [deleteService, setDeleteService] = useState<Service | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const queryClient = useQueryClient()

  // Normalize API response → array of Service
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () =>
      api.get("/service/all-services").then((res) =>
        (res.data?.data || []).map((s: any): Service => ({
          id: s._id,
          name: s.name ?? s.title ?? "Untitled",
          image: s.serviceImage ?? s.image ?? "",
          subServiceCount: Number(s.subServiceCount ?? 0),
          serviceProviderCount: Number(s.serviceProviderCount ?? 0),
          commission: String(s.commission ?? "—"),
          date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—",
        }))
      ),
  })

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/service/delete-service/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] })
      toast.success("Service deleted successfully")
      setDeleteService(null)
    },
    onError: () => toast.error("Failed to delete service"),
  })

  const handleSelectAll = (checked: boolean) => {
    setSelectedServices(checked ? services.map((s) => s.id) : [])
  }

  const handleSelectService = (serviceId: string, checked: boolean) => {
    setSelectedServices((prev) =>
      checked ? (prev.includes(serviceId) ? prev : [...prev, serviceId]) : prev.filter((id) => id !== serviceId)
    )
  }

  const filteredServices = services.filter((service) =>
    (service.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            <span>Overview</span><span>›</span><span className="text-gray-900">Services</span>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={filteredServices.length > 0 && selectedServices.length === filteredServices.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sub-service
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service provider
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={(checked) => handleSelectService(service.id, checked as boolean)}
                      aria-label={`Select ${service.name}`}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={service.image || "/placeholder.svg"} />
                        <AvatarFallback>{service.name?.charAt(0) || "S"}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-900">{service.subServiceCount}</td>
                  <td className="px-4 py-4 text-gray-900">{service.serviceProviderCount}</td>
                  <td className="px-4 py-4 text-gray-900">{service.commission}</td>
                  <td className="px-4 py-4 text-gray-500">{service.date}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/services/${service.id}/sub-services`}>
                          <Eye className="w-4 h-4 text-gray-600" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditId(service.id)
                          setEditOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteService(service)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredServices.length} result{filteredServices.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Edit modal */}
      <EditServiceModal
        serviceId={editId}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["services"] })}
      />

      {/* Delete confirmation */}
      <DeleteConfirmModal
        open={!!deleteService}
        onOpenChange={() => setDeleteService(null)}
        onConfirm={() => deleteService && deleteServiceMutation.mutate(deleteService.id)}
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteService?.name}"? This action cannot be undone.`}
        isLoading={deleteServiceMutation.isPending}
      />
    </div>
  )
}
