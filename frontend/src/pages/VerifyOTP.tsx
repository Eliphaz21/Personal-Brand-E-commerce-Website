import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RefreshCw, KeyRound, Loader, AlertCircle } from 'lucide-react';

export const VerifyOTP: React.FC = () => {
  const { verifyOTP, resendOTP } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = (location.state as any)?.email || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Timer state for resend code cooldown
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otp);
      setInfo('Account verified successfully! Logging you in...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error('OTP Verification error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Incorrect or expired OTP code. Please check your email.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;

    setError('');
    setInfo('');
    setResending(true);

    try {
      await resendOTP(email);
      setInfo('A new verification code has been sent to your email.');
      setCooldown(60); // reset timer
    } catch (err: any) {
      console.error('OTP Resend error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to resend code. Please try again.'
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="otp-container" style={pageContainerStyle}>
      <div className="glass-panel animate-fade-in-up" style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <KeyRound size={28} color="var(--color-primary)" />
          </div>
          <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>Enter Verification Code</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '300px', margin: '0 auto' }}>
            We've sent a 6-digit confirmation code to your inbox.
          </p>
        </div>

        {error && (
          <div style={errorContainerStyle}>
            <AlertCircle size={18} color="var(--color-error)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-error)' }}>{error}</span>
          </div>
        )}

        {info && (
          <div style={infoContainerStyle}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-success)' }}>{info}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {!initialEmail && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="otp-email">Verify Email Address</label>
              <input
                id="otp-email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
              <label className="form-label" htmlFor="otp-code">Verification Code</label>
              {email && (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.8rem',
                    color: cooldown > 0 ? 'var(--color-text-muted)' : 'var(--color-secondary)',
                    fontWeight: 600,
                    cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: 0
                  }}
                >
                  {resending ? (
                    <Loader size={12} className="spin-animation" />
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    <>
                      <RefreshCw size={12} /> Resend code
                    </>
                  )}
                </button>
              )}
            </div>
            <input
              id="otp-code"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="0 0 0 0 0 0"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              style={{
                textAlign: 'center',
                letterSpacing: '0.75rem',
                fontSize: '1.75rem',
                fontWeight: 'bold',
                padding: '0.75rem'
              }}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading ? (
              <>
                <Loader size={18} className="spin-animation" /> Verifying...
              </>
            ) : (
              <>
                Verify Code
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            Need help?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}>
              Back to Sign In
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
          .verify-otp-container {
            padding: 1rem 0.5rem 3rem 0 !important;
          }
        }

        @media (max-width: 480px) {
          .verify-otp-container {
            padding: 1rem 0 3rem 0 !important;
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
          
          .otp-input {
            font-size: 1.25rem !important;
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

const infoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '1rem',
  borderRadius: '12px',
  backgroundColor: 'rgba(39, 174, 96, 0.08)',
  border: '1px solid rgba(39, 174, 96, 0.2)',
  marginBottom: '1.5rem'
};

export default VerifyOTP;
