import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  constructor() {
    console.log('NotificationService constructor called');
  }

  showSuccess(message: string, duration: number = 3000) {
    console.log('NotificationService.showSuccess called with:', message, duration);
    this.showNotification({
      message,
      type: 'success',
      duration
    });
  }

  showError(message: string, duration: number = 3000) {
    console.log('NotificationService.showError called with:', message, duration);
    this.showNotification({
      message,
      type: 'error',
      duration
    });
  }

  showInfo(message: string, duration: number = 3000) {
    console.log('NotificationService.showInfo called with:', message, duration);
    this.showNotification({
      message,
      type: 'info',
      duration
    });
  }

  private showNotification(notification: Notification) {
    console.log('NotificationService.showNotification called with:', notification);
    this.notificationSubject.next(notification);
    
    if (notification.duration) {
      setTimeout(() => {
        console.log('Auto-clearing notification after timeout');
        this.clear();
      }, notification.duration);
    }
  }

  clear() {
    console.log('NotificationService.clear called');
    this.notificationSubject.next(null);
  }
} 