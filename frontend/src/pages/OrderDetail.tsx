import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../services/apiClient';
import type { Order } from '../types';
import {
  ArrowLeft, Package, Clock, Loader, CheckCircle, Truck, XCircle, MapPin, CreditCard, AlertCircle
} from 'lucide-react';

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',     color: 'hsl(40,70%,45%)',   icon: <Clock size={14} /> },
  processing: { label: 'Processing',  color: 'hsl(210,80%,50%)',  icon: <Loader size={14} /> },
  shipped:    { label: 'Shipped',     color: 'hsl(200,70%,40%)',  icon: <Truck size={14} /> },
  delivered:  { label: 'Delivered',   color: 'hsl(140,40%,40%)',  icon: <CheckCircle size={14} /> },
  cancelled:  { label: 'Cancelled',   color: 'hsl(0,60%,50%)',    icon: <XCircle size={14} /> },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Payment Pending', color: 'hsl(40,70%,45%)' },
  paid:     { label: 'Paid',            color: 'hsl(140,40%,40%)' },
  failed:   { label: 'Payment Failed',  color: 'hsl(0,60%,50%)' },
  refunded: { label: 'Refunded',        color: 'hsl(210,80%,50%)' },
};

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get(`/orders/${id}`);
        const fetchedOrder = res.data?.order || res.data?.data?.order;
        if (!fetchedOrder) {
          setError('Order not found.');
          return;
        }
        setOrder(fetchedOrder);
      } catch (err: any) {
        console.error('Failed to fetch order:', err);
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Unable to load order details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div className="spinner" style={spinnerStyle} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container" style={{ padding: '4rem 2rem', maxWidth: '720px', textAlign: 'center' }}>
        <AlertCircle size={40} color="var(--color-error)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--color-primary-dark)' }}>{error || 'Order not found'}</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Orders
        </Link>
      </div>
    );
  }

  const statusKey = order.orderStatus?.toLowerCase() || 'pending';
  const statusConfig = ORDER_STATUS_CONFIG[statusKey] || ORDER_STATUS_CONFIG.pending;
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.pending;
  const address = order.shippingAddress;

  return (
    <div className="container" style={{ padding: '3rem 2rem', maxWidth: '960px' }}>
      <Link to="/orders" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '2rem', textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '0.35rem' }}>
            Order #{order.orderNumber || order._id.slice(-8).toUpperCase()}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={badgeStyle(statusConfig.color)}>
            {statusConfig.icon} {statusConfig.label}
          </span>
          <span style={badgeStyle(paymentConfig.color)}>
            <CreditCard size={14} /> {paymentConfig.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }} className="order-detail-grid">
        {/* Items */}
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}><Package size={18} /> Order Items</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex', gap: '1rem', padding: '1rem',
                borderRadius: '12px', backgroundColor: 'var(--color-bg-main)',
                border: '1px solid var(--color-border)'
              }}>
                {item.image && (
                  <div style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-primary-dark)' }}>{item.title}</p>
                  <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    Qty: {item.qty} · ${item.price.toFixed(2)} each
                  </p>
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: 'var(--color-primary-dark)' }}>
                  ${(item.price * item.qty).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Summary + Shipping */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <SummaryRow label="Subtotal" value={`$${order.subtotal.toFixed(2)}`} />
              {order.discount > 0 && (
                <SummaryRow label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`} value={`-$${order.discount.toFixed(2)}`} valueColor="var(--color-success)" />
              )}
              <SummaryRow label="Shipping" value={order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`} />
              <SummaryRow label="Tax" value={`$${order.tax.toFixed(2)}`} />
              <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                <SummaryRow label="Total" value={`$${order.totalPrice.toFixed(2)}`} bold />
              </div>
            </div>
          </section>

          {address && (
            <section style={cardStyle}>
              <h2 style={sectionTitleStyle}><MapPin size={18} /> Shipping Address</h2>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: 1.7 }}>
                {address.fullName && <p style={{ margin: 0, fontWeight: 600 }}>{address.fullName}</p>}
                <p style={{ margin: 0 }}>{address.address}</p>
                <p style={{ margin: 0 }}>
                  {address.city}{address.state ? `, ${address.state}` : ''} {address.postalCode}
                </p>
                <p style={{ margin: 0 }}>{address.country}</p>
                {address.phone && <p style={{ margin: '0.5rem 0 0', color: 'var(--color-text-muted)' }}>{address.phone}</p>}
              </div>
            </section>
          )}

          {(order.trackingNumber || order.estimatedDelivery) && (
            <section style={cardStyle}>
              <h2 style={sectionTitleStyle}><Truck size={18} /> Delivery Info</h2>
              {order.trackingNumber && (
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>
                  <strong>Tracking:</strong> {order.trackingNumber}
                </p>
              )}
              {order.estimatedDelivery && (
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                </p>
              )}
            </section>
          )}

          {order.notes && (
            <section style={cardStyle}>
              <h2 style={sectionTitleStyle}>Order Notes</h2>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{order.notes}</p>
            </section>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .order-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const SummaryRow: React.FC<{ label: string; value: string; bold?: boolean; valueColor?: string }> = ({
  label, value, bold, valueColor
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ color: 'var(--color-text-muted)', fontWeight: bold ? 600 : 400 }}>{label}</span>
    <span style={{ fontWeight: bold ? 700 : 600, color: valueColor || 'var(--color-primary-dark)', fontSize: bold ? '1.1rem' : '0.95rem' }}>
      {value}
    </span>
  </div>
);

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  padding: '0.4rem 0.9rem',
  borderRadius: '999px',
  backgroundColor: `${color}18`,
  color,
  fontSize: '0.8rem',
  fontWeight: 600
});

const cardStyle: React.CSSProperties = {
  padding: '1.5rem',
  background: '#fff',
  border: '1px solid var(--color-border)',
  borderRadius: '16px'
};

const sectionTitleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontSize: '1.1rem',
  color: 'var(--color-primary-dark)',
  marginBottom: '1.25rem'
};

const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '4px solid var(--color-primary-light)',
  borderTop: '4px solid var(--color-primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

export default OrderDetail;
