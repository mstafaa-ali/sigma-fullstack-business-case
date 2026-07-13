export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: any;
}

export interface ApiError {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
