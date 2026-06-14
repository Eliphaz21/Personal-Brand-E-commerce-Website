import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Overview' },
    { path: '/admin/products', label: 'Products' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/inbox', label: 'Inbox' },
  ];

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', marginTop: '80px' }}>
      <aside className="admin-sidebar" style={{
        width: '260px',
        background: 'var(--color-glass)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid var(--color-border)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <h3 style={{ paddingLeft: '1rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Admin Console</h3>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${isActive ? 'active' : ''}`}
              style={{
                display: 'block',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: isActive ? 'var(--color-bg-main)' : 'var(--color-text)',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                textDecoration: 'none',
                fontWeight: isActive ? '600' : 'normal',
                transition: 'all 0.3s ease'
              }}
            >
              {item.label}
            </Link>
          );
        })}
        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>
            ← Back to Store
          </Link>
        </div>
      </aside>
      <main className="admin-content" style={{ flex: 1, padding: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
