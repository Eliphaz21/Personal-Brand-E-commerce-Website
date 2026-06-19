import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import apiClient from '../services/apiClient';
import type { Product, Review } from '../types';
import { Star, ShoppingCart, CheckCircle, ShieldAlert, ArrowLeft, Loader, Plus, Minus, Send } from 'lucide-react';
import SEO from '../components/SEO';

/* Styles definitions */
const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '4px solid var(--color-primary-light)',
  borderTop: '4px solid var(--color-primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // States
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping'>('desc');
  const [selectedImage, setSelectedImage] = useState(0);

  // Review Form States
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Cart Status States
  const [adding, setAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Fetch Product & Reviews on Mount/Slug Change
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setProduct(null);
      setReviews([]);
      try {
        const prodRes = await apiClient.get(`/products/${slug}`);
        const foundProd = prodRes.data?.product || prodRes.data?.data?.product || prodRes.data?.data || null;

        if (foundProd) {
          setProduct(foundProd);
          await fetchReviews(foundProd._id);
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        setProduct(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
    }
    setQuantity(1);
    setSelectedImage(0);
  }, [slug]);

  const fetchReviews = async (productId: string) => {
    try {
      const revRes = await apiClient.get(`/reviews/product/${productId}`);
      const fetchedReviews = revRes.data?.reviews || revRes.data?.data?.reviews || [];
      setReviews(
        fetchedReviews.map((review: Review & { userId?: { _id: string; name: string; avatar?: string } }) => ({
          ...review,
          user: review.user || (review.userId && typeof review.userId === 'object'
            ? { _id: review.userId._id, name: review.userId.name, avatar: review.userId.avatar }
            : undefined),
        }))
      );
    } catch (err) {
      console.error('Failed to get reviews:', err);
      setReviews([]);
    }
  };

  const handleQuantityChange = (type: 'inc' | 'dec') => {
    if (!product) return;
    if (type === 'inc') {
      if (quantity < product.stock) setQuantity(quantity + 1);
    } else {
      if (quantity > 1) setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    if (product.productType === 'affiliate' && product.affiliateUrl) {
      window.open(product.affiliateUrl, '_blank');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/product/${slug}` } });
      return;
    }

    setAdding(true);
    try {
      await addToCart(product._id, quantity);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!newComment.trim()) {
      setReviewError('Please write a review comment.');
      return;
    }

    setReviewLoading(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await apiClient.post('/reviews', {
        productId: product._id,
        rating: newRating,
        comment: newComment
      });

      setReviewSuccess('Review submitted successfully! Thank you for your feedback.');
      setNewComment('');
      setNewRating(5);

      // Refresh reviews
      fetchReviews(product._id);
    } catch (err: any) {
      console.error('Review submit error:', err);
      setReviewError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to submit review. You must have purchased this item to review it.'
      );
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
        <div className="spinner" style={spinnerStyle} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <ShieldAlert size={48} color="var(--color-error)" style={{ marginBottom: '1.5rem' }} />
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>We couldn't find the product you are looking for.</p>
        <Link to="/shop" className="btn btn-primary" style={{ marginTop: '2rem' }}>
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 10);
  const discountPercent = product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <>
      <SEO
        title={`${product.title} | Kidist Fertility & Wellness`}
        description={product.description || `Premium ${product.title} for fertility and wellness. Science-backed natural supplements by Kidist.`}
        keywords={`${product.title}, fertility, wellness, supplements, ${product.category}, natural health, PCOS support, hormone balance`}
        image={product.images?.[0]?.url || '/og-product.jpg'}
        url={window.location.href}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.title,
          description: product.description,
          image: product.images?.map(img => img.url),
          brand: {
            '@type': 'Brand',
            name: 'Kidist Fertility & Wellness'
          },
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: window.location.href
          },
          category: product.category,
          aggregateRating: product.rating ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.numReviews || 0
          } : undefined
        }}
      />
      <div className="product-details-page container" style={{ padding: '3rem 2rem' }}>

        {/* Back button */}
        <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '2rem', fontWeight: 500 }}>
          <ArrowLeft size={16} /> Back to shop
        </Link>

        {/* Main product card layout */}
        <div className="grid-2" style={{ gap: '3rem', marginBottom: '5rem' }}>

          {/* Left Side: Images */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Large display */}
            <div style={{
              height: '460px',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid var(--color-border)',
              background: 'var(--color-glass)',
              position: 'relative'
            }}>
              <img
                src={product.images[selectedImage]?.url || 'https://via.placeholder.com/600'}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {discountPercent > 0 && (
                <span style={{ position: 'absolute', top: '20px', left: '20px', backgroundColor: 'var(--color-secondary)', color: 'white', padding: '0.35rem 0.75rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: selectedImage === index ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <img src={img.url} alt={`Thumbnail ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Details & Purchasing */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              {product.category}
            </span>
            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '1rem', lineHeight: '1.2' }}>
              {product.title}
            </h1>

            {/* Ratings & reviews count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex' }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    color={i < Math.floor(product.rating) ? '#ffd700' : 'var(--color-border)'}
                    fill={i < Math.floor(product.rating) ? '#ffd700' : 'none'}
                  />
                ))}
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.95rem', marginLeft: '0.25rem' }}>{product.rating}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>({product.numReviews} customer reviews)</span>
            </div>

            {/* Pricing */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', lineHeight: 1 }}>
                ${product.price.toFixed(2)}
              </span>
              {product.compareAtPrice > product.price && (
                <span style={{ fontSize: '1.25rem', textDecoration: 'line-through', color: 'var(--color-text-muted)', marginBottom: '2px' }}>
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Short description */}
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.05rem', lineHeight: '1.6' }}>
              {product.shortDescription || product.description.slice(0, 150) + '...'}
            </p>

            {/* Stock Notification */}
            <div style={{ marginBottom: '2rem' }}>
              {isOutOfStock ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)', fontWeight: 600 }}>
                  <ShieldAlert size={18} /> Out of Stock (Restocking Soon)
                </div>
              ) : isLowStock ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)', fontWeight: 600 }}>
                  <ShieldAlert size={18} /> Low Stock alert: Only {product.stock} items remaining!
                </div>
              ) : product.productType === 'physical' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontWeight: 600 }}>
                  ✓ Product In Stock (Ships in 24 Hours)
                </div>
              ) : null}
            </div>

            {/* Purchase Block */}
            {product.productType === 'affiliate' ? (
              <button onClick={handleAddToCart} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', width: '100%', maxWidth: '300px' }}>
                Redirect to External Store <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Quantity selector */}
                {!isOutOfStock && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--color-border)',
                    borderRadius: '999px',
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#fff'
                  }}>
                    <button
                      onClick={() => handleQuantityChange('dec')}
                      disabled={quantity <= 1}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', color: quantity <= 1 ? 'var(--color-border)' : 'var(--color-primary-dark)' }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('inc')}
                      disabled={quantity >= product.stock}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', display: 'flex', color: quantity >= product.stock ? 'var(--color-border)' : 'var(--color-primary-dark)' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}

                {/* Purchase CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={adding || isOutOfStock}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    maxWidth: '300px',
                    padding: '1rem',
                    fontSize: '1.05rem',
                    background: addSuccess ? 'var(--color-success)' : 'var(--color-primary)',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                  }}
                >
                  {addSuccess ? (
                    <>
                      <CheckCircle size={20} /> Added to bag!
                    </>
                  ) : adding ? (
                    <>
                      <Loader size={20} className="spin-animation" /> Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} /> Add to Shopping Bag
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TABS: Description, Specs, Shipping */}
        <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
          {['desc', 'specs', 'shipping'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '3px solid var(--color-primary)' : '3px solid transparent',
                padding: '1rem 0.5rem',
                fontSize: '1.05rem',
                fontWeight: 600,
                cursor: 'pointer',
                color: activeTab === tab ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                transition: 'all 0.2s ease'
              }}
            >
              {tab === 'desc' ? 'Description' : tab === 'specs' ? 'Specifications' : 'Shipping & Delivery'}
            </button>
          ))}
        </div>

        <div style={{ minHeight: '150px', marginBottom: '6rem', lineHeight: '1.7', color: 'var(--color-text-main)' }}>
          {activeTab === 'desc' && (
            <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>
          )}

          {activeTab === 'specs' && (
            <div style={{ maxWidth: '600px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>Product SKU</td>
                    <td style={{ padding: '0.75rem' }}>{product.sku || 'N/A'}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>Category</td>
                    <td style={{ padding: '0.75rem' }}>{product.category}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>Format/Type</td>
                    <td style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{product.productType}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>Shipping Weight</td>
                    <td style={{ padding: '0.75rem' }}>{product.weight ? `${product.weight} grams` : 'Digital delivery / No shipping required'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div>
              <p><strong>Physical supplements:</strong> We ship worldwide using DHL or FedEx. Tracking codes are attached to orders within 24 hours of administrative checkout confirmation. Standard delivery speeds range from 3 to 7 business days.</p>
              <p style={{ marginTop: '1rem' }}><strong>Digital coaching sessions:</strong> Consultations are scheduled instantly. You will receive an email calendar link to book your 1-on-1 session with Coach Kidist within 5 minutes of checkout.</p>
            </div>
          )}
        </div>

        {/* REVIEWS SECTION */}
        <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '4rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--color-primary-dark)', marginBottom: '2rem' }}>Customer Feedback ({reviews.length})</h2>

          <div className="grid-2" style={{ gap: '4rem', alignItems: 'flex-start' }}>
            {/* Reviews list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No customer reviews yet. Be the first to purchase and review this item.</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="glass-panel" style={{ padding: '1.5rem', background: '#fff', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary-dark)' }}>
                        {rev.user?.name}
                      </h5>
                      <div style={{ display: 'flex' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} color={i < rev.rating ? '#ffd700' : 'var(--color-border)'} fill={i < rev.rating ? '#ffd700' : 'none'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: 'var(--color-text-main)', fontSize: '0.9rem', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                      "{rev.comment}"
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      {rev.isVerifiedPurchase && (
                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>✓ Verified Purchase</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Write a review form */}
            <div>
              <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.6)', border: '1px solid var(--color-border)', borderRadius: '16px' }}>
                <h3 style={{ color: 'var(--color-primary-dark)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>Submit Customer Review</h3>

                {!isAuthenticated ? (
                  <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>You must sign in to submit comments or star ratings.</p>
                    <Link to="/login" className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                      Login / Register
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {reviewError && (
                      <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(235, 87, 87, 0.08)', border: '1px solid rgba(235, 87, 87, 0.2)', fontSize: '0.8rem', color: 'var(--color-error)', fontWeight: 500 }}>
                        {reviewError}
                      </div>
                    )}

                    {reviewSuccess && (
                      <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(39, 174, 96, 0.08)', border: '1px solid rgba(39, 174, 96, 0.2)', fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 500 }}>
                        {reviewSuccess}
                      </div>
                    )}

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Product Rating</label>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <Star
                              size={24}
                              color={star <= newRating ? '#ffd700' : 'var(--color-border)'}
                              fill={star <= newRating ? '#ffd700' : 'none'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" htmlFor="review-comment">Review Description</label>
                      <textarea
                        id="review-comment"
                        rows={4}
                        placeholder="Write your experience, supplement effects, or consultation feedback here..."
                        required
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="form-input"
                        style={{ resize: 'none' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={reviewLoading}
                      className="btn btn-primary"
                      style={{ padding: '0.75rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      {reviewLoading ? (
                        <>
                          <Loader size={16} className="spin-animation" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Send size={16} /> Submit Review
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        <style>{`
        .spin-animation {
          animation: rotate 1.5s linear infinite;
        }
        @keyframes rotate {
          100% { transform: rotate(360deg); }
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .product-details-container {
            padding: 1rem 0.5rem 3rem 0 !important;
          }
          
          .product-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          
          .product-image-gallery {
            order: -1 !important;
          }
          
          .quantity-selector {
            flex-direction: row !important;
            width: 100% !important;
          }
          
          .quantity-btn {
            flex: 1 !important;
          }
          
          .quantity-input {
            flex: 1 !important;
            text-align: center !important;
          }
        }

        @media (max-width: 480px) {
          .product-details-container {
            padding: 1rem 0 3rem 0 !important;
          }
          
          .back-button {
            font-size: 0.85rem !important;
            padding: 0.4rem 0.8rem !important;
          }
          
          .product-title {
            font-size: 1.5rem !important;
          }
          
          .product-price {
            font-size: 1.25rem !important;
          }
          
          .thumbnail-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 0.5rem !important;
          }
          
          .thumbnail {
            height: 60px !important;
          }
          
          .main-image {
            height: 300px !important;
          }
          
          .tab-buttons {
            flex-direction: column !important;
            gap: 0.5rem !important;
          }
          
          .tab-button {
            width: 100% !important;
            padding: 0.75rem !important;
            text-align: center !important;
          }
          
          .add-to-cart-button {
            width: 100% !important;
            padding: 1rem !important;
            font-size: 1rem !important;
          }
          
          .review-form {
            padding: 1rem !important;
          }
          
          .review-card {
            padding: 1rem !important;
          }
        }
      `}</style>
      </div>
    </>
  );
};

export default ProductDetails;
