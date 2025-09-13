import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface VnpayRequest {
  amount: string;
}

export interface TicketInfo {
  id: number;
  token: string;
  price: number;
  seat: {
    seatNumber: string;
  };
  status: string;
}

export interface PaymentResult {
  status: string;
  message: string;
  orderId: string;
  tickets: TicketInfo[];
  qr?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://localhost:8080/api/vnpay';

  constructor(private http: HttpClient) {}

  createPayment(request: VnpayRequest): Observable<string> {
    return this.http.post(this.apiUrl, request, { responseType: 'text' }).pipe(
      tap(url => console.log('[PaymentService] createPayment response:', url)),
      catchError(err => {
        console.error('[PaymentService] createPayment error:', err);
        throw err;
      })
    );
  }

  getVNPayResult(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/return`, { params }).pipe(
      tap(res => console.log('[PaymentService] getVNPayResult response:', res)),
      catchError(err => {
        console.error('[PaymentService] getVNPayResult error:', err);
        throw err;
      })
    );
  }

  getTicketInfo(orderId: string): Observable<PaymentResult> {
    return this.http.get<PaymentResult>(`${this.apiUrl}/tickets/${orderId}`).pipe(
      tap(res => console.log('[PaymentService] getTicketInfo response:', res)),
      catchError(err => {
        console.error('[PaymentService] getTicketInfo error:', err);
        throw err;
      })
    );
  }
}
