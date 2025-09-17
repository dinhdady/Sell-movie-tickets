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
      const newItem: CartItem = {
        ...action.payload,
        id: `${action.payload.movie.id}-${action.payload.showtime.id}-${Date.now()}`,
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
    const savedCart = localStorage.getItem('movie-cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        // Convert addedAt strings back to Date objects
        const itemsWithDates = cartItems.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        dispatch({ type: 'LOAD_CART', payload: itemsWithDates });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('movie-cart', JSON.stringify(state.items));
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

  const value: CartContextType = {
    items: state.items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
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
