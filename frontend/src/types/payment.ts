export interface PaymentMethod {
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
}

export interface PaymentRequest {
  bookingId: number;
  paymentMethod: string;
  amount: number;
  returnUrl?: string;
  cancelUrl?: string;
  description?: string;
}

export interface PaymentResponse {
  paymentUrl: string;
  transactionId: string;
  paymentMethod: string;
  status: string;
  message: string;
  amount: number;
  currency: string;
  returnUrl: string;
  cancelUrl: string;
}
