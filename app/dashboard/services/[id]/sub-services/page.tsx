"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Trash2, Plus, ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { DeleteConfirmModal } from "@/components/dashboard/delete-confirm-modal"
import Link from "next/link"
import { useParams } from "next/navigation"

interface SubService {
  id: string
  name: string
  image: string
  price: number
  loyaltyPoints: number
  date: string
}

export default function SubServicesPage() {
  const params = useParams()
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [deleteService, setDeleteService] = useState<SubService | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const queryClient = useQueryClient()

  const { data: subServices = [], isLoading } = useQuery({
    queryKey: ["sub-services", params.id],
    queryFn: () => api.get(`/services/${params.id}/sub-services`).then((res) => res.data),
  })

  const deleteSubServiceMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/service/delete-service/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sub-services", params.id] })
      toast.success("Sub-service deleted successfully")
      setDeleteService(null)
    },
    onError: () => {
      toast.error("Failed to delete sub-service")
    },
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedServices(subServices.map((service: SubService) => service.id))
    } else {
      setSelectedServices([])
    }
  }

  const handleSelectService = (serviceId: string, checked: boolean) => {
    if (checked) {
      setSelectedServices([...selectedServices, serviceId])
    } else {
      setSelectedServices(selectedServices.filter((id) => id !== serviceId))
    }
  }

  const filteredServices = subServices.filter((service: SubService) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()),
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
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/services">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Haircuts</h1>
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
            <span>Overview</span>
            <span>›</span>
            <span>Services</span>
            <span>›</span>
            <span className="text-gray-900">Sub-service</span>
          </nav>
        </div>
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href={`/dashboard/services/${params.id}/sub-services/add`}>
            <Plus className="w-4 h-4 mr-2" />
            Add Services
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={selectedServices.length === filteredServices.length && filteredServices.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loyalty Points
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service: SubService) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={(checked) => handleSelectService(service.id, checked as boolean)}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={service.image || "/placeholder.svg"} />
                        <AvatarFallback>{service.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-900">{service.price}</td>
                  <td className="px-4 py-4 text-gray-900">{service.loyaltyPoints}</td>
                  <td className="px-4 py-4 text-gray-500">{service.date}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
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

        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">Showing 1 to 5 of {filteredServices.length} results</p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              ‹
            </Button>
            <Button variant="default" size="sm" className="bg-green-600">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <span className="text-gray-500">...</span>
            <Button variant="outline" size="sm">
              8
            </Button>
            <Button variant="outline" size="sm">
              ›
            </Button>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        open={!!deleteService}
        onOpenChange={() => setDeleteService(null)}
        onConfirm={() => deleteService && deleteSubServiceMutation.mutate(deleteService.id)}
        title="Delete Sub-Service"
        description={`Are you sure you want to delete "${deleteService?.name}"? This action cannot be undone.`}
        isLoading={deleteSubServiceMutation.isPending}
      />
    </div>
  )
}
