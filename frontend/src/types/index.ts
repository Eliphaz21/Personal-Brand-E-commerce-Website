export interface User {
  _id?: string;
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'customer' | 'admin';
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  createdAt: string;
}

export type ProductType = 'physical' | 'service' | 'affiliate';

export interface ProductImage {
  url: string;
  publicId: string;
  alt?: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice: number;
  currency: 'USD';
  images: ProductImage[];
  category: string;
  stock: number;
  productType: ProductType;
  affiliateUrl?: string;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  numReviews: number;
  lowStockThreshold?: number;
  weight?: number;
  sku?: string;
  tags?: string[];
  createdAt: string;
}

export interface Review {
  _id: string;
  productId: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: Product;
  qty: number;
}

export interface Cart {
  items: CartItem[];
  totalPrice: number;
}

export interface OrderItem {
  productId: string | Product;
  title: string;
  price: number;
  qty: number;
  image: string;
}

export interface ShippingAddress {
  fullName?: string;
  address: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  orderNumber?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  couponCode?: string;
  totalPrice: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  stripePaymentIntentId?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  replies?: Array<{
    replyMessage: string;
    sentAt: string;
  }>;
  createdAt: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'order' | 'stock' | 'message' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface OverviewStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
}

export interface SalesChartData {
  date: string;
  sales: number;
  orders: number;
}

export interface LowStockProduct {
  _id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
}
