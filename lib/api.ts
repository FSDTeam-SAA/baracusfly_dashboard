import axios from "axios";
import { getSession } from "next-auth/react";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

const api = axios.create({ baseURL });

api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user?.accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }

    // Detect FormData (file/photo/video upload)
    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      // ❌ Remove JSON headers → browser sets multipart automatically
      delete (config.headers as any)["Content-Type"];
      config.transformRequest = [(d) => d];
    } else {
      // Default for non-FormData requests
      config.headers = config.headers ?? {};
      (config.headers as any)["Content-Type"] ??= "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token refresh or redirect to login
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  verifyOTP: (email: string, otp: string) =>
    api.post("/auth/verify-otp", { email, otp }),

  resetPassword: (data: {
    email: string;
    newPassword: string;
    repeatNewPassword: string;
  }) => api.post("/auth/reset-password", data),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api.post("/auth/change-password", data),
};

// Booking APIs
export const bookingAPI = {
  getBookings: (page = 1, limit = 10) =>
    api.get(`/booking?page=${page}&limit=${limit}`),

  updateBookingStatus: (bookingId: string, status: string) =>
    api.patch(`/booking/${bookingId}/status`, { status }),
};

// User APIs
export const userAPI = {
  getAllCustomers: (page = 1, limit = 10) =>
    api.get(`/user/all-users?page=${page}&limit=${limit}`),

  getCustomer: (userId: string) => api.get(`/user/get-user/${userId}`),

  getAllSellers: (page = 1, limit = 10) =>
    api.get(`/user/all-seller?page=${page}&limit=${limit}`),

  getSeller: (sellerId: string) => api.get(`/user/get-seller/${sellerId}`),

  getRequestedSellers: (page = 1, limit = 10) =>
    api.get(`/user/requested-seller?page=${page}&limit=${limit}`),

  updateSellerStatus: (sellerId: string, status: string) =>
    api.patch(`/user/update-requested-seller/${sellerId}`, { status }),
};

// Category APIs
export const categoryAPI = {
  getAllCategories: () => api.get("/category/all-category"),

  createCategory: (data: FormData) =>
    api.post("/category/create-category", data),

  updateCategory: (categoryId: string, data: FormData) =>
    api.patch(`/category/update-category/${categoryId}`, data),
};

// Service APIs
export const serviceAPI = {
  getAllServices: () => api.get("/service/all-services"),

  createService: (data: FormData) => api.post("/service/create-service", data),

  updateService: (serviceId: string, data: FormData) =>
    api.patch(`/service/update-service/${serviceId}`, data),
};

// Banner APIs
export const bannerAPI = {
  getAllBanners: () => api.get("/banners"),

  getBanner: (bannerId: string) => api.get(`/banners/${bannerId}`),

  createBanner: (data: FormData) => api.post("/banners", data),

  updateBanner: (bannerId: string, data: FormData) =>
    api.patch(`/banners/${bannerId}`, data),
};

// Chat APIs
export const chatAPI = {
  createChat: (userId: string) => api.post("/chat/create-chat", { userId }),

  sendMessage: (chatId: string, message: string) =>
    api.post("/chat/send-message", { chatId, message }),

  getChat: (chatId: string) => api.get(`/chat/get-chat/${chatId}`),

  getChatForUser: () => api.get("/chat/get-chat"),
};

export { api };

export default api;
