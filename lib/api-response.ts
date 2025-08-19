// This file defines the structure of API responses for success and error cases.
// It provides utility functions to create consistent API responses across the application.

import { ApiResponse } from "@/types/shared/api-response-type";

export function success<T>(
  data: T,
  message = "Request successful",
  code = 200
): ApiResponse<T> {
  return {
    status: "success",
    code,
    message,
    data,
  };
}

export function error(
  message: string,
  code = 500,
  meta?: Record<string, any>
): ApiResponse<null> {
  return {
    status: "error",
    code,
    message,
    meta,
  };
}
