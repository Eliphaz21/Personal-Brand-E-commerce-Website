import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import apiClient from '../services/apiClient';
import type { CartItem } from '../types';
import { AuthContext } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  totalPrice: number;
  totalItemsCount: number;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, qty: number) => Promise<void>;
  updateCartItemQuantity: (productId: string, qty: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useContext(AuthContext);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!auth?.isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get('/cart');
      const cartData = response.data?.cart || response.data?.data?.cart || response.data?.data || response.data;
      setCartItems(cartData.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [auth?.isAuthenticated]);

  // Sync cart when user signs in or out
  useEffect(() => {
    if (auth?.isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [auth?.isAuthenticated, fetchCart]);

  const addToCart = async (productId: string, qty: number) => {
    if (!auth?.isAuthenticated) {
      throw new Error('Unauthorized');
    }
    try {
      const response = await apiClient.post('/cart/items', { productId, qty });
      const cartData = response.data?.cart || response.data?.data?.cart || response.data?.data || response.data;
      setCartItems(cartData.items || []);
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      throw error;
    }
  };

  const updateCartItemQuantity = async (productId: string, qty: number) => {
    if (!auth?.isAuthenticated) return;
    try {
      const response = await apiClient.put(`/cart/items/${productId}`, { qty });
      const cartData = response.data?.cart || response.data?.data?.cart || response.data?.data || response.data;
      setCartItems(cartData.items || []);
    } catch (error) {
      console.error('Failed to update cart item quantity:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!auth?.isAuthenticated) return;
    try {
      const response = await apiClient.delete(`/cart/items/${productId}`);
      const cartData = response.data?.cart || response.data?.data?.cart || response.data?.data || response.data;
      setCartItems(cartData.items || []);
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!auth?.isAuthenticated) return;
    try {
      await apiClient.delete('/cart');
      setCartItems([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + (item.productId?.price || 0) * item.qty,
    0
  );

  const totalItemsCount = cartItems.reduce((total, item) => total + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        totalPrice,
        totalItemsCount,
        fetchCart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
