import type { Showtime } from './movie';

// Seat types
export interface Seat {
  id: number;
  row: string;
  number: number;
  roomId: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  seatType: 'STANDARD' | 'VIP' | 'COUPLE';
  price: number;
}

// Booking types
export interface Booking {
  id: number;
  userId: number;
  showtimeId: number;
  totalAmount: number;
  bookingStatus: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
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
  qrCode?: string;
  seat?: Seat;
}
