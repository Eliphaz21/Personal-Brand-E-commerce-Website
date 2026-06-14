import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import { ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, AlertCircle, CheckCircle, Loader } from 'lucide-react';

export const Cart: React.FC = () => {
  const { 
    cartItems, 
    isLoading, 
    totalPrice, 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Local updating status for individual items to prevent double-clicking
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleQtyChange = async (productId: string, currentQty: number, newQty: number, maxStock: number) => {
    if (newQty < 1 || newQty > maxStock) return;
    setUpdatingId(productId);
    try {
      await updateCartItemQuantity(productId, newQty);
    } catch (err) {
      console.error('Failed to update quantity:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    setUpdatingId(productId);
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error('Failed to remove item:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');
    
    try {
      const response = await apiClient.post('/coupons/validate', {
        code: couponCode,
        subtotal: totalPrice
      });
      
      const validatedCoupon = response.data?.coupon;
      if (validatedCoupon) {
        setAppliedCoupon(validatedCoupon);
        setCouponSuccess(`Coupon "${validatedCoupon.code}" applied successfully!`);
        setCouponCode('');
      }
    } catch (err: any) {
      console.error('Coupon validation error:', err);
      setCouponError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Invalid coupon code.'
      );
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  // Pricing calculations
  const subtotal = totalPrice;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  
  // Free shipping over $75, otherwise flat rate of $9.99 (only if there are physical items)
  const hasPhysicalItems = cartItems.some(item => item.productId?.productType === 'physical');
  const shipping = hasPhysicalItems ? (subtotal >= 75 ? 0 : 9.99) : 0;
  
  // Tax rate (8% of subtotal after discount)
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const finalTotal = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

  if (isLoading && cartItems.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div className="spinner" style={spinnerStyle} />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <ShoppingBag size={36} color="var(--color-primary)" />
        </div>
        <h2>Your Shopping Bag is Empty</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>
          You haven't added any products or services to your bag yet.
        </p>
        <Link to="/shop" className="btn btn-primary">
          Explore Supplements & Programs
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page container" style={{ padding: '3rem 2rem', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '3rem' }}>Your Shopping Bag</h1>

      <div className="grid-3" style={{ gap: '3rem', gridTemplateColumns: '2fr 1fr' }}>
        {/* Left Side: Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cartItems.map((item) => {
            const product = item.productId;
            if (!product) return null;

            return (
              <div 
                key={product._id} 
                className="glass-panel" 
                style={{
                  display: 'flex',
                  gap: '1.5rem',
                  padding: '1.5rem',
                  background: '#fff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  position: 'relative',
                  opacity: updatingId === product._id ? 0.7 : 1,
                  transition: 'opacity 0.2s ease',
                  flexWrap: 'wrap'
                }}
              >
                {/* Image */}
                <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                  <img 
                    src={product.images?.[0]?.url || 'https://via.placeholder.com/100'} 
                    alt={product.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    {product.category}
                  </span>
                  <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>
                      {product.title}
                    </h3>
                  </Link>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: 'auto' }}>
                    Unit Price: ${product.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity adjustments */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--color-border)',
                    borderRadius: '999px',
                    padding: '0.25rem',
                    backgroundColor: 'var(--color-bg-main)'
                  }}>
                    <button 
                      onClick={() => handleQtyChange(product._id, item.qty, item.qty - 1, product.stock)}
                      disabled={item.qty <= 1 || updatingId === product._id}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', color: 'var(--color-primary-dark)' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ width: '30px', textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</span>
                    <button 
                      onClick={() => handleQtyChange(product._id, item.qty, item.qty + 1, product.stock)}
                      disabled={item.qty >= product.stock || updatingId === product._id}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem 0.5rem', color: 'var(--color-primary-dark)' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Subtotal & Delete */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: '110px', justifyContent: 'flex-end' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>
                      ${(product.price * item.qty).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemove(product._id)}
                      disabled={updatingId === product._id}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-error)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        borderRadius: '50%',
                        transition: 'background 0.2s'
                      }}
                      className="trash-btn"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Actions panel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              ← Continue Shopping
            </Link>
            <button 
              onClick={clearCart}
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
            >
              Clear Shopping Bag
            </button>
          </div>
        </div>

        {/* Right Side: Order Summary Card */}
        <div>
          <div className="glass-panel" style={{ padding: '2.5rem 2rem', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '20px', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                  <span>Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Estimated Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
              </div>

              {shipping > 0 && (
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 500 }}>
                  Add ${(75 - subtotal).toFixed(2)} more to qualify for FREE shipping!
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Estimated Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--color-border)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '1.15rem' }}>Total Amount</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.35rem', color: 'var(--color-primary-dark)' }}>
                  ${finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Promo Codes */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Tag size={14} /> Coupon / Promo Code
              </h4>

              {appliedCoupon ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                      {appliedCoupon.code}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                      ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `$${appliedCoupon.discountValue}`} off)
                    </span>
                  </div>
                  <button 
                    onClick={handleRemoveCoupon}
                    style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="form-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  />
                  <button 
                    type="submit" 
                    disabled={couponLoading || !couponCode.trim()}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    {couponLoading ? <Loader size={14} className="spin-animation" /> : 'Apply'}
                  </button>
                </form>
              )}

              {couponError && (
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500 }}>
                  <AlertCircle size={12} /> {couponError}
                </div>
              )}

              {couponSuccess && (
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', color: 'var(--color-success)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 500 }}>
                  <CheckCircle size={12} /> {couponSuccess}
                </div>
              )}
            </div>

            {/* Checkout Action */}
            <button 
              onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon } })}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .trash-btn:hover {
          background-color: rgba(235, 87, 87, 0.08);
        }
        .spin-animation {
          animation: rotate 1.5s linear infinite;
        }
        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 992px) {
          .grid-3 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

/* Styles definitions */
const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '4px solid var(--color-primary-light)',
  borderTop: '4px solid var(--color-primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

export default Cart;
