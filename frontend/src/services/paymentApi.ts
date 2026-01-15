import api from './api';
import type { PaymentMethod, PaymentRequest, PaymentResponse } from '../types/payment';

export const paymentApi = {
  // Get available payment methods
  getPaymentMethods: async (): Promise<Record<string, PaymentMethod>> => {
    const response = await api.get('/payment/methods');
    return response.data.object || {};
  },

  // Create payment
  createPayment: async (request: PaymentRequest): Promise<PaymentResponse> => {
    const response = await api.post('/payment/create', request);
    return response.data.object;
  },

  // VNPay specific methods (existing)
  createVNPayPayment: async (paymentData: any): Promise<string> => {
    const response = await api.post('/vnpay', paymentData);
    return response.data;
  },

  getTicketsByOrderId: async (orderId: string): Promise<any> => {
    const response = await api.get(`/vnpay/tickets/${orderId}`);
    return response.data;
  },

  verifyPayment: async (paymentData: any): Promise<any> => {
    const response = await api.post('/vnpay/verify', paymentData);
    return response.data;
  },

  getBookingByTxnRef: async (txnRef: string): Promise<any> => {
    const response = await api.get(`/booking/txnRef/${txnRef}`);
    return response.data;
  },

  confirmPayment: async (txnRef: string): Promise<any> => {
    const response = await api.post(`/booking/confirm-payment/${txnRef}`);
    return response.data;
  },

  sendBookingEmail: async (bookingId: number, htmlContent: string, subject: string, toEmail: string): Promise<any> => {
    const response = await api.post(`/booking/${bookingId}/send-email`, {
      htmlContent,
      subject,
      toEmail
    });
    return response.data;
  }
};
