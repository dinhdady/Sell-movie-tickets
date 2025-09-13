import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  template: `
    <div *ngIf="show && notification && notification.type" class="notification" [class]="'notification-' + notification.type">
      <div class="notification-content">
        <i [class]="getIcon()"></i>
        <span class="notification-message">{{ notification.message }}</span>
        <button class="notification-close" (click)="close()">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./notification.scss']
})
export class NotificationComponent {
  @Input() notification!: Notification;
  @Output() closeNotification = new EventEmitter<void>();

  show = true;

  ngOnInit() {
    if (this.notification && this.notification.duration && this.notification.duration > 0) {
      setTimeout(() => {
        this.close();
      }, this.notification.duration);
    }
  }

  getIcon(): string {
    if (!this.notification || !this.notification.type) {
      return 'fas fa-bell';
    }
    
    switch (this.notification.type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
      default:
        return 'fas fa-bell';
    }
  }

  close() {
    this.show = false;
    this.closeNotification.emit();
  }
} 