"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { bookingAPI } from "@/lib/api"
import { toast } from "sonner"

interface BookingTableProps {
  statusFilter?: string
}

export function BookingTable({ statusFilter }: BookingTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBookings, setSelectedBookings] = useState<string[]>([])
  const queryClient = useQueryClient()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings", currentPage, statusFilter],
    queryFn: () => bookingAPI.getBookings(currentPage, 10),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: string }) =>
      bookingAPI.updateBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      toast.success("Booking status updated successfully")
    },
    onError: () => {
      toast.error("Failed to update booking status")
    },
  })

  const handleStatusChange = (bookingId: string, status: string) => {
    updateStatusMutation.mutate({ bookingId, status })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allBookingIds = bookings?.data?.data?.bookings?.map((booking: any) => booking._id) || []
      setSelectedBookings(allBookingIds)
    } else {
      setSelectedBookings([])
    }
  }

  const handleSelectBooking = (bookingId: string, checked: boolean) => {
    if (checked) {
      setSelectedBookings((prev) => [...prev, bookingId])
    } else {
      setSelectedBookings((prev) => prev.filter((id) => id !== bookingId))
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
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
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
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  const bookingData = bookings?.data?.data?.bookings || []
  const totalPages = Math.ceil((bookings?.data?.data?.total || 0) / 10)

  return (
    <div className="space-y-4">
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedBookings.length === bookingData.length && bookingData.length > 0}
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
              <TableHead>Service Name</TableHead>
              <TableHead>Service Provider</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookingData.map((booking: any) => (
              <TableRow key={booking._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedBookings.includes(booking._id)}
                    onCheckedChange={(checked) => handleSelectBooking(booking._id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="font-medium">#{booking._id.slice(-5)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>{booking.user?.email?.charAt(0).toUpperCase() || "G"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{booking.user?.email || "Guest User"}</p>
                      <p className="text-sm text-gray-500">example@example.com</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{booking.service?.title || "Service"}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" />
                      <AvatarFallback>{booking.seller?.email?.charAt(0).toUpperCase() || "S"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{booking.seller?.email || "Unknown Seller"}</p>
                      <p className="text-sm text-gray-500">example@example.com</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{new Date(booking.bookingDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Select
                    value={booking.status}
                    onValueChange={(value) => handleStatusChange(booking._id, value)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue>
                        <Badge
                          variant={
                            booking.status === "completed"
                              ? "default"
                              : booking.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            booking.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </SelectItem>
                      <SelectItem value="completed">
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <Badge className="bg-red-100 text-red-800">Cancel</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
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
          Showing {Math.min((currentPage - 1) * 10 + 1, bookingData.length)} to{" "}
          {Math.min(currentPage * 10, bookingData.length)} of {bookingData.length} results
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
