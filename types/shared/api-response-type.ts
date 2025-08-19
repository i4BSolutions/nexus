// This file defines the types for API responses used in the application.

export type ApiStatus = "success" | "error";

export interface ApiResponse<T = unknown> {
  status: ApiStatus;
  code: number;
  message: string;
  data?: T;
  errors?: {
    field?: string;
    message: string;
  }[];
  meta?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
