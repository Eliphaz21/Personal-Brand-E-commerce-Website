import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Lock, AlertCircle, ArrowRight, Loader } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, confirmPassword);
      // Redirect to OTP verification page passing the email along
      navigate('/verify-otp', { state: { email } });
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to register. This email may already be in use.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container" style={pageContainerStyle}>
      <div className="glass-panel animate-fade-in-up" style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>Join KidEnDu to begin your hormone tracking program</p>
        </div>

        {error && (
          <div style={errorContainerStyle}>
            <AlertCircle size={18} color="var(--color-error)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-error)' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <span style={inputIconStyle}><User size={18} /></span>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={inputIconStyle}><Mail size={18} /></span>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <span style={inputIconStyle}><Lock size={18} /></span>
              <input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <span style={inputIconStyle}><Lock size={18} /></span>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading ? (
              <>
                <Loader size={18} className="spin-animation" /> Registering...
              </>
            ) : (
              <>
                Sign Up <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'underline' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .spin-animation {
          animation: rotate 1.5s linear infinite;
        }
        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .register-container {
            padding: 1rem 0.5rem !important;
          }
        }

        @media (max-width: 480px) {
          .register-container {
            padding: 1rem 0 !important;
            min-height: calc(100vh - 60px) !important;
          }
          
          .glass-panel {
            padding: 2rem 1.5rem !important;
            border-radius: 16px !important;
          }
          
          h1 {
            font-size: 1.5rem !important;
          }
          
          .form-input {
            padding: 0.75rem 1rem !important;
            font-size: 0.9rem !important;
          }
          
          .btn {
            padding: 0.75rem 1rem !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </div>
  );
};

/* CSS Style variables */
const pageContainerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 80px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
  background: 'linear-gradient(180deg, rgba(247, 246, 242, 0.2) 0%, rgba(227, 236, 227, 0.4) 100%)'
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '440px',
  padding: '3rem 2.5rem',
  background: '#fff',
  borderRadius: '24px',
  boxShadow: 'var(--shadow-lg)'
};

const inputIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--color-text-muted)',
  opacity: 0.7,
  display: 'flex',
  alignItems: 'center'
};

const errorContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  borderRadius: '12px',
  backgroundColor: 'rgba(235, 87, 87, 0.08)',
  border: '1px solid rgba(235, 87, 87, 0.2)',
  marginBottom: '1.5rem'
};

export default Register;
