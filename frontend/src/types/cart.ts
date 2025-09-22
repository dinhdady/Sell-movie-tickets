import type { Movie, Showtime } from './movie';
import type { Seat } from './booking';
export interface CartItem {
  id: string; // unique identifier for cart item
  movie: Movie;
  showtime: Showtime;
  seats: Seat[];
  quantity: number;
  totalPrice: number;
  addedAt: Date;
}
export interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (item: Omit<CartItem, 'id' | 'addedAt'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (movieId: number, showtimeId: number) => boolean;
  debugCart: () => void;
}
