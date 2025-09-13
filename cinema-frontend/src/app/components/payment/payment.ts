import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Notification, NotificationComponent } from '../shared/notification/notification';
import { PaymentService, VnpayRequest } from '../../services/payment';

@Component({
  selector: 'app-payment',
  imports: [RouterModule, CommonModule, FormsModule, NotificationComponent],
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss']
})
export class Payment implements OnInit {
  paymentData: any = {
    orderId: '',
    amount: 0,
    orderInfo: '',
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  };
  selectedPaymentMethod = 'vnpay';
  loading = false;
  processing = false;
  notifications: Notification[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.paymentData = {
        orderId: params['orderId'] || '',
        amount: params['amount'] ? parseFloat(params['amount']) : 0,
        orderInfo: params['orderInfo'] || '',
        customerName: params['customerName'] || '',
        customerEmail: params['customerEmail'] || '',
        customerPhone: params['customerPhone'] || ''
      };
      if (!this.paymentData.orderId || !this.paymentData.amount) {
        this.showNotification('error', 'Thiếu thông tin thanh toán!');
        this.router.navigate(['/']);
      }
    });
  }

  processPayment() {
    if (!this.paymentData.orderId || !this.paymentData.amount) {
      this.showNotification('error', 'Thiếu thông tin thanh toán!');
      return;
    }
    this.processing = true;
    const paymentPayload: VnpayRequest = {
      amount: String(this.paymentData.amount)
    };
    this.paymentService.createPayment(paymentPayload).subscribe({
      next: (url) => {
        window.location.href = url;
      },
      error: (err) => {
        this.processing = false;
        this.showNotification('error', 'Không thể tạo thanh toán VNPay!');
      }
    });
  }

  showNotification(type: 'success' | 'error' | 'info', message: string) {
    this.notifications.push({ type, message });
  }

  closeNotification(index: number) {
    this.notifications.splice(index, 1);
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
