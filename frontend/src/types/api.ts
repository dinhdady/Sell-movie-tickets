// API Response types
export interface ResponseObject<T = any> {
  status: string;
  message: string;
  data: T;
}

// Pagination types
export interface PaginatedResponse<T> {
  content: T[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Payment types
export interface VnpayRequest {
  bookingId: number;
  amount: number;
  orderDescription: string;
}

export interface VNPayResponseDTO {
  status: string;
  message: string;
  orderId?: string;
  tickets?: any[];
}
