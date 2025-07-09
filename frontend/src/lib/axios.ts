import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { getCookie } from "cookies-next/client";
import { toast } from "sonner";

// Enhance the API error response interface
interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

// Create axios instance with default config
export const apiClient: AxiosInstance = axios.create({
  baseURL: `http://${process.env.NEXT_PUBLIC_API_URL}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor to handle errors consistently
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // Handle network errors
    if (!error.response) {
      toast.error("Network error. Please check your connection.", {
        id: "network-error",
        duration: 5000,
      });
      throw new Error("Network error");
    }

    const { status, data } = error.response;
    const message = data?.message || "An error occurred";

    // Handle different status codes
    switch (status) {
      case 401:
        if (message === "Two Factor Authentication Required") {
          toast.error("Two Factor Authentication Required", {
            id: "two-factor-authentication-required",
            duration: 5000,
          });
        } else {
          toast.error("Unauthorized. Please login again.", {
            id: "unauthorized",
            duration: 5000,
          });
        }
        break;
      case 403:
        toast.error("You don't have permission to perform this action.", {
          id: "forbidden",
          duration: 5000,
        });
        break;
      case 419:
        toast.error("Session expired, please login again.", {
          id: "session-expired",
          duration: 5000,
        });
        break;
      case 422:
        // Handle validation errors
        if (data.errors) {
          Object.values(data.errors).forEach((errorMessages) => {
            errorMessages.forEach((errorMessage) => {
              toast.error(errorMessage, {
                duration: 5000,
              });
            });
          });
        } else {
          toast.error(message, { duration: 5000 });
        }
        break;
      case 500:
        toast.error("Server error. Please try again later.", {
          id: "server-error",
          duration: 5000,
        });
        break;
      default:
        toast.error(message, { duration: 5000 });
    }

    throw error;
  }
);

// Add auth token to requests
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getCookie("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
