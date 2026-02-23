export interface DashboardStats {
  totalUsers: number
  totalProfessionals: number
  totalBookings: number
  totalEarnings: number
}

export interface DashboardEarningsItem {
  _id: {
    month: number
    year: number
  }
  total: number
}

export interface DashboardBookingDistributionItem {
  _id: string
  count: number
  serviceName: string
}

export interface DashboardBookingEntity {
  _id: string
  email?: string
}

export interface DashboardServiceEntity {
  _id: string
  title?: string
  price?: string | number
}

export interface DashboardRecentBooking {
  _id: string
  service?: DashboardServiceEntity
  user?: DashboardBookingEntity
  seller?: DashboardBookingEntity
  bookingDate?: string
  status?: string
  createdAt?: string
}

export interface DashboardPendingProfessional {
  _id: string
  fullName?: string
  email?: string
  profileImage?: string
  avatar?: string
  serviceName?: string
  status?: string
}

export interface AdminOverviewPayload {
  stats: DashboardStats
  earningsOverview: DashboardEarningsItem[]
  bookingDistribution: DashboardBookingDistributionItem[]
  recentBookings: DashboardRecentBooking[]
  pendingPros: DashboardPendingProfessional[]
}

export interface AdminOverviewResponse {
  statusCode: number
  success: boolean
  message: string
  data: AdminOverviewPayload
}
