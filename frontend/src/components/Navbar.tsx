import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { User, Package, Shield, Menu, X } from 'lucide-react';

const AMAZON_ORANGE = '#FF9900';

/** Amazon-style cart icon with item count inside the basket */
const AmazonCartIcon: React.FC<{ count: number }> = ({ count }) => (
  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'flex-end', width: 38, height: 28 }}>
    <svg
      viewBox="0 0 38 28"
      width="38"
      height="28"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M0 2h3l4.2 14.4a2 2 0 0 0 2 1.6h12.2a2 2 0 0 0 1.95-1.55L28 8H9"
        fill="none"
        stroke="#3D2B1F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="24" r="2" fill="#3D2B1F" />
      <circle cx="24" cy="24" r="2" fill="#3D2B1F" />
    </svg>
    <span
      style={{
        position: 'absolute',
        top: 2,
        left: 14,
        minWidth: 16,
        fontSize: '0.95rem',
        fontWeight: 800,
        color: AMAZON_ORANGE,
        lineHeight: 1,
        textAlign: 'center',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {count > 99 ? '99+' : count}
    </span>
  </span>
);

export const Navbar: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { totalItemsCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link${isActive ? ' active' : ''}`;

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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

          {/* Desktop Navigation */}
          <nav className="navbar-links" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', justifyContent: 'center', flex: 1 }} aria-label="Primary navigation">
            <NavLink to="/" end className={navLinkClass} style={navLinkStyle}>Home</NavLink>
            <NavLink to="/shop" className={navLinkClass} style={navLinkStyle}>Shop</NavLink>
            <NavLink to="/about" className={navLinkClass} style={navLinkStyle}>About</NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={toggleMobileMenu}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} color="#3D2B1F" /> : <Menu size={24} color="#3D2B1F" />}
          </button>

          {/* Desktop Right Side */}
          <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-end' }}>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.9rem',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #3D2B1F 0%, #5a3d2b 100%)',
                      color: '#FFE4C4',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      letterSpacing: '0.03em',
                      textDecoration: 'none',
                      border: '1px solid rgba(61,43,31,0.35)',
                      boxShadow: '0 2px 8px rgba(61,43,31,0.18)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Shield size={14} />
                    Admin Panel
                  </Link>
                )}

                <Link
                  to="/cart"
                  aria-label={`Cart, ${totalItemsCount} items`}
                  style={amazonNavItemStyle}
                >
                  <AmazonCartIcon count={totalItemsCount} />
                  <span style={amazonNavLabelStyle}>Cart</span>
                </Link>

                <Link
                  to="/orders"
                  aria-label="Your orders"
                  style={amazonNavItemStyle}
                >
                  <Package size={22} strokeWidth={2} color="#3D2B1F" />
                  <span style={amazonNavLabelStyle}>Orders</span>
                </Link>

                <Link
                  to="/profile"
                  aria-label="Your account"
                  style={{ ...amazonNavItemStyle, paddingRight: '0.25rem' }}
                >
                  <User size={22} strokeWidth={2} color="#3D2B1F" />
                  <span style={amazonNavLabelStyle}>Account</span>
                </Link>
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

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} style={{
        display: 'none',
        position: 'fixed',
        top: '70px',
        left: 0,
        right: 0,
        background: '#ffffff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        zIndex: 999,
        padding: '1rem 0',
        borderBottom: '1px solid rgba(61,43,31,0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0 1.5rem' }}>
          <NavLink
            to="/"
            end
            className={navLinkClass}
            style={{ ...navLinkStyle, padding: '1rem 0', borderBottom: '1px solid rgba(61,43,31,0.08)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/shop"
            className={navLinkClass}
            style={{ ...navLinkStyle, padding: '1rem 0', borderBottom: '1px solid rgba(61,43,31,0.08)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Shop
          </NavLink>
          <NavLink
            to="/about"
            className={navLinkClass}
            style={{ ...navLinkStyle, padding: '1rem 0', borderBottom: '1px solid rgba(61,43,31,0.08)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </NavLink>

          {isAuthenticated && (
            <>
              <div style={{ padding: '1rem 0', borderBottom: '1px solid rgba(61,43,31,0.08)' }}>
                <Link
                  to="/cart"
                  style={{ ...navLinkStyle, padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <AmazonCartIcon count={totalItemsCount} />
                  Cart ({totalItemsCount})
                </Link>
              </div>
              <div style={{ padding: '1rem 0', borderBottom: '1px solid rgba(61,43,31,0.08)' }}>
                <Link
                  to="/orders"
                  style={{ ...navLinkStyle, padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package size={20} strokeWidth={2} color="#3D2B1F" />
                  Orders
                </Link>
              </div>
              <div style={{ padding: '1rem 0', borderBottom: '1px solid rgba(61,43,31,0.08)' }}>
                <Link
                  to="/profile"
                  style={{ ...navLinkStyle, padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={20} strokeWidth={2} color="#3D2B1F" />
                  Account
                </Link>
              </div>
              {user?.role === 'admin' && (
                <div style={{ padding: '1rem 0', borderBottom: '1px solid rgba(61,43,31,0.08)' }}>
                  <Link
                    to="/admin"
                    style={{ ...navLinkStyle, padding: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3D2B1F' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield size={20} strokeWidth={2} color="#3D2B1F" />
                    Admin Panel
                  </Link>
                </div>
              )}
            </>
          )}

          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: '0.5rem', padding: '1rem 0' }}>
              <Link
                to="/login"
                className="btn"
                style={{ padding: '0.5rem 1rem', background: 'transparent', color: '#3D2B1F', border: '1px solid rgba(61,43,31,0.15)', borderRadius: 10, fontWeight: 700, textDecoration: 'none', flex: 1, textAlign: 'center' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn"
                style={{ padding: '0.5rem 1rem', background: '#3D2B1F', color: '#FFE4C4', borderRadius: 10, fontWeight: 700, textDecoration: 'none', flex: 1, textAlign: 'center' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .navbar-links { display: none !important; }
          .navbar-right { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-menu { display: block !important; }
          .mobile-menu.open {
            display: block !important;
          }
          .mobile-menu:not(.open) {
            display: none !important;
          }
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

const amazonNavItemStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  textDecoration: 'none',
  padding: '0.25rem 0.5rem',
  borderRadius: '8px',
  transition: 'background-color 0.2s ease',
};

const amazonNavLabelStyle: React.CSSProperties = {
  fontFamily: 'Arial, Helvetica, sans-serif',
  fontSize: '0.95rem',
  fontWeight: 700,
  color: '#3D2B1F',
  lineHeight: 1,
};

export default Navbar;
