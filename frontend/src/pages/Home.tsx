import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import apiClient from '../services/apiClient';
import type { Product } from '../types';
import { Star, ArrowRight, Heart, Sparkles, ShoppingCart, CheckCircle, Award } from 'lucide-react';

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await apiClient.get('/products', {
          params: { isFeatured: true, limit: 4 }
        });
        const fetchedData = res.data?.products || res.data?.data?.products || res.data?.data || [];
        setProducts(fetchedData);
      } catch (err) {
        console.error('Failed to load featured products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      // Redirect to login
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    setAddingId(product._id);
    try {
      await addToCart(product._id, 1);
      setSuccessMsg(prev => ({ ...prev, [product._id]: true }));
      setTimeout(() => {
        setSuccessMsg(prev => ({ ...prev, [product._id]: false }));
      }, 2500);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingId(null);
    }
  };

  const categories = [
    { name: 'Hormone Balance', desc: 'Regulate your cycle and ease symptoms.', bg: 'linear-gradient(135deg, #e3ece3 0%, #cce0cc 100%)' },
    { name: 'Fertility Supplements', desc: 'Optimize egg quality and prepare for pregnancy.', bg: 'linear-gradient(135deg, #fbf7f0 0%, #eedfc6 100%)' },
    { name: 'PCOS', desc: 'Target insulin resistance and control breakouts.', bg: 'linear-gradient(135deg, #f7eeee 0%, #e8d0d0 100%)' },
    { name: 'Coaching Services', desc: 'Private consultation and tailored action plans.', bg: 'linear-gradient(135deg, #edf3f7 0%, #d0e1ec 100%)' }
  ];



  return (
    <div className="home-page">
      {/* ─── Hero Section with 3D Float Elements ──────────────────────────────── */}
      <section style={heroSectionStyle}>
        {/* Floating background decorations */}
        <div className="bg-float leaf-1" style={{ ...leafFloatStyle, top: '15%', left: '8%', animationDelay: '0s' }} />
        <div className="bg-float leaf-2" style={{ ...leafFloatStyle, bottom: '20%', left: '5%', animationDelay: '2s' }} />
        <div className="bg-float gold-star-1" style={{ ...starFloatStyle, top: '25%', right: '10%', animationDelay: '1s' }} />
        <div className="bg-float gold-star-2" style={{ ...starFloatStyle, bottom: '15%', right: '35%', animationDelay: '3s' }} />

        <div className="container grid-2" style={{ alignItems: 'center', minHeight: '550px' }}>
          {/* Left Hero Text */}
          <div className="animate-fade-in-left">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-primary-light)', padding: '0.5rem 1rem', borderRadius: '999px', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
              <Sparkles size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary-dark)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Your Fertility Companion
              </span>
            </div>
            <h1 style={{ fontSize: '3.5rem', color: 'var(--color-primary-dark)', marginBottom: '1.5rem', lineHeight: '1.15' }}>
              Empowering Your <span style={{ color: 'var(--color-secondary)' }}>Fertility</span> & Wellness Journey
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--color-text-muted)', marginBottom: '2.5rem', maxWidth: '520px' }}>
              Premium supplements, science-backed PCOS support, and expert coaching tailored by Kidist to heal your hormones from the root.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn btn-primary">
                Shop Supplements <ArrowRight size={16} />
              </Link>
              <Link to="/shop?category=Coaching Services" className="btn btn-glass" style={{ border: '1px solid var(--color-primary)' }}>
                Book Consultation
              </Link>
            </div>
          </div>

          {/* Right Hero Image Area (3D Floating Glass Panel) */}
          <div className="animate-fade-in-right" style={{ display: 'flex', justifyContent: 'center', perspective: '1200px' }}>
            <div className="hero-3d-card" style={hero3DCardStyle}>
              {/* Glass reflection shine */}
              <div className="shine-line" style={shineLineStyle} />
              
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <Heart size={32} color="var(--color-secondary)" fill="var(--color-secondary)" />
                  <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(255,255,255,0.7)', padding: '0.35rem 0.75rem', borderRadius: '999px', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.5)' }}>
                    Coach Kidist
                  </span>
                </div>
                <h3 style={{ color: 'var(--color-primary-dark)', fontSize: '1.8rem', marginBottom: '1rem' }}>Root-Cause Hormone Support</h3>
                <p style={{ color: 'var(--color-text-main)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                  Unlocking chemical balance, ovarian strength, and nutritional guidance. Designed for premium outcome.
                </p>
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>100% Naturopathic</h5>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Lab tested & certified protocols</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bio / Coach Authority Section ─────────────────────────────────── */}
      <section style={{ padding: '6rem 0', backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container grid-2" style={{ alignItems: 'center' }}>
          {/* Bio Illustration / Mockup */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '440px',
              height: '480px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              backgroundColor: 'var(--color-primary-light)'
            }}>
              <img 
                src="https://p16-common-sign.tiktokcdn.com/tos-maliva-avt-0068/f4e9cd42f22ac626004332a37464cd61~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=14579&refresh_token=f9732c81&x-expires=1781877600&x-signature=xJaVAb3gcwuah5wMcK7vRZ%2F9%2BO4%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=my" 
                alt="Kidist - Fertility Coach" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="glass-panel" style={{
                position: 'absolute',
                bottom: '24px',
                left: '24px',
                right: '24px',
                padding: '1.25rem',
                border: '1px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.85)'
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Award size={36} color="var(--color-secondary)" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Certified Practitioner</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Fertility coaching & Hormone balance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Narrative */}
          <div>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meet the Founder</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Hi, I’m Kidist Moges.
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
              I created KidEnDu after watching countless women walk through hormone imbalances, PCOS symptoms, and fertility struggles feeling isolated and confused.
            </p>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', fontSize: '1.05rem' }}>
              Our methodology blends scientific nutraceuticals with lifestyle modifications, analyzing your hormone maps to bring your body back into alignment. I invite you to take charge of your wellness, balance your chemistry, and welcome your future child.
            </p>
            <div className="grid-3" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
              <div>
                <h3 style={{ color: 'var(--color-secondary)', fontSize: '2rem', margin: 0 }}>100+</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>Clients Empowered</p>
              </div>
              <div>
                <h3 style={{ color: 'var(--color-secondary)', fontSize: '2rem', margin: 0 }}>98%</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>Hormone Success Rate</p>
              </div>
              <div>
                <h3 style={{ color: 'var(--color-secondary)', fontSize: '2rem', margin: 0 }}>10+</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>Years Experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Featured Categories (3D Tilt Look) ─────────────────────────────── */}
      <section style={{ padding: '6rem 0', backgroundColor: 'var(--color-bg-main)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Targeted Care</span>
            <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)' }}>Explore Core Support Areas</h2>
          </div>

          <div className="grid-4">
            {categories.map((cat, i) => (
              <Link 
                key={i} 
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="category-card"
                style={{
                  ...categoryCardStyle,
                  background: cat.bg
                }}
              >
                <div style={{ zIndex: 2, position: 'relative' }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--color-primary-dark)' }}>{cat.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>{cat.desc}</p>
                </div>
                <div className="card-arrow" style={cardArrowStyle}>
                  <ArrowRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ─────────────────────────────────────────────── */}
      <section style={{ padding: '6rem 0', backgroundColor: '#fff', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Wellness Shop</span>
              <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginTop: '0.25rem' }}>Featured Coach Formulas</h2>
            </div>
            <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
              View All Products <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
              <div className="spinner" style={spinnerStyle} />
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--color-bg-main)', borderRadius: '12px' }}>
              <Sparkles size={48} color="var(--color-primary-light)" style={{ marginBottom: '1.5rem', margin: '0 auto 1.5rem' }} />
              <h3 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>No Products Available Yet</h3>
              <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                We're curating the perfect products for you. Check back soon as Coach Kidist adds new formulas and services!
              </p>
              <Link to="/shop" className="btn btn-primary">
                Browse Full Catalog <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid-4">
              {products.map((product) => (
                <div 
                  key={product._id} 
                  className="product-card-3d glass-panel" 
                  style={productCard3DStyle}
                >
                  {/* Badge */}
                  {product.compareAtPrice > product.price && (
                    <span style={discountBadgeStyle}>Sale</span>
                  )}

                  {/* Product Image */}
                  <Link to={`/product/${product.slug}`} style={{ display: 'block', height: '220px', overflow: 'hidden', borderRadius: '12px', marginBottom: '1.25rem' }}>
                    <img 
                      src={product.images[0]?.url || 'https://via.placeholder.com/300'} 
                      alt={product.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                      className="product-img"
                    />
                  </Link>

                  {/* Product Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {product.category}
                    </span>
                    <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem', height: '2.4em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.title}
                      </h4>
                    </Link>

                    {/* Ratings */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.75rem' }}>
                      <Star size={14} color="#ffd700" fill="#ffd700" />
                      <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{product.rating}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>({product.numReviews} reviews)</span>
                    </div>

                    {/* Pricing & Cart Action */}
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                          ${product.price.toFixed(2)}
                        </span>
                        {product.compareAtPrice > product.price && (
                          <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={addingId === product._id || product.stock === 0}
                        style={{
                          background: successMsg[product._id] ? 'var(--color-success)' : 'var(--color-primary)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '38px',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease'
                        }}
                        title={product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      >
                        {successMsg[product._id] ? (
                          <CheckCircle size={18} />
                        ) : addingId === product._id ? (
                          <div style={{ ...spinnerStyle, width: '16px', height: '16px', borderWidth: '2px' }} />
                        ) : (
                          <ShoppingCart size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>



      {/* ─── Newsletter Call to Action ──────────────────────────────────────── */}
      <section style={ctaSectionStyle}>
        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '640px' }}>
          <Sparkles size={32} color="var(--color-secondary)" style={{ marginBottom: '1.5rem', animation: 'float 3s ease-in-out infinite' }} />
          <h2 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>Get Your Custom Hormone Blueprint</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem' }}>
            Subscribe to Coach Kidist's weekly wellness digests containing egg quality diets, fertility recipes, and discount codes.
          </p>
          <form 
            onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing! Check your inbox soon for your fertility guide.'); }}
            style={{ display: 'flex', gap: '0.5rem', width: '100%', flexWrap: 'wrap' }}
          >
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
              className="form-input"
              style={{ flex: 1, minWidth: '240px' }}
            />
            <button type="submit" className="btn btn-primary">
              Subscribe Now
            </button>
          </form>
        </div>
      </section>

      {/* CSS Styles for 3D interactions and animations */}
      <style>{`
        /* Floating animations */
        .gold-star-1 {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-secondary);
          box-shadow: 0 0 10px var(--color-secondary-light);
        }
        .gold-star-2 {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--color-secondary-dark);
          box-shadow: 0 0 15px var(--color-secondary-light);
        }
        .leaf-1 {
          width: 40px;
          height: 40px;
          background: rgba(120, 150, 120, 0.1);
          border-radius: 0 70% 0 70%;
          transform: rotate(45deg);
        }
        .leaf-2 {
          width: 60px;
          height: 60px;
          background: rgba(120, 150, 120, 0.08);
          border-radius: 0 70% 0 70%;
          transform: rotate(-15deg);
        }

        /* 3D card tilt & parallax card styles */
        .hero-3d-card {
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          animation: heroFloat 8s ease-in-out infinite;
        }
        .hero-3d-card:hover {
          transform: rotateY(10deg) rotateX(5deg) translateZ(10px);
        }
        
        .category-card {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .category-card:hover {
          transform: translateY(-8px) scale(1.03);
          box-shadow: var(--shadow-lg);
        }
        .category-card:hover .card-arrow {
          transform: translateX(5px);
          background-color: var(--color-primary);
          color: white;
        }

        .product-card-3d {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .product-card-3d:hover {
          transform: translateY(-8px) !important;
          box-shadow: var(--shadow-lg);
        }
        .product-card-3d:hover .product-img {
          transform: scale(1.08);
        }

        .testimonial-card {
          transition: transform 0.4s ease, box-shadow 0.4s ease;
        }
        .testimonial-card:hover {
          transform: scale(1.02);
          box-shadow: var(--shadow-md);
        }

        @keyframes heroFloat {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }

        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </div>
  );
};

/* Styles definitions */
const heroSectionStyle: React.CSSProperties = {
  position: 'relative',
  padding: '7rem 0 5rem 0',
  background: 'linear-gradient(180deg, rgba(227, 236, 227, 0.6) 0%, rgba(247, 246, 242, 0.2) 100%)',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid var(--color-border)'
};

const leafFloatStyle: React.CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  animation: 'float 6s ease-in-out infinite'
};

const starFloatStyle: React.CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  animation: 'float 4s ease-in-out infinite'
};

const hero3DCardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  padding: '3rem 2.5rem',
  background: 'rgba(255, 255, 255, 0.55)',
  backdropFilter: 'blur(15px)',
  WebkitBackdropFilter: 'blur(15px)',
  border: '1px solid rgba(255,255,255,0.6)',
  borderRadius: '24px',
  boxShadow: 'var(--shadow-glass)',
  position: 'relative',
  overflow: 'hidden'
};

const shineLineStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  width: '50px',
  height: '100%',
  background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
  transform: 'skewX(-25deg)',
  animation: 'shine 4s ease-in-out infinite',
  pointerEvents: 'none',
  opacity: 0.5
};

const categoryCardStyle: React.CSSProperties = {
  padding: '2.5rem 2rem',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '220px',
  boxShadow: 'var(--shadow-sm)',
  textDecoration: 'none'
};

const cardArrowStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  color: 'var(--color-primary)',
  transition: 'all 0.3s ease',
  alignSelf: 'flex-end',
  marginTop: '1.5rem'
};

const productCard3DStyle: React.CSSProperties = {
  padding: '1.25rem',
  background: 'rgba(255, 255, 255, 0.7)',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  height: '100%'
};

const discountBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  backgroundColor: 'var(--color-secondary)',
  color: '#fff',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  padding: '0.25rem 0.6rem',
  borderRadius: '4px',
  zIndex: 3
};

const ctaSectionStyle: React.CSSProperties = {
  padding: '7rem 0',
  background: 'linear-gradient(180deg, rgba(247, 246, 242, 0.2) 0%, rgba(227, 236, 227, 0.5) 100%)',
  borderTop: '1px solid var(--color-border)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative'
};

const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '4px solid var(--color-primary-light)',
  borderTop: '4px solid var(--color-primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

export default Home;
