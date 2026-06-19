import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  KeyRound, Lock, ArrowRight, Loader, AlertCircle, CheckCircle, RefreshCw, ArrowLeft
} from 'lucide-react';

type Step = 'otp' | 'password';

export const ChangePassword: React.FC = () => {
  const { user, requestChangePasswordOTP, changePassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('otp');
  const [otp, setOtp] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    sendOtp();
  }, []);

  const sendOtp = async () => {
    setError('');
    setSendingOtp(true);
    try {
      await requestChangePasswordOTP();
      setInfo(`Verification code sent to ${user?.email || 'your email'}.`);
      setCooldown(60);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to send verification code. Please try again.'
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setStep('password');
    setInfo('Code accepted. Enter your current and new password below.');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword, confirmPassword, otp);
      navigate('/login', {
        replace: true,
        state: { message: 'Password changed successfully. Please sign in with your new password.' },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update password. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainerStyle}>
      <div className="glass-panel animate-fade-in-up" style={cardStyle}>
        <Link to="/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={14} /> Back to Profile
        </Link>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <KeyRound size={28} color="var(--color-primary)" />
          </div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
            Change Password
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '360px', margin: '0 auto' }}>
            {step === 'otp'
              ? 'Verify your identity with the code we sent to your email.'
              : 'Choose a strong new password for your account.'}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
          <StepPill active={step === 'otp'} done={step === 'password'} label="1. Verify" />
          <StepPill active={step === 'password'} done={false} label="2. New Password" />
        </div>

        {error && (
          <div style={errorBoxStyle}>
            <AlertCircle size={18} color="var(--color-error)" />
            <span>{error}</span>
          </div>
        )}

        {info && (
          <div style={infoBoxStyle}>
            <CheckCircle size={18} color="var(--color-success)" />
            <span>{info}</span>
          </div>
        )}

        {step === 'otp' ? (
          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label className="form-label" htmlFor="change-otp">Verification Code</label>
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={cooldown > 0 || sendingOtp}
                  style={resendButtonStyle}
                >
                  {sendingOtp ? (
                    <Loader size={12} className="spin-animation" />
                  ) : cooldown > 0 ? (
                    `Resend in ${cooldown}s`
                  ) : (
                    <>
                      <RefreshCw size={12} /> Resend code
                    </>
                  )}
                </button>
              </div>
              <input
                id="change-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="0 0 0 0 0 0"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="form-input"
                style={{ textAlign: 'center', letterSpacing: '0.75rem', fontSize: '1.5rem', fontWeight: 700, padding: '0.75rem' }}
              />
            </div>

            <button type="submit" disabled={otp.length !== 6} className="btn btn-primary" style={submitBtnStyle}>
              Continue <ArrowRight size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="current-password">Current Password</label>
              <div style={{ position: 'relative' }}>
                <span style={inputIconStyle}><Lock size={18} /></span>
                <input
                  id="current-password"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="new-password">New Password</label>
              <div style={{ position: 'relative' }}>
                <span style={inputIconStyle}><Lock size={18} /></span>
                <input
                  id="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
                Min 8 characters, uppercase, lowercase, and a number.
              </p>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <span style={inputIconStyle}><Lock size={18} /></span>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setStep('otp')} className="btn btn-outline" style={{ flex: 1, minWidth: '120px' }}>
                Back
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ ...submitBtnStyle, flex: 2, minWidth: '160px' }}>
                {loading ? (
                  <>
                    <Loader size={18} className="spin-animation" /> Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .spin-animation { animation: rotate 1.5s linear infinite; }
        @keyframes rotate { 100% { transform: rotate(360deg); } }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .change-password-container {
            padding: 1rem 0.5rem 3rem 0 !important;
          }
        }

        @media (max-width: 480px) {
          .change-password-container {
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

const StepPill: React.FC<{ active: boolean; done: boolean; label: string }> = ({ active, done, label }) => (
  <span style={{
    padding: '0.35rem 0.85rem',
    borderRadius: '999px',
    fontSize: '0.75rem',
    fontWeight: 700,
    backgroundColor: active ? 'var(--color-primary)' : done ? 'rgba(39,174,96,0.12)' : 'var(--color-bg-main)',
    color: active ? '#fff' : done ? 'var(--color-success)' : 'var(--color-text-muted)',
    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
  }}>
    {label}
  </span>
);

const pageContainerStyle: React.CSSProperties = {
  minHeight: 'calc(100vh - 80px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
  background: 'linear-gradient(180deg, rgba(247, 246, 242, 0.2) 0%, rgba(227, 236, 227, 0.4) 100%)',
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '480px',
  padding: '2.5rem 2rem',
  background: '#fff',
  borderRadius: '24px',
  boxShadow: 'var(--shadow-lg)',
};

const errorBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  borderRadius: '12px',
  backgroundColor: 'rgba(235, 87, 87, 0.08)',
  border: '1px solid rgba(235, 87, 87, 0.2)',
  color: 'var(--color-error)',
  fontSize: '0.85rem',
  fontWeight: 500,
  marginBottom: '1rem',
};

const infoBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  borderRadius: '12px',
  backgroundColor: 'rgba(39, 174, 96, 0.08)',
  border: '1px solid rgba(39, 174, 96, 0.2)',
  color: 'var(--color-success)',
  fontSize: '0.85rem',
  fontWeight: 500,
  marginBottom: '1rem',
};

const inputIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--color-text-muted)',
  opacity: 0.7,
  display: 'flex',
  alignItems: 'center',
};

const submitBtnStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem',
  marginTop: '0.5rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '0.5rem',
};

const resendButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '0.8rem',
  color: 'var(--color-secondary)',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.25rem',
  padding: 0,
};

export default ChangePassword;
