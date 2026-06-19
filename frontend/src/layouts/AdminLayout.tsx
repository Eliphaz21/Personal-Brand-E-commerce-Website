import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { ArrowLeft, Menu, X } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { path: '/admin', label: 'Overview' },
    { path: '/admin/products', label: 'Products' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/inbox', label: 'Inbox' },
  ];

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', marginTop: '80px' }}>
      {/* Mobile Menu Button */}
      <button
        className="admin-mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '90px',
          left: '1rem',
          zIndex: 1001,
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
        aria-label="Toggle admin menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`} style={{
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
          onClick={() => setSidebarOpen(false)}
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
              onClick={() => setSidebarOpen(false)}
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

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .admin-mobile-menu-btn {
            display: flex !important;
          }
          
          .admin-sidebar {
            position: fixed !important;
            top: '80px' !important;
            left: 0 !important;
            bottom: 0 !important;
            z-index: 1000 !important;
            transform: translateX(-100%) !important;
            transition: transform 0.3s ease !important;
          }
          
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          
          .admin-content {
            padding: 1.5rem 1rem !important;
          }
        }

        @media (max-width: 480px) {
          .admin-content {
            padding: 1rem 0.5rem !important;
          }
          
          .admin-sidebar {
            width: 280px !important;
            padding: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
