import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { ShoppingBag, User, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { totalItemsCount } = useCart();

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: '#FFE4C4',
      padding: '12px 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
        {/* Pill-shaped nav bar centered, with rounded corners like the image */}
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
          {/* Left area: company name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 180 }}>
            <Link to="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#3D2B1F', letterSpacing: '0.04em' }}>
              Kiduendu
            </Link>
          </div>

          {/* Center nav links */}
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center', flex: 1 }} aria-label="Primary navigation">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} style={{ ...navLinkStyle, fontSize: '0.95rem', color: '#3D2B1F' }}>Home</NavLink>
            <NavLink to="/about" style={{ ...navLinkStyle, fontSize: '0.95rem', color: '#3D2B1F' }}>About Company</NavLink>
            <NavLink to="/portfolio" style={{ ...navLinkStyle, fontSize: '0.95rem', color: '#3D2B1F' }}>Client Profile</NavLink>
          </nav>

          {/* Right area: search, cart, auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 160, justifyContent: 'flex-end' }}>
            <Link to="/search" aria-label="Search" style={{ color: '#3D2B1F', display: 'flex', alignItems: 'center' }}>
              <Search size={18} />
            </Link>

            <Link to="/cart" aria-label="Cart" style={{ color: '#3D2B1F', display: 'flex', alignItems: 'center' }}>
              <ShoppingBag size={18} />
              {isAuthenticated && totalItemsCount > 0 && (
                <span className="cart-badge" style={{ marginLeft: 6, background: '#FFE4C4', color: '#3D2B1F', padding: '2px 7px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 700 }}>
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', color: '#FFE4C4' }}>
                <User size={18} />
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn" style={{ padding: '0.35rem 0.7rem', background: 'transparent', color: '#3D2B1F', border: '1px solid rgba(61,43,31,0.15)', borderRadius: 10, fontWeight: 700 }}>Login</Link>
                <Link to="/register" className="btn" style={{ padding: '0.35rem 0.7rem', background: '#3D2B1F', color: '#FFE4C4', borderRadius: 10, fontWeight: 700 }}>Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .container { padding: 0 1rem; }
          nav { display: none; }
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

// (Unused helper styles removed to avoid TypeScript unused-variable warnings)

export default Navbar;
