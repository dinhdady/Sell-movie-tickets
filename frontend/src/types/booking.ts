import type { Showtime } from './movie';
// Seat types
export interface Seat {
  id: number;
  seatNumber: string;
  rowNumber: string;
  columnNumber: number;
  seatType: 'REGULAR' | 'VIP' | 'COUPLE';
  price: number;
  isBooked?: boolean;
  status?: 'AVAILABLE' | 'BOOKED' | 'RESERVED' | 'MAINTENANCE' | 'SELECTED' | 'OCCUPIED';
}
// Booking types
export interface Booking {
  id: number;
  userId: string;
  showtimeId: number;
  totalAmount: number;
  totalPrice: number;
  status: string;
  bookingStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  createdAt: string;
  showtime?: Showtime;
  tickets?: Ticket[];
}
// Ticket types
export interface Ticket {
  id: number;
  bookingId: number;
  seatId: number;
  price: number;
  status: 'ACTIVE' | 'USED' | 'CANCELLED';
  token?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  seat?: Seat;
}
