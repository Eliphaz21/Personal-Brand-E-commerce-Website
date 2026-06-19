import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/apiClient';
import type { User } from '../../types';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  User as UserIcon,
  Shield,
  Ban,
  Filter,
  Mail,
  Calendar,
} from 'lucide-react';

type UserRole = User['role'];

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  bio: string;
  isVerified: boolean;
  isBlocked: boolean;
}

const initialFormState: UserForm = {
  name: '',
  email: '',
  password: '',
  role: 'customer',
  bio: '',
  isVerified: false,
  isBlocked: false,
};

const getAvatarUrl = (avatar: User['avatar']): string => {
  if (!avatar) return '';
  if (typeof avatar === 'string') return avatar;
  return avatar.url || '';
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getRoleBadgeStyles = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return { bg: 'rgba(212, 163, 115, 0.2)', text: 'var(--color-secondary)' };
    case 'customer':
      return { bg: 'rgba(54, 162, 235, 0.1)', text: '#36a2eb' };
    default:
      return { bg: 'rgba(120, 120, 120, 0.1)', text: 'var(--color-text-muted)' };
  }
};

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [blockedFilter, setBlockedFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(initialFormState);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (blockedFilter) params.isBlocked = blockedFilter;
      if (verifiedFilter) params.isVerified = verifiedFilter;

      const res = await apiClient.get('/users', { params });
      const data = res.data?.users || [];
      setUsers(data);
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      setUsers([]);
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(
        axiosErr.response?.data?.message ||
        'Could not retrieve users. Please reload the page.'
      );
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, blockedFilter, verifiedFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setBlockedFilter('');
    setVerifiedFilter('');
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(initialFormState);
    setModalError('');
    setIsFormModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      bio: user.bio || '',
      isVerified: user.isVerified,
      isBlocked: user.isBlocked ?? false,
    });
    setModalError('');
    setIsFormModalOpen(true);
  };

  const openViewModal = async (user: User) => {
    const userId = user._id || user.id;
    try {
      const res = await apiClient.get(`/users/${userId}`);
      setViewingUser(res.data?.user || user);
      setIsViewModalOpen(true);
    } catch {
      setViewingUser(user);
      setIsViewModalOpen(true);
    }
  };

  const handleDeleteUser = async (user: User) => {
    const userId = user._id || user.id;
    if (
      !window.confirm(
        `Permanently delete "${user.name}" (${user.email})? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setError('');
      await apiClient.delete(`/users/${userId}`);
      setSuccessMsg('User deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to delete user.');
    }
  };

  const handleToggleBlock = async (user: User) => {
    const userId = user._id || user.id;
    const newBlocked = !(user.isBlocked ?? false);

    try {
      setError('');
      await apiClient.patch(`/users/${userId}/block`, { isBlocked: newBlocked });
      setSuccessMsg(
        newBlocked ? 'User blocked successfully.' : 'User unblocked successfully.'
      );
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to update block status.');
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    if (!form.name.trim()) {
      setModalError('Name is required.');
      setSubmitting(false);
      return;
    }
    if (!form.email.trim()) {
      setModalError('Email is required.');
      setSubmitting(false);
      return;
    }
    if (!editingUser && !form.password) {
      setModalError('Password is required for new users.');
      setSubmitting(false);
      return;
    }
    if (form.password && form.password.length < 8) {
      setModalError('Password must be at least 8 characters.');
      setSubmitting(false);
      return;
    }

    try {
      if (editingUser) {
        const userId = editingUser._id || editingUser.id;
        const payload: Record<string, unknown> = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          bio: form.bio.trim(),
          isVerified: form.isVerified,
          isBlocked: form.isBlocked,
        };
        if (form.password) payload.password = form.password;

        await apiClient.patch(`/users/${userId}`, payload);
        setSuccessMsg('User updated successfully.');
      } else {
        await apiClient.post('/users', {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          bio: form.bio.trim(),
          isVerified: form.isVerified,
          isBlocked: form.isBlocked,
        });
        setSuccessMsg('User created successfully.');
      }

      setIsFormModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchUsers();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; errors?: { message: string }[] } };
      };
      const validationMsg = axiosErr.response?.data?.errors
        ?.map((e) => e.message)
        .join(', ');
      setModalError(
        validationMsg ||
        axiosErr.response?.data?.message ||
        'Failed to save user. Please check the form.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-users" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
            User Management
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            View, create, edit, and manage all registered accounts.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '999px',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <Plus size={18} /> Add User
        </button>
      </div>

      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(39, 174, 96, 0.1)',
            border: '1px solid rgba(39, 174, 96, 0.3)',
            borderRadius: '8px',
            color: 'var(--color-success)',
          }}
        >
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: 'rgba(235, 87, 87, 0.1)',
            border: '1px solid rgba(235, 87, 87, 0.3)',
            borderRadius: '8px',
            color: 'var(--color-error)',
          }}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          padding: '1rem',
          background: 'var(--color-glass)',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
        }}
      >
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.5rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,0.8)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              background: 'rgba(255,255,255,0.8)',
            }}
          >
            <option value="">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value)}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: 'rgba(255,255,255,0.8)',
          }}
        >
          <option value="">All Verification</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>

        <select
          value={blockedFilter}
          onChange={(e) => setBlockedFilter(e.target.value)}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: 'rgba(255,255,255,0.8)',
          }}
        >
          <option value="">All Status</option>
          <option value="false">Active</option>
          <option value="true">Blocked</option>
        </select>

        <button
          onClick={handleResetFilters}
          className="btn btn-outline"
          style={{ padding: '0.65rem 1rem', fontSize: '0.85rem' }}
        >
          Reset
        </button>
      </div>

      <div
        style={{
          background: 'var(--color-glass)',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Loader size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <UserIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
            <p>No users found matching your filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.03)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Verified</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Joined</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const userId = user._id || user.id;
                  const avatarUrl = getAvatarUrl(user.avatar);
                  const roleStyles = getRoleBadgeStyles(user.role);
                  const isAdmin = user.role === 'admin';

                  return (
                    <tr
                      key={userId}
                      style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={user.name}
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid var(--color-border)',
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: 'rgba(212, 163, 115, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--color-secondary)',
                              }}
                            >
                              <UserIcon size={20} />
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{user.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: roleStyles.bg,
                            color: roleStyles.text,
                          }}
                        >
                          {user.role === 'admin' && <Shield size={12} />}
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {user.isVerified ? (
                          <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>Yes</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>No</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {user.isBlocked ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '999px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              background: 'rgba(235, 87, 87, 0.1)',
                              color: 'var(--color-error)',
                            }}
                          >
                            <Ban size={12} /> Blocked
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '999px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              background: 'rgba(39, 174, 96, 0.1)',
                              color: 'var(--color-success)',
                            }}
                          >
                            Active
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            onClick={() => openViewModal(user)}
                            title="View details"
                            style={{
                              padding: '0.5rem',
                              borderRadius: '8px',
                              border: '1px solid var(--color-border)',
                              background: 'white',
                              cursor: 'pointer',
                              color: 'var(--color-primary)',
                            }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            title="Edit user"
                            style={{
                              padding: '0.5rem',
                              borderRadius: '8px',
                              border: '1px solid var(--color-border)',
                              background: 'white',
                              cursor: 'pointer',
                              color: 'var(--color-secondary)',
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          {!isAdmin && (
                            <button
                              onClick={() => handleToggleBlock(user)}
                              title={user.isBlocked ? 'Unblock user' : 'Block user'}
                              style={{
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border)',
                                background: 'white',
                                cursor: 'pointer',
                                color: user.isBlocked ? 'var(--color-success)' : 'var(--color-error)',
                              }}
                            >
                              <Ban size={16} />
                            </button>
                          )}
                          {!isAdmin && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              title="Delete user"
                              style={{
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--color-border)',
                                background: 'white',
                                cursor: 'pointer',
                                color: 'var(--color-error)',
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--color-border)',
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
            }}
          >
            Showing {users.length} user{users.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isFormModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => !submitting && setIsFormModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                {editingUser ? 'Edit User' : 'Create New User'}
              </h2>
              <button
                onClick={() => setIsFormModalOpen(false)}
                disabled={submitting}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ padding: '1.5rem' }}>
              {modalError && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    background: 'rgba(235, 87, 87, 0.1)',
                    borderRadius: '8px',
                    color: 'var(--color-error)',
                    fontSize: '0.9rem',
                  }}
                >
                  <AlertCircle size={16} />
                  {modalError}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleFormChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    Password {editingUser && '(leave blank to keep current)'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleFormChange}
                    required={!editingUser}
                    minLength={8}
                    placeholder={editingUser ? 'Optional' : 'Min. 8 characters'}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    Role
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleFormChange}
                    disabled={editingUser?.role === 'admin'}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleFormChange}
                    rows={3}
                    maxLength={500}
                    style={{
                      width: '100%',
                      padding: '0.65rem',
                      borderRadius: '8px',
                      border: '1px solid var(--color-border)',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="isVerified"
                      checked={form.isVerified}
                      onChange={handleFormChange}
                    />
                    <span style={{ fontSize: '0.9rem' }}>Verified account</span>
                  </label>

                  {editingUser?.role !== 'admin' && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="isBlocked"
                        checked={form.isBlocked}
                        onChange={handleFormChange}
                      />
                      <span style={{ fontSize: '0.9rem' }}>Blocked</span>
                    </label>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={submitting}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  {submitting ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && viewingUser && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setIsViewModalOpen(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem',
                borderBottom: '1px solid var(--color-border)',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>User Details</h2>
              <button
                onClick={() => setIsViewModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                {getAvatarUrl(viewingUser.avatar) ? (
                  <img
                    src={getAvatarUrl(viewingUser.avatar)}
                    alt={viewingUser.name}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--color-border)',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      background: 'rgba(212, 163, 115, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-secondary)',
                    }}
                  >
                    <UserIcon size={36} />
                  </div>
                )}
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 700 }}>{viewingUser.name}</h3>
                  <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} /> {viewingUser.email}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <DetailRow label="User ID" value={viewingUser._id || viewingUser.id} />
                <DetailRow label="Role" value={viewingUser.role} />
                <DetailRow label="Verified" value={viewingUser.isVerified ? 'Yes' : 'No'} />
                <DetailRow label="Status" value={viewingUser.isBlocked ? 'Blocked' : 'Active'} />
                <DetailRow label="Bio" value={viewingUser.bio || '—'} />
                <DetailRow label="Joined" value={formatDate(viewingUser.createdAt)} icon={<Calendar size={14} />} />
                <DetailRow label="Last Updated" value={formatDate(viewingUser.updatedAt)} icon={<Calendar size={14} />} />
              </div>

              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  openEditModal(viewingUser);
                }}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Edit size={16} /> Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .users-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 1rem !important;
          }
          
          .search-bar {
            width: 100% !important;
          }
          
          .users-table {
            font-size: 0.85rem !important;
          }
          
          .users-table th,
          .users-table td {
            padding: 0.75rem 0.5rem !important;
          }
          
          .user-details {
            padding: 1.5rem !important;
          }
          
          .user-info-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }

        @media (max-width: 480px) {
          .users-table-container {
            overflow-x: auto !important;
          }
          
          .users-table {
            min-width: 600px !important;
          }
          
          .role-badge {
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
          
          .detail-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.25rem !important;
          }
        }
      `}</style>
    </div>
  );
};

const DetailRow: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      padding: '0.65rem 0',
      borderBottom: '1px solid var(--color-border)',
      gap: '1rem',
    }}
  >
    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{label}</span>
    <span style={{ fontSize: '0.9rem', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
      {icon}
      {value}
    </span>
  </div>
);

export default AdminUsers;
