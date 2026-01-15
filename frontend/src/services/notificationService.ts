// Push Notification Service
class NotificationService {
  private permission: NotificationPermission = 'default';

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      return false;
    }

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  async showNotification(title: string, options?: NotificationOptions) {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  }

  // Booking confirmation notification
  async showBookingConfirmation(bookingDetails: any) {
    return this.showNotification('Đặt vé thành công!', {
      body: `Vé xem phim "${bookingDetails.movieTitle}" đã được đặt thành công`,
      tag: 'booking-success',
      requireInteraction: true
    });
  }

  // Payment confirmation notification
  async showPaymentConfirmation(amount: number) {
    return this.showNotification('Thanh toán thành công!', {
      body: `Đã thanh toán ${amount.toLocaleString('vi-VN')} VNĐ`,
      tag: 'payment-success',
      requireInteraction: true
    });
  }

  // Movie reminder notification
  async showMovieReminder(movieTitle: string, showtime: string) {
    return this.showNotification('Nhắc nhở xem phim', {
      body: `Phim "${movieTitle}" sẽ chiếu lúc ${showtime}`,
      tag: 'movie-reminder',
      requireInteraction: true
    });
  }

  // New movie notification
  async showNewMovieNotification(movieTitle: string) {
    return this.showNotification('Phim mới ra mắt!', {
      body: `"${movieTitle}" đã có sẵn để đặt vé`,
      tag: 'new-movie',
      requireInteraction: true
    });
  }
}

export const notificationService = new NotificationService();
