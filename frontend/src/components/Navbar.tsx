import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { ShoppingBag, Package, User, LogOut, LayoutDashboard } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemsCount } = useCart();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? ' active' : ''}`;

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: '#FFFFFF',
      padding: '12px 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          maxWidth: 1150,
          background: '#ffffff',
          borderRadius: 28,
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(61,43,31,0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 120 }}>
            <Link to="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#3D2B1F', letterSpacing: '0.04em', textDecoration: 'none' }}>
              Kiduendu
            </Link>
          </div>

          <nav className="navbar-links" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', justifyContent: 'center', flex: 1 }} aria-label="Primary navigation">
            <NavLink to="/" end className={navLinkClass} style={navLinkStyle}>Home</NavLink>
            <NavLink to="/shop" className={navLinkClass} style={navLinkStyle}>Shop</NavLink>
            <NavLink to="/about" className={navLinkClass} style={navLinkStyle}>About</NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/cart" className={navLinkClass} style={{ ...navLinkStyle, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShoppingBag size={15} />
                  Cart
                  {totalItemsCount > 0 && (
                    <span style={{
                      minWidth: '18px',
                      height: '18px',
                      padding: '0 5px',
                      borderRadius: '999px',
                      backgroundColor: 'var(--color-secondary)',
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1
                    }}>
                      {totalItemsCount > 99 ? '99+' : totalItemsCount}
                    </span>
                  )}
                </NavLink>
                <NavLink to="/orders" className={navLinkClass} style={{ ...navLinkStyle, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Package size={15} />
                  Orders
                </NavLink>
              </>
            )}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 120, justifyContent: 'flex-end' }}>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    title="Admin Dashboard"
                    style={{ ...iconButtonStyle, color: '#3D2B1F' }}
                  >
                    <LayoutDashboard size={18} />
                  </Link>
                )}
                <Link to="/profile" title="My Account" style={{ ...iconButtonStyle, color: '#3D2B1F' }}>
                  <User size={18} />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  style={{ ...iconButtonStyle, background: 'none', border: 'none', cursor: 'pointer', color: '#3D2B1F' }}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn" style={{ padding: '0.35rem 0.7rem', background: 'transparent', color: '#3D2B1F', border: '1px solid rgba(61,43,31,0.15)', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>Login</Link>
                <Link to="/register" className="btn" style={{ padding: '0.35rem 0.7rem', background: '#3D2B1F', color: '#FFE4C4', borderRadius: 10, fontWeight: 700, textDecoration: 'none' }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .navbar-links { display: none !important; }
        }
      `}</style>
    </header>
  );
};

const navLinkStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 500,
  color: '#3D2B1F',
  padding: '0.5rem 0',
  position: 'relative',
  transition: 'color var(--transition-fast)',
  textDecoration: 'none',
  fontSize: '0.95rem'
};

const iconButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.35rem',
  borderRadius: '8px',
  textDecoration: 'none'
};

export default Navbar;
