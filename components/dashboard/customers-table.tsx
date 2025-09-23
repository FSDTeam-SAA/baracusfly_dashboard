"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { userAPI } from "@/lib/api"

export function CustomersTable() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([])

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", currentPage],
    queryFn: () => userAPI.getAllCustomers(currentPage, 10),
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allCustomerIds = customers?.data?.data?.customers?.map((customer: any) => customer._id) || []
      setSelectedCustomers(allCustomerIds)
    } else {
      setSelectedCustomers([])
    }
  }

  const handleSelectCustomer = (customerId: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomers((prev) => [...prev, customerId])
    } else {
      setSelectedCustomers((prev) => prev.filter((id) => id !== customerId))
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
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
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
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const customerData = customers?.data?.data?.customers || []
  const totalPages = Math.ceil((customers?.data?.data?.count || 0) / 10)

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedCustomers.length === customerData.length && customerData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-1">
                  <span>#ID</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service Claimed</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Loyalty Points</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customerData.map((customer: any) => (
              <TableRow key={customer._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCustomers.includes(customer._id)}
                    onCheckedChange={(checked) => handleSelectCustomer(customer._id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-medium">#{customer._id.slice(-5)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={customer.profileImage || "/placeholder.svg?height=32&width=32"} />
                      <AvatarFallback>
                        {customer.fullName?.charAt(0).toUpperCase() || customer.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{customer.fullName || "Unknown User"}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{customer.serviceClaimed || 0}</TableCell>
                <TableCell>
                  {customer.lastActivity ? new Date(customer.lastActivity).toLocaleDateString() : "Never"}
                </TableCell>
                <TableCell>{customer.loyaltyPoints || 0}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    Lorem Ipsum
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {Math.min((currentPage - 1) * 10 + 1, customerData.length)} to{" "}
          {Math.min(currentPage * 10, customerData.length)} of {customerData.length} results
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
  )
}
