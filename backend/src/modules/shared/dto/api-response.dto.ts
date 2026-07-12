export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  total?: number;
  error?: {
    code?: string;
    message: string;
    details?: any;
  };
}
