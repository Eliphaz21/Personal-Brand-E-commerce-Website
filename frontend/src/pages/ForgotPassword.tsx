import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, ArrowRight, Loader, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import apiClient from '../services/apiClient';

type Step = 'email' | 'otp' | 'new-password' | 'success';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Password strength validation
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });

      if (response.data.success) {
        setSuccess(response.data.message);
        setStep('otp');
        startCountdown();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to send reset code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
        setError('Please enter a valid 6-digit code');
        setLoading(false);
        return;
      }

      // Move to password reset step (OTP will be validated in final step)
      setStep('new-password');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Invalid verification code. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/auth/reset-password', {
        email,
        otp,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setStep('success');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });

      if (response.data.success) {
        setSuccess('A new code has been sent to your email');
        setOtp('');
        startCountdown();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to resend code. Please try again.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  // Countdown timer for resend
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Navigate to login
  const goToLogin = () => {
    navigate('/login', { state: { message: 'Password reset successful. Please log in with your new password.' } });
  };

  return (
    <div className="forgot-password-container" style={pageContainerStyle}>
      <div className="glass-panel animate-fade-in-up" style={cardStyle}>
        {/* Back Button */}
        {step !== 'success' && (
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-text-muted)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {step === 'success' ? (
            <>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <CheckCircle size={32} color="var(--color-success)" />
              </div>
              <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                Password Reset Successful
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Your password has been successfully reset
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '1.75rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                {step === 'email' && 'Forgot Password?'}
                {step === 'otp' && 'Verify Your Identity'}
                {step === 'new-password' && 'Create New Password'}
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                {step === 'email' && 'Enter your email to receive a password reset code'}
                {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
                {step === 'new-password' && 'Create a strong, secure password'}
              </p>
            </>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div style={errorContainerStyle}>
            <AlertCircle size={18} color="var(--color-error)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-error)' }}>{error}</span>
          </div>
        )}

        {success && (
          <div style={successContainerStyle}>
            <CheckCircle size={18} color="var(--color-success)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-success)' }}>{success}</span>
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 'email' && (
          <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                  onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <>
                  <Loader size={18} className="spin-animation" /> Sending Code...
                </>
              ) : (
                <>
                  Send Reset Code <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: OTP Input */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="otp">Verification Code</label>
              <input
                id="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="form-input"
                style={{
                  fontSize: '1.5rem',
                  letterSpacing: '0.5rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              />
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Enter the 6-digit code from your email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <>
                  <Loader size={18} className="spin-animation" /> Verifying...
                </>
              ) : (
                <>
                  Verify Code <ArrowRight size={18} />
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resendLoading || countdown > 0}
                style={{
                  background: 'none',
                  border: 'none',
                  color: countdown > 0 ? 'var(--color-text-muted)' : 'var(--color-secondary)',
                  fontSize: '0.85rem',
                  cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : "Didn't receive code? Resend"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 'new-password' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="newPassword">New Password</label>
              <div style={{ position: 'relative' }}>
                <span style={inputIconStyle}><Lock size={18} /></span>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
              {/* Password Requirements */}
              <div style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={14} /> Password Requirements:
                </p>
                <ul style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, paddingLeft: '1.25rem', lineHeight: '1.6' }}>
                  <li style={{ color: newPassword.length >= 8 ? 'var(--color-success)' : 'inherit' }}>
                    At least 8 characters
                  </li>
                  <li style={{ color: /[A-Z]/.test(newPassword) ? 'var(--color-success)' : 'inherit' }}>
                    At least one uppercase letter
                  </li>
                  <li style={{ color: /[a-z]/.test(newPassword) ? 'var(--color-success)' : 'inherit' }}>
                    At least one lowercase letter
                  </li>
                  <li style={{ color: /[0-9]/.test(newPassword) ? 'var(--color-success)' : 'inherit' }}>
                    At least one number
                  </li>
                </ul>
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <span style={inputIconStyle}><Lock size={18} /></span>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.25rem' }}>
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.875rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              {loading ? (
                <>
                  <Loader size={18} className="spin-animation" /> Resetting Password...
                </>
              ) : (
                <>
                  Reset Password <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={goToLogin}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.875rem',
                display: 'flex',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '1.5rem'
              }}
            >
              Continue to Login <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Security Notice */}
        {step !== 'success' && (
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'rgba(52, 152, 219, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(52, 152, 219, 0.1)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Shield size={12} />
              Secure password reset with email verification
            </p>
          </div>
        )}
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
          .forgot-password-container {
            padding: 1rem 0.5rem !important;
          }
        }

        @media (max-width: 480px) {
          .forgot-password-container {
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
          
          #otp {
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

const successContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  borderRadius: '12px',
  backgroundColor: 'rgba(39, 174, 96, 0.08)',
  border: '1px solid rgba(39, 174, 96, 0.2)',
  marginBottom: '1.5rem'
};

export default ForgotPassword;
