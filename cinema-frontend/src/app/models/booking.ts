import { User } from './user';
import { Movie } from './movie';

export interface Booking {
  id?: number;
  user: User;
  showtime: Showtime;
  order: Order;
  totalPrice: number;
  bookingDate: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface BookingDTO {
  userId: number;
  showtimeId: number;
  orderId: number;
  totalPrice: number;
}

export interface Showtime {
  id?: number;
  movie: Movie;
  room: Room;
  startTime: Date;
  endTime: Date;
  status: 'AVAILABLE' | 'FULL' | 'CANCELLED';
}

export interface Room {
  id?: number;
  name: string;
  capacity: number;
  cinema: Cinema;
  roomType: '2D' | '3D' | 'IMAX';
}

export interface Cinema {
  id?: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  cinemaType: 'STANDARD' | 'PREMIUM' | 'LUXURY';
}

export interface Order {
  id?: number;
  user: User;
  tickets: Ticket[];
  totalAmount: number;
  orderDate: Date;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  transactionId?: string;
  txnRef?: string;
}

export interface Ticket {
  id?: number;
  order: Order;
  seat: Seat;
  showtime: Showtime;
  price: number;
  status: 'AVAILABLE' | 'BOOKED' | 'PAID' | 'CANCELLED';
}

export interface Seat {
  id?: number;
  row: string;
  column: number;
  room: Room;
  seatType: 'STANDARD' | 'VIP' | 'COUPLE';
  price: number;
}
