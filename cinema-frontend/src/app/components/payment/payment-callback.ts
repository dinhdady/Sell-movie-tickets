import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../services/payment';
import { VNPayResponseDTO } from '../../models/payment';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-payment-callback',
  templateUrl: './payment-callback.html',
  styleUrls: ['./payment-callback.scss'],
  imports: [CommonModule, RouterModule],
  standalone: true
})
export class PaymentCallbackComponent implements OnInit, AfterViewInit {
  loading = true;
  paymentStatus: 'success' | 'failed' | 'pending' = 'pending';
  error: string | null = null;
  paymentDetails: VNPayResponseDTO = {} as VNPayResponseDTO;
  bookingInfo: any = {};

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  @ViewChild('qrCodeElement', { static: false }) qrCodeElement!: ElementRef;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      console.log('[PaymentCallback] Received VNPay params from URL:', params);

      // Kiểm tra nếu không có tham số từ VNPay thì báo lỗi
      if (Object.keys(params).length === 0 || !params['vnp_ResponseCode']) {
        this.error = 'Không nhận được thông tin callback từ VNPay.';
        this.loading = false;
        this.paymentStatus = 'failed';
        return;
      }
      
      // Gửi toàn bộ tham số nhận được từ VNPay về backend để xác thực
      this.paymentService.getVNPayResult(params).subscribe({
        next: (res) => {
          console.log('[PaymentCallback] Backend validation response:', res);
          this.loading = false;
          this.paymentStatus = 'success';
          this.paymentDetails = res; // res now contains tickets and other information
          console.log('[PaymentCallback] Payment details:', this.paymentDetails);
          
          if (this.paymentDetails.tickets && this.paymentDetails.tickets.length > 0) {
            console.log('[PaymentCallback] Tickets received with tokens:', this.paymentDetails.tickets);
            // Generate QR codes from tokens after view is initialized
            setTimeout(() => this.generateQRCode(), 0);
          } else {
            console.warn('[PaymentCallback] No tickets found in payment details.');
          }
        },
        error: (err) => {
          console.error('[PaymentCallback] Backend validation error:', err);
          this.loading = false;
          this.paymentStatus = 'failed';
          this.error = err.error?.message || 'Lỗi khi xác thực thanh toán tại backend.';
        }
      });
    });
  }

  ngAfterViewInit() {
    // This method is required by AfterViewInit interface
  }

  private generateQRCode() {
    if (this.paymentDetails.tickets && this.paymentDetails.tickets.length > 0 && this.qrCodeElement) {
      const ticket = this.paymentDetails.tickets[0];
      if (ticket.token) {
        try {
          QRCode.toCanvas(this.qrCodeElement.nativeElement, ticket.token, {
            width: 200,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          }, (error) => {
            if (error) {
              console.error('Error generating QR code:', error);
            } else {
              console.log('QR code generated successfully from token:', ticket.token);
            }
          });
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    }
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  navigateToMyTickets() {
    console.log('[PaymentCallback] Navigating to My Tickets');
    this.router.navigate(['/my-tickets']);
  }
}
