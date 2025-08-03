/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import type { AppDispatch } from "../store";

export interface ApiError {
  code?: string;
  message: string;
  status?: number;
  details?: any;
}

export const useApiError = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleApiError = useCallback(
    (error: any): ApiError => {
      console.error("API Error:", error);

      // Handle Axios errors
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        // Handle authentication errors
        if (status === 401) {
          // Token might be expired or invalid
          dispatch(logout());
          return {
            code: "UNAUTHORIZED",
            message: "Your session has expired. Please log in again.",
            status,
            details: data,
          };
        }

        // Handle forbidden errors
        if (status === 403) {
          return {
            code: "FORBIDDEN",
            message: "You do not have permission to perform this action.",
            status,
            details: data,
          };
        }

        // Handle not found errors
        if (status === 404) {
          return {
            code: "NOT_FOUND",
            message: "The requested resource was not found.",
            status,
            details: data,
          };
        }

        // Handle rate limiting
        if (status === 429) {
          return {
            code: "RATE_LIMITED",
            message: "Too many requests. Please try again later.",
            status,
            details: data,
          };
        }

        // Handle server errors
        if (status >= 500) {
          return {
            code: "SERVER_ERROR",
            message: "Server error occurred. Please try again later.",
            status,
            details: data,
          };
        }

        // Handle other HTTP errors
        return {
          code: "HTTP_ERROR",
          message:
            data?.message || data?.error || `HTTP ${status} error occurred`,
          status,
          details: data,
        };
      }

      // Handle network errors
      if (error.request) {
        return {
          code: "NETWORK_ERROR",
          message:
            "Unable to connect to the server. Please check your internet connection.",
          details: error.request,
        };
      }

      // Handle timeout errors
      if (error.code === "ECONNABORTED") {
        return {
          code: "TIMEOUT",
          message: "Request timed out. Please try again.",
          details: error,
        };
      }

      // Handle other errors
      return {
        code: "UNKNOWN_ERROR",
        message: error.message || "An unexpected error occurred.",
        details: error,
      };
    },
    [dispatch]
  );

  return { handleApiError };
};
