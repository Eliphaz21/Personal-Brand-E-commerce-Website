import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import type { Order } from '../types';
import {
  Package, MapPin, CreditCard, CheckCircle, ChevronRight,
  Loader, AlertCircle, ArrowLeft, Lock
} from 'lucide-react';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

interface ShippingForm {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  notes: string;
}

export const Checkout: React.FC = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const appliedCoupon = (location.state as any)?.coupon || null;

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shipping, setShipping] = useState<ShippingForm>({
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
    notes: '',
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Stripe payment state
  const [clientSecret, setClientSecret] = useState('');
  const [stripeLoading, setStripeLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && step !== 'confirmation') {
      navigate('/cart');
    }
  }, [cartItems, step, navigate]);

  // Pricing (mirrors Cart.tsx logic)
  const subtotal = totalPrice;
  const discount = appliedCoupon?.discountAmount || 0;
  const hasPhysicalItems = cartItems.some(item => item.productId?.productType === 'physical');
  const shipping_cost = hasPhysicalItems ? (subtotal >= 75 ? 0 : 9.99) : 0;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const finalTotal = Math.round((subtotal - discount + shipping_cost + tax) * 100) / 100;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
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
          address: shipping.address,
          city: shipping.city,
          postalCode: shipping.postalCode,
          country: shipping.country,
        },
        notes: shipping.notes || undefined,
      };

      if (appliedCoupon?.code) {
        body.couponCode = appliedCoupon.code;
      }

      // Step 1: Create the order
      const orderRes = await apiClient.post('/orders', body);
      const order = orderRes.data?.order || orderRes.data?.data?.order;

      if (!order?._id) throw new Error('Order creation failed.');
      setCreatedOrder(order);

      // Step 2: Get Stripe clientSecret for this order
      setStripeLoading(true);
      const intentRes = await apiClient.post('/payments/create-intent', {
        orderId: order._id,
      });
      const secret = intentRes.data?.clientSecret || intentRes.data?.data?.clientSecret;
      if (secret) {
        setClientSecret(secret);
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      setOrderError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to create your order. Please check your cart and try again.'
      );
    } finally {
      setPlacingOrder(false);
      setStripeLoading(false);
    }
  };

  // Simulate Stripe card payment (real integration requires @stripe/react-stripe-js Elements)
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createdOrder) {
      await handlePlaceOrder();
      return;
    }

    setProcessingPayment(true);
    setPaymentError('');

    try {
      // In a production env, Stripe.js would confirm the payment intent with clientSecret here.
      // The webhook then automatically marks the order as paid.
      // For demo: we simulate a 2-second processing delay and show confirmation.
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Clear the cart and go to confirmation
      await clearCart();
      setStep('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Payment error:', err);
      setPaymentError('Payment processing failed. Please check your card details and try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  // Step labels
  const steps: { key: CheckoutStep; label: string; icon: React.ReactNode }[] = [
    { key: 'shipping', label: 'Shipping', icon: <MapPin size={16} /> },
    { key: 'payment', label: 'Payment', icon: <CreditCard size={16} /> },
    { key: 'confirmation', label: 'Confirmed', icon: <CheckCircle size={16} /> },
  ];

  return (
    <div className="checkout-page container" style={{ padding: '3rem 2rem', maxWidth: '1100px', minHeight: '100vh' }}>

      {/* Progress Stepper */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0', marginBottom: '3rem' }}>
        {steps.map((s, idx) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: step === s.key
                ? 'var(--color-primary)'
                : ['confirmation', 'payment'].includes(step) && idx < steps.findIndex(x => x.key === step)
                  ? 'var(--color-primary-light)'
                  : 'rgba(0,0,0,0.04)',
              color: step === s.key ? '#fff' : 'var(--color-text-muted)',
              transition: 'all 0.3s ease'
            }}>
              {s.icon} {s.label}
            </div>
            {idx < steps.length - 1 && (
              <ChevronRight size={16} color="var(--color-border)" style={{ margin: '0 0.25rem' }} />
            )}
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: '2.5rem', alignItems: 'flex-start' }}>

        {/* ─── LEFT: Current Step Form ─────────────────────────────── */}
        <div>
          {/* STEP 1: Shipping */}
          {step === 'shipping' && (
            <div className="glass-panel" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={stepIconStyle}><MapPin size={20} color="var(--color-primary)" /></div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0 }}>Shipping Address</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>Where should we deliver your order?</p>
                </div>
              </div>

              <form onSubmit={handleShippingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="country">Country</label>
                  <select
                    id="country"
                    value={shipping.country}
                    onChange={e => setShipping(p => ({ ...p, country: e.target.value }))}
                    className="form-input"
                  >
                    {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Nigeria', 'South Africa', 'Ethiopia', 'Kenya', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="notes">Order Notes (Optional)</label>
                  <textarea
                    id="notes"
                    rows={3}
                    placeholder="Any special delivery instructions..."
                    value={shipping.notes}
                    onChange={e => setShipping(p => ({ ...p, notes: e.target.value }))}
                    className="form-input"
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <Link to="/cart" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={16} /> Back to Cart
                  </Link>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', display: 'flex', gap: '0.5rem' }}>
                    Continue to Payment <ChevronRight size={16} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 'payment' && (
            <div className="glass-panel" style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                <div style={stepIconStyle}><CreditCard size={20} color="var(--color-primary)" /></div>
                <div>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--color-primary-dark)', margin: 0 }}>Secure Payment</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    <Lock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    256-bit SSL encrypted, powered by Stripe
                  </p>
                </div>
              </div>

              {orderError && (
                <div style={errorBannerStyle}>
                  <AlertCircle size={18} />
                  <span>{orderError}</span>
                </div>
              )}

              {paymentError && (
                <div style={errorBannerStyle}>
                  <AlertCircle size={18} />
                  <span>{paymentError}</span>
                </div>
              )}

              <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Fake card UI matching Stripe feel */}
                <div style={{
                  padding: '1.5rem',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, hsl(120, 15%, 20%) 100%)',
                  color: '#fff',
                  marginBottom: '0.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                  <p style={{ fontSize: '0.7rem', opacity: 0.6, marginBottom: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Card Number</p>
                  <p style={{ fontSize: '1.25rem', letterSpacing: '0.25em', fontFamily: 'monospace', margin: '0 0 1.5rem 0' }}>
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '0.65rem', opacity: 0.5, margin: '0 0 0.2rem 0' }}>CARD HOLDER</p>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>{user?.name || 'FULL NAME'}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.65rem', opacity: 0.5, margin: '0 0 0.2rem 0' }}>EXPIRES</p>
                      <p style={{ fontSize: '0.9rem', margin: 0 }}>{cardExpiry || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" htmlFor="cardNumber">Card Number</label>
                  <input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    required
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="form-input"
                    style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}
                  />
                </div>

                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="cardExpiry">Expiry Date</label>
                    <input
                      id="cardExpiry"
                      type="text"
                      placeholder="MM/YY"
                      required
                      inputMode="numeric"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" htmlFor="cardCvc">CVC / CVV</label>
                    <input
                      id="cardCvc"
                      type="text"
                      placeholder="123"
                      required
                      inputMode="numeric"
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setStep('shipping')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayment || placingOrder || stripeLoading}
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center', display: 'flex', gap: '0.5rem', fontSize: '1.05rem' }}
                  >
                    {processingPayment || placingOrder || stripeLoading ? (
                      <><Loader size={18} className="spin-animation" /> Processing...</>
                    ) : (
                      <><Lock size={18} /> Pay ${finalTotal.toFixed(2)}</>
                    )}
                  </button>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                  <Lock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Your payment information is secure and encrypted. We never store your card details.
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Confirmation */}
          {step === 'confirmation' && (
            <div className="glass-panel animate-scale-up" style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(39,174,96,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <CheckCircle size={40} color="var(--color-success)" />
              </div>
              <h2 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem' }}>
                Order Confirmed! 🌿
              </h2>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
                Thank you, <strong>{user?.name?.split(' ')[0]}</strong>! Your wellness products are on their way.
                A confirmation email has been sent to <strong>{user?.email}</strong>.
              </p>

              {createdOrder && (
                <div style={{ display: 'inline-block', padding: '0.75rem 1.5rem', borderRadius: '8px', backgroundColor: 'var(--color-primary-light)', marginBottom: '2rem', border: '1px solid var(--color-border)' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Order Reference</p>
                  <p style={{ margin: 0, fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                    #{(createdOrder as any)._id?.toString().slice(-8).toUpperCase()}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/profile" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={16} /> View My Orders
                </Link>
                <Link to="/shop" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Order Summary (hidden on confirmation) ─────────── */}
        {step !== 'confirmation' && (
          <div>
            <div className="glass-panel" style={{ ...cardStyle, position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h3>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {cartItems.map(item => (
                  <div key={item.productId?._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--color-border)' }}>
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
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Qty: {item.qty}</p>
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', flexShrink: 0 }}>
                      ${((item.productId?.price || 0) * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                <div style={summaryRowStyle}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ ...summaryRowStyle, color: 'var(--color-success)' }}>
                    <span>Coupon Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div style={summaryRowStyle}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Shipping</span>
                  <span>{shipping_cost === 0 ? <span style={{ color: 'var(--color-success)' }}>FREE</span> : `$${shipping_cost.toFixed(2)}`}</span>
                </div>
                <div style={summaryRowStyle}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div style={{ ...summaryRowStyle, fontWeight: 'bold', fontSize: '1.15rem', color: 'var(--color-primary-dark)', borderTop: '1px dashed var(--color-border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                  <span>Total</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping address preview on payment step */}
              {step === 'payment' && shipping.address && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }}>
                  <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={12} /> Delivering to:
                  </p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                    {shipping.address}, {shipping.city}, {shipping.postalCode}, {shipping.country}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .spin-animation { animation: rotate 1.5s linear infinite; }
        @keyframes rotate { 100% { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

/* Styles */
const cardStyle: React.CSSProperties = {
  padding: '2.5rem 2rem',
  background: '#fff',
  border: '1px solid var(--color-border)',
  borderRadius: '20px',
  boxShadow: 'var(--shadow-md)'
};

const stepIconStyle: React.CSSProperties = {
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  backgroundColor: 'var(--color-primary-light)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const errorBannerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '1rem',
  borderRadius: '10px',
  backgroundColor: 'rgba(235,87,87,0.08)',
  border: '1px solid rgba(235,87,87,0.2)',
  color: 'var(--color-error)',
  fontSize: '0.875rem',
  fontWeight: 500,
  marginBottom: '1.25rem'
};

const summaryRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.9rem'
};

export default Checkout;
