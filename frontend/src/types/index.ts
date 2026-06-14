export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  avatar?: string;
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
  product: Product | string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  _id: string;
  user: string | { _id: string; name: string; email: string };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
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
