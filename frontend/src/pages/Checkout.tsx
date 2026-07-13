import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import type { Order } from '../types';
import {
  Package,
  MapPin,
  CreditCard,
  CheckCircle,
  ChevronRight,
  Loader,
  AlertCircle,
  ArrowLeft,
  Lock,
  ShieldCheck,
  Truck,
  Tag,
} from 'lucide-react';

// ─── Load Stripe once at module level (not inside component) ─────────────────
// This prevents re-creating the Stripe object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// ─── Types ───────────────────────────────────────────────────────────────────
type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

interface ShippingForm {
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  notes: string;
}

interface PaymentFormProps {
  clientSecret: string;
  finalTotal: number;
  onSuccess: () => void;
  onError: (message: string) => void;
  onBack: () => void;
}

// ─── Stripe Card Element Appearance ─────────────────────────────────────────
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: '"Inter", system-ui, sans-serif',
      color: '#1a2e1a',
      fontSmoothing: 'antialiased',
      '::placeholder': {
        color: '#8a9e8a',
      },
      iconColor: '#4a7c59',
    },
    invalid: {
      color: '#c0392b',
      iconColor: '#c0392b',
    },
  },
  hidePostalCode: false,
};

// ─── Inner Payment Form (must be inside <Elements>) ──────────────────────────
const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  finalTotal,
  onSuccess,
  onError,
  onBack,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');
  const [cardComplete, setCardComplete] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't loaded yet — disable the button
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      onError('Card element not found. Please refresh and try again.');
      return;
    }

    setProcessing(true);
    setCardError('');

    try {
      // This is the real Stripe payment confirmation call
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        // Stripe returned a payment error (declined, invalid card, etc.)
        setCardError(error.message || 'Payment failed. Please try again.');
        onError(error.message || 'Payment failed. Please try again.');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded — the webhook will mark the order as paid on the backend
        onSuccess();
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Stripe is handling 3D Secure authentication automatically
        // confirmCardPayment handles this flow, so if we reach here it failed
        onError('Additional authentication required. Please try again.');
      } else {
        onError('Payment status unclear. Please contact support.');
      }
    } catch (err: any) {
      console.error('Stripe payment error:', err);
      onError('An unexpected error occurred. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Card Error Banner */}
      {cardError && (
        <div style={errorBannerStyle}>
          <AlertCircle size={18} />
          <span>{cardError}</span>
        </div>
      )}

      {/* Stripe-Powered Card Input */}
      <div>
        <label style={labelStyle}>
          <CreditCard size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />
          Card Details
        </label>
        <div style={stripeCardWrapperStyle}>
          <CardElement
            options={CARD_ELEMENT_OPTIONS}
            onChange={(e) => {
              setCardComplete(e.complete);
              if (e.error) {
                setCardError(e.error.message);
              } else {
                setCardError('');
              }
            }}
          />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <ShieldCheck size={12} /> Your card info is encrypted and never stored on our servers.
        </p>
      </div>

      {/* Supported Cards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Accepted:</span>
        {['VISA', 'MC', 'AMEX', 'DISCOVER'].map(card => (
          <span key={card} style={{
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--color-border)',
            fontSize: '0.65rem',
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            letterSpacing: '0.05em',
          }}>{card}</span>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={onBack}
          disabled={processing}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="submit"
          disabled={!stripe || !cardComplete || processing}
          className="btn btn-primary"
          style={{
            flex: 1,
            justifyContent: 'center',
            display: 'flex',
            gap: '0.5rem',
            fontSize: '1.05rem',
            opacity: (!stripe || !cardComplete || processing) ? 0.7 : 1,
            cursor: (!stripe || !cardComplete || processing) ? 'not-allowed' : 'pointer',
          }}
        >
          {processing ? (
            <>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
              Processing Payment...
            </>
          ) : (
            <>
              <Lock size={18} />
              Pay ${finalTotal.toFixed(2)} Securely
            </>
          )}
        </button>
      </div>

      {/* Stripe Badge */}
      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
        <Lock size={11} style={{ display: 'inline', marginRight: '0.25rem' }} />
        256-bit SSL encrypted · Powered by{' '}
        <strong style={{ color: '#635bff' }}>Stripe</strong>
      </div>
    </form>
  );
};

// ─── Main Checkout Component ─────────────────────────────────────────────────
export const Checkout: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const appliedCoupon = (location.state as any)?.coupon || null;

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shipping, setShipping] = useState<ShippingForm>({
    fullName: user?.name || '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
    notes: '',
  });

  // Order & payment state
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Redirect if cart is empty (but not on confirmation)
  useEffect(() => {
    if (cartItems.length === 0 && step !== 'confirmation') {
      navigate('/cart');
    }
  }, [cartItems, step, navigate]);

  // ─── Pricing Calculation ─────────────────────────────────────────────────
  const subtotal = totalPrice;
  const discount = appliedCoupon?.discountAmount || 0;
  const hasPhysicalItems = cartItems.some(item => item.productId?.productType === 'physical');
  const shippingCost = hasPhysicalItems ? (subtotal >= 75 ? 0 : 9.99) : 0;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const finalTotal = Math.round((subtotal - discount + shippingCost + tax) * 100) / 100;

  // ─── Step 1: Shipping Form Submit ────────────────────────────────────────
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    setPaymentError('');
    // Create the order and get clientSecret when moving to payment step
    handlePlaceOrder();
  };

  // ─── Step 2: Create Order + Get Payment Intent ───────────────────────────
  const handlePlaceOrder = useCallback(async () => {
    setPlacingOrder(true);
    setOrderError('');

    try {
      // Build order items from cart
      const items = cartItems.map(item => ({
        productId: item.productId._id,
        qty: item.qty,
      }));

      const body: any = {
        items,
        shippingAddress: {
          fullName: shipping.fullName || user?.name || 'Customer',
          address: shipping.address,
          city: shipping.city,
          state: shipping.state || shipping.city,
          postalCode: shipping.postalCode,
          country: shipping.country,
          phone: shipping.phone || '',
        },
        notes: shipping.notes || undefined,
      };

      if (appliedCoupon?.code) {
        body.couponCode = appliedCoupon.code;
      }

      // 1️⃣ Create order on backend
      const orderRes = await apiClient.post('/orders', body);
      const order: Order = orderRes.data?.order || orderRes.data?.data?.order;

      if (!order?._id) throw new Error('Order creation failed. Please try again.');
      setCreatedOrder(order);

      // 2️⃣ Create Stripe PaymentIntent → get clientSecret
      const intentRes = await apiClient.post('/payments/create-intent', {
        orderId: order._id,
      });
      const secret: string = intentRes.data?.clientSecret || intentRes.data?.data?.clientSecret;

      if (!secret) throw new Error('Could not initialize payment. Please try again.');
      setClientSecret(secret);

      // Move to payment step
      setStep('payment');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Order creation error:', err);
      setOrderError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to create your order. Please check your details and try again.'
      );
    } finally {
      setPlacingOrder(false);
    }
  }, [cartItems, shipping, user, appliedCoupon]);

  // ─── Step 3: Payment Success Handler ────────────────────────────────────
  const handlePaymentSuccess = useCallback(async () => {
    try {
      // Clear the cart after successful payment
      await clearCart();
    } catch {
      // Non-critical: cart clear failure shouldn't block confirmation
      console.warn('Cart clear failed after payment success');
    }
    setStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [clearCart]);

  // ─── Step labels ─────────────────────────────────────────────────────────
  const steps: { key: CheckoutStep; label: string; icon: React.ReactNode }[] = [
    { key: 'shipping', label: 'Shipping', icon: <Truck size={15} /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard size={15} /> },
    { key: 'confirmation', label: 'Confirmed', icon: <CheckCircle size={15} /> },
  ];

  const stepIndex = (k: CheckoutStep) => steps.findIndex(s => s.key === k);

  return (
    <div className="checkout-page container" style={{ padding: '3rem 2rem', maxWidth: '1100px', minHeight: '100vh' }}>

      {/* ── Progress Stepper ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0', marginBottom: '3rem' }}>
        {steps.map((s, idx) => {
          const isCurrent = step === s.key;
          const isDone = stepIndex(step) > idx;
          return (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                borderRadius: '999px',
                fontWeight: 600,
                fontSize: '0.875rem',
                background: isCurrent
                  ? 'var(--color-primary)'
                  : isDone
                    ? 'var(--color-primary-light)'
                    : 'rgba(0,0,0,0.04)',
                color: isCurrent
                  ? '#fff'
                  : isDone
                    ? 'var(--color-primary-dark)'
                    : 'var(--color-text-muted)',
                border: isDone ? '1px solid var(--color-primary)' : '1px solid transparent',
                transition: 'all 0.3s ease',
              }}>
                {isDone ? <CheckCircle size={15} /> : s.icon}
                {s.label}
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight size={16} color="var(--color-border)" style={{ margin: '0 0.25rem' }} />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid-2" style={{ gap: '2.5rem', alignItems: 'flex-start' }}>

        {/* ── LEFT: Step Forms ─────────────────────────────────────────────── */}
        <div>

          {/* ── STEP 1: Shipping ───────────────────────────────────────────── */}
          {step === 'shipping' && (
            <div className="glass-panel animate-fade-in-up" style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={stepIconStyle}><MapPin size={20} color="var(--color-primary)" /></div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0 }}>Shipping Address</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>Where should we deliver your order?</p>
                </div>
              </div>

              {orderError && (
                <div style={{ ...errorBannerStyle, marginBottom: '1.5rem' }}>
                  <AlertCircle size={18} />
                  <span>{orderError}</span>
                </div>
              )}

              <form onSubmit={handleShippingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Full Name */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName" type="text"
                    placeholder="Jane Smith"
                    required
                    value={shipping.fullName}
                    onChange={e => setShipping(p => ({ ...p, fullName: e.target.value }))}
                    className="form-input"
                  />
                </div>

                {/* Street Address */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="address">Street Address</label>
                  <input
                    id="address" type="text"
                    placeholder="123 Main Street, Apt 4B"
                    required
                    value={shipping.address}
                    onChange={e => setShipping(p => ({ ...p, address: e.target.value }))}
                    className="form-input"
                  />
                </div>

                {/* City + State */}
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="city">City</label>
                    <input
                      id="city" type="text"
                      placeholder="New York"
                      required
                      value={shipping.city}
                      onChange={e => setShipping(p => ({ ...p, city: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="state">State / Province</label>
                    <input
                      id="state" type="text"
                      placeholder="NY"
                      value={shipping.state}
                      onChange={e => setShipping(p => ({ ...p, state: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Postal + Country */}
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="postalCode">Postal Code</label>
                    <input
                      id="postalCode" type="text"
                      placeholder="10001"
                      required
                      value={shipping.postalCode}
                      onChange={e => setShipping(p => ({ ...p, postalCode: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="country">Country</label>
                    <select
                      id="country"
                      value={shipping.country}
                      onChange={e => setShipping(p => ({ ...p, country: e.target.value }))}
                      className="form-input"
                    >
                      {[
                        'United States', 'United Kingdom', 'Canada', 'Australia',
                        'Germany', 'France', 'Nigeria', 'South Africa', 'Ethiopia', 'Kenya', 'Other'
                      ].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="phone">Phone Number</label>
                  <input
                    id="phone" type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={shipping.phone}
                    onChange={e => setShipping(p => ({ ...p, phone: e.target.value }))}
                    className="form-input"
                  />
                </div>

                {/* Notes */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="notes">Order Notes (Optional)</label>
                  <textarea
                    id="notes"
                    rows={2}
                    placeholder="Any special delivery instructions..."
                    value={shipping.notes}
                    onChange={e => setShipping(p => ({ ...p, notes: e.target.value }))}
                    className="form-input"
                    style={{ resize: 'none' }}
                  />
                </div>

                {/* Applied Coupon Badge */}
                {appliedCoupon && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.2)' }}>
                    <Tag size={14} color="var(--color-success)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-success)', fontWeight: 600 }}>
                      Coupon "{appliedCoupon.code}" applied — saving ${discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <Link to="/cart" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={16} /> Back to Cart
                  </Link>
                  <button
                    type="submit"
                    disabled={placingOrder}
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center', display: 'flex', gap: '0.5rem' }}
                  >
                    {placingOrder ? (
                      <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Preparing Order...</>
                    ) : (
                      <>Continue to Payment <ChevronRight size={16} /></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── STEP 2: Payment ─────────────────────────────────────────────── */}
          {step === 'payment' && (
            <div className="glass-panel animate-fade-in-up" style={cardStyle}>
              <div style={cardHeaderStyle}>
                <div style={stepIconStyle}><CreditCard size={20} color="var(--color-primary)" /></div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0 }}>Secure Payment</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    <ShieldCheck size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />
                    Powered by Stripe — PCI DSS compliant
                  </p>
                </div>
              </div>

              {/* General payment error (from order creation) */}
              {paymentError && (
                <div style={{ ...errorBannerStyle, marginBottom: '1.5rem' }}>
                  <AlertCircle size={18} />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* Stripe loading guard */}
              {!clientSecret ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
                  <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--color-primary)' }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>Initializing secure payment...</p>
                </div>
              ) : (
                // ✅ Wrap PaymentForm in <Elements> provider — required by Stripe
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#4a7c59',
                        colorBackground: '#ffffff',
                        colorText: '#1a2e1a',
                        colorDanger: '#c0392b',
                        fontFamily: '"Inter", system-ui, sans-serif',
                        borderRadius: '12px',
                      },
                    },
                  }}
                >
                  <PaymentForm
                    clientSecret={clientSecret}
                    finalTotal={finalTotal}
                    onSuccess={handlePaymentSuccess}
                    onError={(msg) => setPaymentError(msg)}
                    onBack={() => {
                      setStep('shipping');
                      setPaymentError('');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </Elements>
              )}
            </div>
          )}

          {/* ── STEP 3: Confirmation ─────────────────────────────────────────── */}
          {step === 'confirmation' && (
            <div className="glass-panel animate-scale-up" style={{ ...cardStyle, textAlign: 'center' }}>
              {/* Success checkmark */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                backgroundColor: 'rgba(39,174,96,0.12)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 0 0 12px rgba(39,174,96,0.06)',
              }}>
                <CheckCircle size={44} color="var(--color-success)" />
              </div>

              <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem' }}>
                Payment Successful! 🌿
              </h2>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem auto', lineHeight: '1.7' }}>
                Thank you, <strong>{user?.name?.split(' ')[0]}</strong>! Your order is being processed.
                A confirmation email has been sent to <strong>{user?.email}</strong>.
              </p>

              {createdOrder && (
                <div style={{
                  display: 'inline-flex', flexDirection: 'column', gap: '0.25rem',
                  padding: '0.875rem 2rem', borderRadius: '12px',
                  backgroundColor: 'var(--color-primary-light)',
                  marginBottom: '2rem', border: '1px solid var(--color-primary)',
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Order Reference</p>
                  <p style={{ margin: 0, fontWeight: 700, fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>
                    {(createdOrder as any).orderNumber || `#${(createdOrder as any)._id?.toString().slice(-8).toUpperCase()}`}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/orders" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={16} /> Track My Order
                </Link>
                <Link to="/shop" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Order Summary (hidden on confirmation) ─────────────────── */}
        {step !== 'confirmation' && (
          <div>
            <div className="glass-panel" style={{ ...cardStyle, position: 'sticky', top: '100px' }}>
              <h3 style={{
                fontSize: '1.1rem', color: 'var(--color-primary-dark)',
                marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)',
                paddingBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <Package size={16} />
                Order Summary <span style={{ color: 'var(--color-text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
              </h3>

              {/* Items list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
                {cartItems.map(item => (
                  <div key={item.productId?._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--color-border)' }}>
                      <img
                        src={item.productId?.images?.[0]?.url || 'https://via.placeholder.com/52'}
                        alt={item.productId?.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.productId?.title}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Qty: {item.qty}</p>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, flexShrink: 0, color: 'var(--color-primary-dark)' }}>
                      ${((item.productId?.price || 0) * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <div style={summaryRowStyle}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ ...summaryRowStyle, color: 'var(--color-success)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Tag size={12} /> Coupon Discount
                    </span>
                    <span>−${discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={summaryRowStyle}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
                  <span>
                    {shippingCost === 0
                      ? <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>FREE</span>
                      : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div style={summaryRowStyle}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div style={{
                  ...summaryRowStyle,
                  fontWeight: 700,
                  fontSize: '1.15rem',
                  color: 'var(--color-primary-dark)',
                  borderTop: '1px dashed var(--color-border)',
                  paddingTop: '0.875rem',
                  marginTop: '0.25rem'
                }}>
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping address preview on payment step */}
              {step === 'payment' && shipping.address && (
                <div style={{ marginTop: '1.25rem', padding: '0.875rem', borderRadius: '10px', backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }}>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Truck size={12} /> Delivering to:
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                    {shipping.fullName && <><strong>{shipping.fullName}</strong><br /></>}
                    {shipping.address}, {shipping.city}{shipping.state ? `, ${shipping.state}` : ''} {shipping.postalCode}, {shipping.country}
                    {shipping.phone && <><br />{shipping.phone}</>}
                  </p>
                </div>
              )}

              {/* Security Badges */}
              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(120,150,120,0.05)', border: '1px solid var(--color-border)' }}>
                <ShieldCheck size={14} color="var(--color-success)" />
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                  Secure checkout · SSL encrypted · Stripe protected
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up { animation: scaleUp 0.4s ease forwards; }

        /* Stripe CardElement container styling */
        .StripeElement {
          width: 100%;
          padding: 0.9rem 1.25rem;
          background: rgba(255,255,255,0.8);
          border: 1px solid rgba(120,150,120,0.3);
          border-radius: 12px;
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .StripeElement--focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px rgba(120,150,120,0.15);
          background: #fff;
        }
        .StripeElement--invalid {
          border-color: #c0392b;
          box-shadow: 0 0 0 3px rgba(192,57,43,0.1);
        }

        @media (max-width: 768px) {
          .grid-2 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .checkout-page { padding: 1.5rem 1rem !important; }
        }
      `}</style>
    </div>
  );
};

// ─── Style Constants ─────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  padding: '2.5rem 2rem',
  background: '#fff',
  border: '1px solid var(--color-border)',
  borderRadius: '20px',
  boxShadow: 'var(--shadow-md)',
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.875rem',
  marginBottom: '2rem',
};

const stepIconStyle: React.CSSProperties = {
  width: '46px',
  height: '46px',
  borderRadius: '50%',
  backgroundColor: 'var(--color-primary-light)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  border: '1px solid rgba(120,150,120,0.2)',
};

const stripeCardWrapperStyle: React.CSSProperties = {
  borderRadius: '12px',
  overflow: 'hidden',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-heading)',
  fontWeight: 500,
  fontSize: '0.9rem',
  color: 'var(--color-primary-dark)',
  marginBottom: '0.5rem',
};

const errorBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  borderRadius: '10px',
  backgroundColor: 'rgba(192,57,43,0.07)',
  border: '1px solid rgba(192,57,43,0.2)',
  color: 'var(--color-error)',
  fontSize: '0.875rem',
  fontWeight: 500,
};

const summaryRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.9rem',
};

export default Checkout;
