import React, { useState } from 'react';
import apiClient from '../services/apiClient';
import { Sparkles, Send, CheckCircle, AlertCircle, Loader, Mail } from 'lucide-react';

type Step = 'subscribe' | 'subscribed' | 'message-sent';

export const NewsletterSubscribe: React.FC = () => {
  const [step, setStep] = useState<Step>('subscribe');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await apiClient.post('/newsletter/subscribe', {
        email: email.trim(),
        name: name.trim() || undefined,
      });

      setStep('subscribed');
      setInfo(res.data?.message || 'Subscribed successfully!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Could not subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const res = await apiClient.post('/newsletter/message', {
        email: email.trim(),
        guestName: name.trim() || undefined,
        subject: subject.trim(),
        body: message.trim(),
      });

      setStep('message-sent');
      setInfo(res.data?.message || 'Message sent successfully!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Could not send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={ctaSectionStyle}>
      <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '680px' }}>
        <Sparkles
          size={32}
          color="var(--color-secondary)"
          style={{ marginBottom: '1.5rem', animation: 'float 3s ease-in-out infinite' }}
        />
        <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>
          Get Your Custom Hormone Blueprint
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
          Subscribe to Coach Kidist&apos;s weekly wellness digests containing egg quality diets, fertility
          recipes, and discount codes. After subscribing, you can send a message directly to Coach Kidist.
        </p>

        {info && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              borderRadius: '10px',
              background: 'rgba(39, 174, 96, 0.1)',
              border: '1px solid rgba(39, 174, 96, 0.25)',
              color: 'var(--color-success)',
              fontSize: '0.9rem',
              textAlign: 'left',
            }}
          >
            <CheckCircle size={18} />
            {info}
          </div>
        )}

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              borderRadius: '10px',
              background: 'rgba(235, 87, 87, 0.1)',
              border: '1px solid rgba(235, 87, 87, 0.25)',
              color: 'var(--color-error)',
              fontSize: '0.9rem',
              textAlign: 'left',
            }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {step === 'subscribe' && (
          <form
            onSubmit={handleSubscribe}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              maxLength={80}
            />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                style={{ flex: 1, minWidth: '240px' }}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
              >
                {loading ? <Loader size={16} className="spin-animation" /> : <Mail size={16} />}
                Subscribe Now
              </button>
            </div>
          </form>
        )}

        {(step === 'subscribed' || step === 'message-sent') && (
          <div
            style={{
              background: 'rgba(255,255,255,0.85)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                color: 'var(--color-primary-dark)',
                fontWeight: 600,
                fontSize: '0.95rem',
              }}
            >
              <CheckCircle size={18} color="var(--color-success)" />
              Subscribed as {email}
            </div>

            {step === 'message-sent' ? (
              <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>
                Coach Kidist will reply to your email when your message is reviewed. Watch your inbox for
                wellness updates and personal replies.
              </p>
            ) : (
              <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <p style={{ margin: '0 0 0.25rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Send a message directly to Coach Kidist:
                </p>
                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="form-input"
                  maxLength={200}
                />
                <textarea
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="form-input"
                  rows={4}
                  maxLength={5000}
                  style={{ resize: 'vertical' }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {loading ? (
                    <Loader size={16} className="spin-animation" />
                  ) : (
                    <Send size={16} />
                  )}
                  Send Message to Coach
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const ctaSectionStyle: React.CSSProperties = {
  padding: '7rem 0',
  background: 'linear-gradient(180deg, rgba(247, 246, 242, 0.2) 0%, rgba(227, 236, 227, 0.5) 100%)',
  borderTop: '1px solid var(--color-border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};

export default NewsletterSubscribe;
