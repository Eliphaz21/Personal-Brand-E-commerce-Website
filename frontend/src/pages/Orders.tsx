import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import type { Order } from '../types';
import {
  ShoppingBag, ArrowRight, Clock, Loader, CheckCircle, Truck, XCircle
} from 'lucide-react';

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',     color: 'hsl(40,70%,45%)',   icon: <Clock size={14} /> },
  processing: { label: 'Processing',  color: 'hsl(210,80%,50%)',  icon: <Loader size={14} /> },
  shipped:    { label: 'Shipped',     color: 'hsl(200,70%,40%)',  icon: <Truck size={14} /> },
  delivered:  { label: 'Delivered',   color: 'hsl(140,40%,40%)',  icon: <CheckCircle size={14} /> },
  cancelled:  { label: 'Cancelled',   color: 'hsl(0,60%,50%)',    icon: <XCircle size={14} /> },
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: 'Payment Pending',
  paid: 'Paid',
  failed: 'Payment Failed',
  refunded: 'Refunded',
};

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/orders/myorders');
        const fetchedOrders = res.data?.orders || res.data?.data?.orders || [];
        setOrders(fetchedOrders);
      } catch (err: any) {
        console.error('Failed to fetch orders:', err);
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Unable to load your orders. Please try again.'
        );
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container" style={{ padding: '3rem 2rem', maxWidth: '960px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
          My Orders
        </h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Track your purchases, shipping status, and order details.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={spinnerStyle} />
        </div>
      ) : error ? (
        <div style={messageBoxStyle}>
          <p style={{ color: 'var(--color-error)', margin: 0 }}>{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ ...messageBoxStyle, textAlign: 'center' }}>
          <ShoppingBag size={48} color="var(--color-primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <h3 style={{ color: 'var(--color-primary-dark)' }}>No Orders Yet</h3>
          <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
            Browse our catalog and add products to your cart to place your first order.
          </p>
          <Link to="/shop" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => {
            const statusKey = order.orderStatus?.toLowerCase() || 'pending';
            const statusConfig = ORDER_STATUS_CONFIG[statusKey] || ORDER_STATUS_CONFIG.pending;
            const itemCount = order.items?.reduce((sum, item) => sum + item.qty, 0) || 0;

            return (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="glass-panel" style={{
                  padding: '1.5rem',
                  background: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '14px',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Order</p>
                      <p style={{ margin: 0, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-primary-dark)' }}>
                        #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                      </p>
                      <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.35rem 0.9rem', borderRadius: '999px',
                        backgroundColor: `${statusConfig.color}18`,
                        color: statusConfig.color,
                        fontSize: '0.8rem', fontWeight: 600
                      }}>
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>
                        ${order.totalPrice.toFixed(2)}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                        View Details <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '4px solid var(--color-primary-light)',
  borderTop: '4px solid var(--color-primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const messageBoxStyle: React.CSSProperties = {
  padding: '3rem 2rem',
  background: '#fff',
  border: '1px solid var(--color-border)',
  borderRadius: '16px'
};

export default Orders;
