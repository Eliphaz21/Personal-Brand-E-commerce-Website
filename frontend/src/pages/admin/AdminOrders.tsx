import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import type { Order } from '../../types';
import {
  Search,
  Eye,
  Edit,
  Loader,
  X,
  AlertCircle,
  CheckCircle,
  Truck,
  Calendar,
  User,
  ShoppingBag
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Order for viewing details & editing status
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEditStatusOpen, setIsEditStatusOpen] = useState(false);

  // Edit Form states
  const [newOrderStatus, setNewOrderStatus] = useState<Order['orderStatus']>('pending');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      setError('');
      const res = await apiClient.get('/orders');
      const data = res.data?.data?.orders || res.data?.orders || [];
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching admin orders:', err);
      setOrders([]);
      setError(
        err.response?.data?.message ||
        'Could not retrieve orders listing. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const openEditStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.orderStatus);
    setTrackingNumber(order.trackingNumber || '');
    setModalError('');
    setIsEditStatusOpen(true);
  };

  const handleStatusUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setModalError('');
    setSubmitting(true);

    try {
      await apiClient.put(`/orders/${selectedOrder._id}/status`, {
        orderStatus: newOrderStatus,
        trackingNumber: trackingNumber.trim() || undefined
      });

      setSuccessMsg(`Order status updated successfully!`);
      setIsEditStatusOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);

      // Refresh list
      fetchOrders();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      setModalError(
        err.response?.data?.message ||
        'Failed to update order status. Please verify parameters.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    // Search match (order id, order number, client name/email)
    const clientName = (order.userId as any)?.name || '';
    const clientEmail = (order.userId as any)?.email || '';
    const searchString = `${order._id} ${order.orderNumber || ''} ${clientName} ${clientEmail}`.toLowerCase();
    const matchesSearch = searchString.includes(search.toLowerCase());

    // Status filter match
    const matchesStatus = statusFilter === '' || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getOrderStatusBadgeStyles = (status: Order['orderStatus']) => {
    switch (status) {
      case 'delivered':
        return { bg: 'rgba(39, 174, 96, 0.1)', text: 'var(--color-success)' };
      case 'shipped':
        return { bg: 'rgba(54, 162, 235, 0.1)', text: '#36a2eb' };
      case 'processing':
        return { bg: 'rgba(212, 163, 115, 0.15)', text: 'var(--color-secondary)' };
      case 'pending':
        return { bg: 'rgba(255, 206, 86, 0.15)', text: '#d89b00' };
      case 'cancelled':
        return { bg: 'rgba(235, 87, 87, 0.1)', text: 'var(--color-error)' };
      default:
        return { bg: 'rgba(120, 120, 120, 0.1)', text: 'var(--color-text-muted)' };
    }
  };

  const getPaymentStatusBadgeStyles = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'paid':
        return { bg: 'rgba(39, 174, 96, 0.1)', text: 'var(--color-success)' };
      case 'pending':
        return { bg: 'rgba(255, 206, 86, 0.15)', text: '#d89b00' };
      case 'failed':
      case 'refunded':
        return { bg: 'rgba(235, 87, 87, 0.1)', text: 'var(--color-error)' };
      default:
        return { bg: 'rgba(120, 120, 120, 0.1)', text: 'var(--color-text-muted)' };
    }
  };

  return (
    <div className="admin-orders" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
          Manage Orders
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
          Monitor sales shipments, configure tracking numbers, and update client order logs.
        </p>
      </div>

      {successMsg && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(39, 174, 96, 0.06)',
          border: '1px solid rgba(39, 174, 96, 0.2)',
          color: 'var(--color-success)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(235, 87, 87, 0.06)',
          border: '1px solid rgba(235, 87, 87, 0.2)',
          color: 'var(--color-error)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{
        padding: '1.25rem',
        borderRadius: '16px',
        border: '1px solid var(--color-border)',
        background: 'rgba(255, 255, 255, 0.65)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '450px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by Order ID, number, or client details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 1rem 0.625rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#fff',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              backgroundColor: '#fff',
              fontSize: '0.9rem',
              minWidth: '180px'
            }}
          >
            <option value="">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Orders List Table */}
      <div className="glass-panel" style={{
        borderRadius: '20px',
        border: '1px solid var(--color-border)',
        background: 'rgba(255, 255, 255, 0.7)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
            <Loader size={36} className="spin-animation" style={{ color: 'var(--color-primary)' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Refreshing orders database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No orders found matching filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(74, 117, 89, 0.04)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Order Info</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Client</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Date</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Total</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Payment Status</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Fulfillment</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const clientName = (ord.userId as any)?.name || 'Guest User';
                  const clientEmail = (ord.userId as any)?.email || 'guest@example.com';
                  const orderStat = getOrderStatusBadgeStyles(ord.orderStatus);
                  const payStat = getPaymentStatusBadgeStyles(ord.paymentStatus);

                  return (
                    <tr
                      key={ord._id}
                      style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'transparent', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.9rem' }}>
                            #{ord.orderNumber || ord._id.slice(-8).toUpperCase()}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            ID: {ord._id}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {clientName}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {clientEmail}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: 'var(--color-text-main)' }}>
                        {new Date(ord.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
                        ${ord.totalPrice.toFixed(2)}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: payStat.bg,
                          color: payStat.text,
                          textTransform: 'capitalize'
                        }}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          padding: '0.25rem 0.625rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: orderStat.bg,
                          color: orderStat.text,
                          textTransform: 'capitalize'
                        }}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openDetails(ord)}
                            style={{
                              border: 'none',
                              background: 'none',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              color: 'var(--color-primary)',
                              borderRadius: '6px'
                            }}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEditStatus(ord)}
                            style={{
                              border: 'none',
                              background: 'none',
                              padding: '0.5rem',
                              cursor: 'pointer',
                              color: 'var(--color-secondary)',
                              borderRadius: '6px'
                            }}
                            title="Edit Status"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: VIEW DETAILS */}
      {isDetailsOpen && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem 1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            backgroundColor: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 2rem',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'rgba(74, 117, 89, 0.02)'
            }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
                  Order Details
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ID: {selectedOrder._id}</span>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable details */}
            <div style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '65vh' }}>

              {/* Order Meta details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Calendar size={18} style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }} />
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Date & Time</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <User size={18} style={{ color: 'var(--color-primary)', marginTop: '0.15rem' }} />
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>Customer Details</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{(selectedOrder.userId as any)?.name || 'Guest User'}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>{(selectedOrder.userId as any)?.email}</span>
                  </div>
                </div>
              </div>

              {/* Status metrics details */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '1rem',
                backgroundColor: 'rgba(0,0,0,0.02)',
                padding: '1rem',
                borderRadius: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Payment Status</span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: getPaymentStatusBadgeStyles(selectedOrder.paymentStatus).text
                  }}>
                    {selectedOrder.paymentStatus.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Fulfillment Status</span>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: getOrderStatusBadgeStyles(selectedOrder.orderStatus).text
                  }}>
                    {selectedOrder.orderStatus.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Tracking Code</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'monospace' }}>
                    {selectedOrder.trackingNumber || 'Not Attached'}
                  </span>
                </div>
              </div>

              {/* Shipping Address details */}
              <div>
                <h4 style={{ color: 'var(--color-primary-dark)', fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck size={16} /> Delivery Address
                </h4>
                {selectedOrder.shippingAddress ? (
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--color-text-main)' }}>
                    <div><strong>{selectedOrder.shippingAddress.fullName}</strong></div>
                    <div>{selectedOrder.shippingAddress.address}</div>
                    <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state || ''} {selectedOrder.shippingAddress.postalCode}</div>
                    <div>{selectedOrder.shippingAddress.country}</div>
                    {selectedOrder.shippingAddress.phone && <div>Phone: {selectedOrder.shippingAddress.phone}</div>}
                  </div>
                ) : (
                  <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-text-muted)' }}>No physical delivery address required (Digital Coaching/Book).</span>
                )}
              </div>

              {/* Cart Items list */}
              <div>
                <h4 style={{ color: 'var(--color-primary-dark)', fontSize: '0.95rem', fontWeight: 700, borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingBag size={16} /> Purchased Items ({selectedOrder.items?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0',
                        borderBottom: index < selectedOrder.items.length - 1 ? '1px dashed var(--color-border)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={item.image || 'https://via.placeholder.com/40?text=No+Img'}
                          alt=""
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-border)' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Qty: {item.qty} × ${item.price.toFixed(2)}</div>
                        </div>
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        ${(item.qty * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h4 style={{ color: 'var(--color-primary-dark)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Customer Notes
                  </h4>
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(212, 163, 115, 0.08)',
                    border: '1px solid rgba(212, 163, 115, 0.2)',
                    fontSize: '0.85rem',
                    lineHeight: '1.5'
                  }}>
                    {selectedOrder.notes}
                  </div>
                </div>
              )}

              {/* Total Calculation */}
              <div style={{
                borderTop: '1px solid var(--color-border)',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.5rem',
                fontSize: '0.9rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Subtotal:</span>
                  <span>${selectedOrder.subtotal?.toFixed(2) || (selectedOrder.totalPrice - (selectedOrder.tax || 0)).toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px', color: 'var(--color-error)' }}>
                    <span>Discount:</span>
                    <span>-${selectedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrder.shippingCost > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
                    <span>Shipping:</span>
                    <span>${selectedOrder.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Tax (8%):</span>
                  <span>${selectedOrder.tax?.toFixed(2) || '0.00'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary-dark)', borderTop: '1px solid var(--color-border)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <span>Grand Total:</span>
                  <span>${selectedOrder.totalPrice.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '1.25rem 2rem',
              borderTop: '1px solid var(--color-border)',
              backgroundColor: 'rgba(74, 117, 89, 0.02)'
            }}>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="btn btn-outline"
                style={{ fontSize: '0.9rem', padding: '0.625rem 1.25rem' }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT ORDER STATUS */}
      {isEditStatusOpen && selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem 1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '450px',
            backgroundColor: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 2rem',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'rgba(74, 117, 89, 0.02)'
            }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
                Update Order #{selectedOrder.orderNumber || selectedOrder._id.slice(-8).toUpperCase()}
              </h2>
              <button
                onClick={() => setIsEditStatusOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleStatusUpdateSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {modalError && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(235, 87, 87, 0.06)',
                    border: '1px solid rgba(235, 87, 87, 0.2)',
                    color: 'var(--color-error)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Fulfillment Status *</label>
                  <select
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value as any)}
                    className="form-input"
                    style={{ width: '100%' }}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Carrier Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="form-input"
                    placeholder="e.g. DHL98127391283"
                    style={{ width: '100%' }}
                  />
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                    Required when shifting order status to "Shipped".
                  </small>
                </div>

              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                padding: '1.25rem 2rem',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'rgba(74, 117, 89, 0.02)'
              }}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsEditStatusOpen(false)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.9rem', padding: '0.625rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    fontSize: '0.9rem',
                    padding: '0.625rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="spin-animation" /> Updating...
                    </>
                  ) : (
                    'Save Status'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .orders-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          
          .filter-bar {
            width: 100% !important;
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          
          .filter-select {
            width: 100% !important;
          }
          
          .orders-table {
            font-size: 0.85rem !important;
          }
          
          .orders-table th,
          .orders-table td {
            padding: 0.75rem 0.5rem !important;
          }
          
          .order-details {
            padding: 1.5rem !important;
          }
          
          .order-info-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }

        @media (max-width: 480px) {
          .orders-table-container {
            overflow-x: auto !important;
          }
          
          .orders-table {
            min-width: 700px !important;
          }
          
          .status-badge {
            font-size: 0.75rem !important;
            padding: 0.25rem 0.5rem !important;
          }
          
          .action-buttons {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          
          .action-button {
            width: 100% !important;
            justify-content: center !important;
          }
          
          .modal-content {
            width: 95% !important;
            max-height: 90vh !important;
            margin: 5vh auto !important;
          }
          
          .order-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminOrders;
