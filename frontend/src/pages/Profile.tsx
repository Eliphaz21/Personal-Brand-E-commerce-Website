import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import type { Order } from '../types';
import {
  User, Mail, Shield, CheckCircle, Package, Clock,
  Edit2, Save, X, Loader, AlertCircle, ShoppingBag,
  Truck, XCircle, LogOut, KeyRound
} from 'lucide-react';

type ProfileTab = 'account' | 'orders';

interface ProfileEditForm {
  name: string;
  bio: string;
}

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'hsl(40,70%,45%)', icon: <Clock size={14} /> },
  processing: { label: 'Processing', color: 'hsl(210,80%,50%)', icon: <Loader size={14} /> },
  shipped: { label: 'Shipped', color: 'hsl(200,70%,40%)', icon: <Truck size={14} /> },
  delivered: { label: 'Delivered', color: 'hsl(140,40%,40%)', icon: <CheckCircle size={14} /> },
  cancelled: { label: 'Cancelled', color: 'hsl(0,60%,50%)', icon: <XCircle size={14} /> },
};

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ProfileTab>('account');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileEditForm>({ name: user?.name || '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // Fetch orders when switching to orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    try {
      const res = await apiClient.get('/orders/myorders');
      const fetchedOrders = res.data?.orders || res.data?.data?.orders || [];
      setOrders(fetchedOrders);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
      setOrdersError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Unable to load your orders.'
      );
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (!editing) {
      setEditForm({ name: user?.name || '', bio: '' });
      setSaveError('');
      setSaveSuccess('');
    }
    setEditing(!editing);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      await apiClient.patch('/users/profile', {
        name: editForm.name,
        bio: editForm.bio,
      });
      setSaveSuccess('Profile updated successfully!');
      setEditing(false);
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setSaveError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="profile-page container" style={{ padding: '3rem 2rem', maxWidth: '900px' }}>

      {/* Header Card */}
      <div className="glass-panel" style={{
        padding: '2.5rem',
        marginBottom: '2rem',
        background: '#fff',
        border: '1px solid var(--color-border)',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        flexWrap: 'wrap'
      }}>
        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)',
            border: '3px solid var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', fontFamily: 'var(--font-heading)' }}>
                {initials}
              </span>
            )}
          </div>
          {user?.isVerified && (
            <div style={{ position: 'absolute', bottom: 2, right: 2, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-success)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={12} color="#fff" />
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: '0.35rem' }}>
            {user?.name}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Mail size={14} /> {user?.email}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              padding: '0.25rem 0.75rem', borderRadius: '999px',
              backgroundColor: user?.role === 'admin' ? 'rgba(175,130,80,0.15)' : 'var(--color-primary-light)',
              color: user?.role === 'admin' ? 'var(--color-secondary-dark)' : 'var(--color-primary-dark)',
              fontSize: '0.8rem', fontWeight: 600
            }}>
              <Shield size={12} />
              {user?.role === 'admin' ? 'Administrator' : 'Customer Account'}
            </span>
            {user?.isVerified && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.25rem 0.75rem', borderRadius: '999px',
                backgroundColor: 'rgba(39,174,96,0.1)', color: 'var(--color-success)',
                fontSize: '0.8rem', fontWeight: 600
              }}>
                <CheckCircle size={12} /> Email Verified
              </span>
            )}
          </div>
        </div>

        {/* Edit button */}
        <button
          onClick={handleEditToggle}
          className={`btn ${editing ? 'btn-outline' : 'btn-glass'}`}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {editing ? <><X size={16} /> Cancel</> : <><Edit2 size={16} /> Edit Profile</>}
        </button>
      </div>

      {/* Save Success / Error Banners */}
      {saveSuccess && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)', marginBottom: '1.5rem', color: 'var(--color-success)', fontWeight: 500 }}>
          <CheckCircle size={18} /> {saveSuccess}
        </div>
      )}
      {saveError && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(235,87,87,0.08)', border: '1px solid rgba(235,87,87,0.2)', marginBottom: '1.5rem', color: 'var(--color-error)', fontWeight: 500 }}>
          <AlertCircle size={18} /> {saveError}
        </div>
      )}

      {/* Edit Form (conditional) */}
      {editing && (
        <div className="glass-panel animate-fade-in-down" style={{ padding: '2rem', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '16px', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Update Your Details</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="edit-name">Full Name</label>
              <input
                id="edit-name" type="text" required
                value={editForm.name}
                onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                className="form-input"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="edit-bio">Personal Bio (Optional)</label>
              <textarea
                id="edit-bio" rows={3}
                placeholder="Tell us a bit about your wellness journey..."
                value={editForm.bio}
                onChange={e => setEditForm(p => ({ ...p, bio: e.target.value }))}
                className="form-input"
                style={{ resize: 'none' }}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {saving ? <><Loader size={16} className="spin-animation" /> Saving...</> : <><Save size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', gap: '0' }}>
        {([
          { key: 'account', label: 'Account Details', icon: <User size={16} /> },
          { key: 'orders', label: 'My Orders', icon: <Package size={16} /> },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '3px solid var(--color-primary)' : '3px solid transparent',
              padding: '1rem 1.5rem',
              fontWeight: 600, fontSize: '0.95rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              color: activeTab === tab.key ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ACCOUNT TAB */}
      {activeTab === 'account' && (
        <div className="glass-panel" style={{ padding: '2rem', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '16px' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary-dark)' }}>Account Information</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                { label: 'Full Name', value: user?.name },
                { label: 'Email Address', value: user?.email },
                { label: 'Account Role', value: user?.role === 'admin' ? 'Administrator' : 'Customer' },
                { label: 'Email Verified', value: user?.isVerified ? '✓ Verified' : '✗ Not Verified' },
                { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A' },
              ].map(row => (
                <tr key={row.label} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem 0.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', width: '40%', fontSize: '0.9rem' }}>
                    {row.label}
                  </td>
                  <td style={{ padding: '1rem 0.5rem', color: 'var(--color-text-main)', fontSize: '0.9rem' }}>
                    {row.value || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <h4 style={{ color: 'var(--color-primary-dark)', marginBottom: '1rem', fontSize: '1rem' }}>Security & Session</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <Link
                to="/profile/change-password"
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                <KeyRound size={16} /> Change Password
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-outline"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)', borderColor: 'rgba(235,87,87,0.35)' }}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div>
          {ordersLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div className="spinner" style={spinnerStyle} />
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <ShoppingBag size={48} color="var(--color-primary)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--color-primary-dark)' }}>No Orders Yet</h3>
              <p style={{ color: 'var(--color-text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
                Start exploring our wellness supplements and coaching services.
              </p>
              <Link to="/shop" className="btn btn-primary">Browse Products</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {ordersError && (
                <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(235,87,87,0.08)', color: 'var(--color-error)', fontSize: '0.9rem' }}>
                  {ordersError}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Link to="/orders" style={{ color: 'var(--color-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>
                  View all orders →
                </Link>
              </div>
              {orders.slice(0, 5).map(order => {
                const statusKey = order.orderStatus?.toLowerCase() || 'pending';
                const statusConfig = ORDER_STATUS_CONFIG[statusKey] || ORDER_STATUS_CONFIG.pending;

                return (
                  <div key={order._id} className="glass-panel" style={{
                    padding: '1.5rem',
                    background: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: '14px'
                  }}>
                    {/* Order Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Order ID</p>
                        <p style={{ margin: 0, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-primary-dark)' }}>
                          #{order._id?.toString().slice(-8).toUpperCase()}
                        </p>
                      </div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.35rem 0.9rem', borderRadius: '999px',
                        backgroundColor: `${statusConfig.color}18`,
                        color: statusConfig.color,
                        fontSize: '0.8rem', fontWeight: 600
                      }}>
                        {statusConfig.icon} {statusConfig.label}
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--color-primary-dark)', fontSize: '1.05rem' }}>
                          ${order.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '8px', backgroundColor: 'var(--color-bg-main)', border: '1px solid var(--color-border)', flex: '1 1 auto', minWidth: '200px', maxWidth: '360px' }}>
                          {item.image && (
                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.title}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              Qty: {item.qty} · ${item.price.toFixed(2)} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Link
                      to={`/orders/${order._id}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-secondary)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}
                    >
                      View full order details →
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        .spin-animation { animation: rotate 1.5s linear infinite; }
        @keyframes rotate { 100% { transform: rotate(360deg); } }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .profile-container {
            padding: 1rem 0.5rem 3rem 0 !important;
          }
          
          .profile-header {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1.5rem !important;
          }
          
          .profile-avatar {
            width: 120px !important;
            height: 120px !important;
          }
          
          .tab-buttons {
            flex-wrap: wrap !important;
            gap: 0.5rem !important;
          }
          
          .tab-button {
            flex: 1 !important;
            min-width: 120px !important;
            font-size: 0.85rem !important;
            padding: 0.5rem 0.75rem !important;
          }
          
          .account-table td {
            padding: 0.75rem 0.5rem !important;
            font-size: 0.85rem !important;
          }
        }

        @media (max-width: 480px) {
          .profile-container {
            padding: 1rem 0 3rem 0 !important;
          }
          
          .profile-content {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
          
          .profile-avatar {
            width: 100px !important;
            height: 100px !important;
          }
          
          .profile-name {
            font-size: 1.25rem !important;
          }
          
          .profile-email {
            font-size: 0.85rem !important;
          }
          
          .tab-buttons {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          
          .tab-button {
            width: 100% !important;
          }
          
          .glass-panel {
            padding: 1.5rem 1rem !important;
          }
          
          .account-table {
            font-size: 0.8rem !important;
          }
          
          .account-table td {
            padding: 0.5rem 0.25rem !important;
          }
          
          .order-card {
            padding: 1rem !important;
          }
          
          .order-card-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }
          
          .view-order-link {
            width: 100% !important;
            justify-content: center !important;
            margin-top: 0.75rem !important;
          }
        }
      `}</style>
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

export default Profile;
