import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { CartItem, CartContextType } from '../types/cart';
// Cart Actions
type CartAction =
  | { type: 'ADD_TO_CART'; payload: Omit<CartItem, 'id' | 'addedAt'> }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };
// Cart State
interface CartState {
  items: CartItem[];
}
// Cart Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      // Create unique ID using movie ID and timestamp to avoid conflicts
      const uniqueId = `${action.payload.movie.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newItem: CartItem = {
        ...action.payload,
        id: uniqueId,
        addedAt: new Date(),
      };
      return {
        ...state,
        items: [...state.items, newItem],
      };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
      };
    default:
      return state;
  }
};
// Initial state
const initialState: CartState = {
  items: [],
};
// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);
// Cart Provider
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  // Load cart from localStorage on mount
  useEffect(() => {
    // const savedCart = localStorage.getItem('movie-cart');
    const savedCart = localStorage.getItem('movie-cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        // Validate and clean cart items
        const validItems = cartItems.filter((item: any) => {
          return item && 
                 item.id && 
                 item.movie && 
                 item.movie.id && 
                 item.movie.title &&
                 item.showtime &&
                 typeof item.totalPrice === 'number' &&
                 typeof item.quantity === 'number';
        });
        // Convert addedAt strings back to Date objects
        const itemsWithDates = validItems.map((item: any) => ({
          ...item,
          addedAt: item.addedAt ? new Date(item.addedAt) : new Date(),
        }));
        if (itemsWithDates.length > 0) {
          dispatch({ type: 'LOAD_CART', payload: itemsWithDates });
        }
      } catch (error) {
        // Clear corrupted data
        localStorage.removeItem('movie-cart');
      }
    }
  }, []);
  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      if (state.items.length > 0) {
        localStorage.setItem('movie-cart', JSON.stringify(state.items));
      } else {
        // Clear localStorage when cart is empty
        localStorage.removeItem('movie-cart');
      }
    } catch (error) {
    }
  }, [state.items]);
  // Calculate total items
  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
  // Calculate total price
  const totalPrice = state.items.reduce((total, item) => total + item.totalPrice, 0);
  // Add item to cart
  const addToCart = (item: Omit<CartItem, 'id' | 'addedAt'>) => {
    dispatch({ type: 'ADD_TO_CART', payload: item });
  };
  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: itemId });
  };
  // Update quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id: itemId, quantity } });
    }
  };
  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  // Check if item is in cart
  const isInCart = (movieId: number, showtimeId: number) => {
    return state.items.some(item => 
      item.movie.id === movieId && item.showtime.id === showtimeId
    );
  };
  // Debug function to check localStorage
  const debugCart = () => {
    // const savedCart = localStorage.getItem('movie-cart');
  };
  const value: CartContextType = {
    items: state.items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    debugCart,
  };
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
