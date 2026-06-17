import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Overview' },
    { path: '/admin/products', label: 'Products' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/inbox', label: 'Inbox' },
  ];

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', marginTop: '80px' }}>
      <aside className="admin-sidebar" style={{
        width: '260px',
        background: 'var(--color-glass)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid var(--color-border)',
        padding: '1.25rem 1rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 0.85rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: 'rgba(255, 255, 255, 0.85)',
            color: 'var(--color-primary-dark)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-primary)';
            e.currentTarget.style.color = 'var(--color-bg-main)';
            e.currentTarget.style.borderColor = 'var(--color-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)';
            e.currentTarget.style.color = 'var(--color-primary-dark)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          <ArrowLeft size={16} />
          Back to Store
        </Link>

        <h3 style={{ paddingLeft: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Admin Console</h3>
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
      </aside>
      <main className="admin-content" style={{ flex: 1, padding: '2rem', backgroundColor: 'rgba(255, 255, 255, 0.4)' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
