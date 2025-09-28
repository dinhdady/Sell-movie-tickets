import { useEffect } from 'react';
import { notificationService } from '../services/notificationService';

export const useNotifications = () => {
  useEffect(() => {
    // Request permission on app load
    notificationService.requestPermission();
  }, []);

  const showBookingSuccess = async (bookingDetails: any) => {
    await notificationService.showBookingConfirmation(bookingDetails);
  };

  const showPaymentSuccess = async (amount: number) => {
    await notificationService.showPaymentConfirmation(amount);
  };

  const showMovieReminder = async (movieTitle: string, showtime: string) => {
    await notificationService.showMovieReminder(movieTitle, showtime);
  };

  const showNewMovie = async (movieTitle: string) => {
    await notificationService.showNewMovieNotification(movieTitle);
  };

  return {
    showBookingSuccess,
    showPaymentSuccess,
    showMovieReminder,
    showNewMovie
  };
};
