export interface Payment {
  id?: number;
  order: any; // Order interface
  amount: number;
  paymentMethod: 'VNPAY' | 'CASH' | 'CREDIT_CARD';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  paymentDate?: Date;
  description?: string;
}

export interface VNPayRequestDTO {
  amount: number;
  orderInfo: string;
  orderId: number;
  returnUrl: string;
}

export interface VNPayResponseDTO {
  responseCode: string;
  responseMessage: string;
  message: string;
  orderId: string;
  tickets: any[];
  qrCodes: string[];
  customerEmail: string;
  ticketCount: number;
  movieTitle?: string;
  cinemaName?: string;
  roomName?: string;
  showtime?: string;
}
