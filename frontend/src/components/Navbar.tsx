import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { ShoppingBag, User, LogOut, Shield, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      zIndex: 1000,
      background: 'rgba(247, 246, 242, 0.75)',
      backdropFilter: 'blur(12px) saturate(180%)',
      borderBottom: '1px solid rgba(120, 150, 120, 0.15)',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'var(--color-primary-dark)',
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          KidEnDu
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none' }} className="desktop-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={navLinkStyle}>
            Home
          </NavLink>
          <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={navLinkStyle}>
            Shop
          </NavLink>
        </nav>

        {/* Actions bar (Cart, User/Profile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Cart Icon */}
          <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--color-primary-dark)' }}>
            <ShoppingBag size={24} />
            {isAuthenticated && totalItemsCount > 0 && (
              <span className="cart-badge animate-scale-up" style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: 'var(--color-secondary)',
                color: '#fff',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                {totalItemsCount}
              </span>
            )}
          </Link>

          {/* User Menu / Auth Actions */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)} 
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem',
                  color: 'var(--color-primary-dark)'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  border: '2px solid var(--color-primary)'
                }}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user?.name.charAt(0).toUpperCase()
                  )}
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="glass-panel" style={{
                  position: 'absolute',
                  right: 0,
                  top: '48px',
                  width: '220px',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  zIndex: 1001,
                  background: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '0.5rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-primary-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </p>
                  </div>
                  <Link to="/profile" onClick={() => setDropdownOpen(false)} style={dropdownItemStyle}>
                    <User size={16} /> Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)} style={{ ...dropdownItemStyle, color: 'var(--color-secondary)' }}>
                      <Shield size={16} /> Admin Panel
                    </Link>
                  )}
                  <button onClick={handleLogout} style={{ ...dropdownItemStyle, width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'none' }} className="desktop-auth">
              <Link to="/login" className="btn btn-outline" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                Login
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          background: 'rgba(247, 246, 242, 0.95)',
          backdropFilter: 'blur(15px)',
          borderBottom: '1px solid rgba(120, 150, 120, 0.15)',
          padding: '2rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          zIndex: 999
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Home</Link>
          <Link to="/shop" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Shop</Link>
          {!isAuthenticated ? (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>Login</Link>
          ) : (
            <>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={mobileNavLinkStyle}>Profile</Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} style={{ ...mobileNavLinkStyle, color: 'var(--color-secondary)' }}>Admin Panel</Link>
              )}
              <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="btn btn-outline" style={{ width: '100%', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>
      )}

      {/* Inline styles for responsive layout toggles and custom components */}
      <style>{`
        .desktop-nav {
          display: flex !important;
          gap: 2rem;
        }
        .desktop-auth {
          display: block !important;
        }
        .mobile-menu-btn {
          display: none !important;
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-auth {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};

const navLinkStyle = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 500,
  color: 'var(--color-primary-dark)',
  padding: '0.5rem 0',
  position: 'relative' as const,
  transition: 'color var(--transition-fast)'
};

const mobileNavLinkStyle = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 600,
  fontSize: '1.25rem',
  color: 'var(--color-primary-dark)',
  padding: '0.5rem 0',
  borderBottom: '1px solid rgba(0,0,0,0.05)'
};

const dropdownItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.625rem 0.75rem',
  fontSize: '0.9rem',
  borderRadius: '6px',
  color: 'var(--color-text-main)',
  transition: 'background var(--transition-fast)',
  hover: {
    backgroundColor: 'var(--color-primary-light)'
  }
};

export default Navbar;
