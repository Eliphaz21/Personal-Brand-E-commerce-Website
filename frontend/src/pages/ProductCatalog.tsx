import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import apiClient from '../services/apiClient';
import type { Product } from '../types';
import { Star, Search, SlidersHorizontal, ArrowUpDown, ShoppingCart, CheckCircle, HelpCircle, ChevronDown } from 'lucide-react';

const normalizeSortParam = (value: string | null): string => {
  const legacyMap: Record<string, string> = {
    '-createdAt': 'newest',
    price: 'price_asc',
    '-price': 'price_desc',
    '-rating': 'top_rated',
  };
  const allowed = new Set(['newest', 'price_asc', 'price_desc', 'top_rated', 'best_selling']);
  if (!value) return 'newest';
  if (legacyMap[value]) return legacyMap[value];
  return allowed.has(value) ? value : 'newest';
};

export const ProductCatalog: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [productType, setProductType] = useState(searchParams.get('productType') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
  const [sort, setSort] = useState(() => normalizeSortParam(searchParams.get('sort')));

  // UI state
  const [addingId, setAddingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<{ [key: string]: boolean }>({});
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);

  // Constants
  const defaultCategories = [
    'Fertility Supplements',
    'Hormone Balance',
    'PCOS',
    'Prenatal',
    'Male Fertility',
    'Egg Quality',
    'Coaching Services',
    'Wellness & Lifestyle',
    'Books & Community'
  ];

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiClient.get('/products/categories');
        const fetchedCats = res.data?.categories || res.data?.data?.categories || [];
        setCategories(fetchedCats.length > 0 ? fetchedCats : defaultCategories);
      } catch (err) {
        console.error('Failed to fetch categories, using default array', err);
        setCategories(defaultCategories);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products based on filter parameter updates
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (search) params.search = search;
        if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
        if (productType && productType !== 'all') params.productType = productType;
        if (minPrice) params.minPrice = Number(minPrice);
        if (maxPrice) params.maxPrice = Number(maxPrice);
        if (inStock) params.inStock = true;
        if (sort) params.sort = sort;

        const res = await apiClient.get('/products', { params });
        const fetchedProds = res.data?.products || res.data?.data?.products || res.data?.data || [];
        setProducts(fetchedProds);
      } catch (err) {
        console.error('Failed to get products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();

    // Sync React states back to URL search params
    const nextParams: any = {};
    if (search) nextParams.search = search;
    if (selectedCategory && selectedCategory !== 'All') nextParams.category = selectedCategory;
    if (productType && productType !== 'all') nextParams.productType = productType;
    if (minPrice) nextParams.minPrice = minPrice;
    if (maxPrice) nextParams.maxPrice = maxPrice;
    if (inStock) nextParams.inStock = 'true';
    if (sort) nextParams.sort = sort;
    setSearchParams(nextParams);

  }, [search, selectedCategory, productType, minPrice, maxPrice, inStock, sort]);

  const handleAddToCart = async (product: Product) => {
    if (product.productType === 'affiliate' && product.affiliateUrl) {
      window.open(product.affiliateUrl, '_blank');
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/shop' } });
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

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setProductType('all');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    setSort('newest');
  };

  return (
    <div className="catalog-page container" style={{ padding: '3rem 1rem 3rem 0', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem' }}>E-Commerce Catalog</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Science-backed natural protocols, coaching plans, and ebooks for maternal strength.</p>
      </div>

      {/* Top Filter Bar */}
      <div style={topBarContainerStyle}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <span style={searchIconStyle}><Search size={18} /></span>
          <input
            type="text"
            placeholder="Search products or supplements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.75rem' }}
          />
        </div>

        {/* Action controls */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: 'max-content', flexWrap: 'wrap' }}>
          {/* Sorting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '180px' }}>
            <span style={{ color: 'var(--color-text-muted)', display: 'flex' }}><ArrowUpDown size={16} /></span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="form-input"
              style={{ padding: '0.75rem 1rem' }}
            >
              <option value="newest">Newest Additions</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="top_rated">Customer Ratings</option>
            </select>
          </div>

          {/* Toggle Filter Button on Mobile */}
          <button
            className="btn btn-outline filter-toggle-btn"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Main Page Grid */}
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>

        {/* LEFT COLUMN: Sidebar Filters */}
        <aside className={`catalog-sidebar ${showFiltersMobile ? 'show' : ''}`} style={sidebarContainerStyle}>
          {/* Category Filter */}
          <div style={filterSectionStyle}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
              onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
            >
              <h4 style={{ ...filterTitleStyle, margin: 0 }}>Category</h4>
              <ChevronDown
                size={18}
                color="var(--color-primary-dark)"
                style={{
                  transition: 'transform 0.3s ease',
                  transform: isCategoryExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
                }}
              />
            </div>
            {isCategoryExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => setSelectedCategory('All')}
                  style={{
                    ...categoryFilterLinkStyle,
                    fontWeight: selectedCategory === 'All' ? 'bold' : 'normal',
                    color: selectedCategory === 'All' ? 'var(--color-primary)' : 'var(--color-text-main)',
                    backgroundColor: selectedCategory === 'All' ? 'var(--color-primary-light)' : 'transparent'
                  }}
                >
                  View All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      ...categoryFilterLinkStyle,
                      fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                      color: selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-text-main)',
                      backgroundColor: selectedCategory === cat ? 'var(--color-primary-light)' : 'transparent'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Type Filter */}
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Product Type</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['all', 'physical', 'service', 'affiliate'].map((type) => (
                <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.9rem' }}>
                  <input
                    type="radio"
                    name="productType"
                    checked={productType === type}
                    onChange={() => setProductType(type)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  {type === 'all' ? 'All Types' : type === 'affiliate' ? 'E-Books & Links' : type}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div style={filterSectionStyle}>
            <h4 style={filterTitleStyle}>Price Range ($)</h4>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="form-input"
                style={{ padding: '0.5rem', textAlign: 'center' }}
              />
              <span style={{ color: 'var(--color-text-muted)' }}>to</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="form-input"
                style={{ padding: '0.5rem', textAlign: 'center' }}
              />
            </div>
          </div>

          {/* Stock Filter */}
          <div style={filterSectionStyle}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' }}>
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
              />
              In Stock Only
            </label>
          </div>

          {/* Clear Filters Button */}
          <button
            onClick={handleClearFilters}
            className="btn btn-outline"
            style={{ width: '100%', padding: '0.625rem', fontSize: '0.85rem' }}
          >
            Clear All Filters
          </button>
        </aside>

        {/* RIGHT COLUMN: Product Grid */}
        <main style={{ flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 0' }}>
              <div className="spinner" style={spinnerStyle} />
            </div>
          ) : products.length === 0 ? (
            <div style={emptyContainerStyle}>
              <HelpCircle size={48} color="var(--color-primary)" style={{ opacity: 0.6, marginBottom: '1rem' }} />
              <h3>No Products Found</h3>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                We couldn't find matches matching those filter constraints. Try expanding your parameters.
              </p>
              <button
                onClick={handleClearFilters}
                className="btn btn-primary"
                style={{ marginTop: '1.5rem' }}
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Showing {products.length} products & services
              </p>

              <div className="grid-3">
                {products.map((product) => {
                  const hasDiscount = product.compareAtPrice > product.price;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <div
                      key={product._id}
                      className="product-card glass-panel"
                      style={productCardStyle}
                    >
                      {/* Badge */}
                      {hasDiscount && (
                        <span style={discountBadgeStyle}>Sale</span>
                      )}
                      {isOutOfStock && (
                        <span style={outOfStockBadgeStyle}>Out of Stock</span>
                      )}

                      {/* Image */}
                      <Link
                        to={`/product/${product.slug}`}
                        style={{ display: 'block', height: '220px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}
                      >
                        <img
                          src={product.images[0]?.url || 'https://via.placeholder.com/300'}
                          alt={product.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                          className="product-img"
                        />
                      </Link>

                      {/* Product Content */}
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          {product.category}
                        </span>

                        <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                          <h3 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '0.5rem', height: '2.4em', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                            {product.title}
                          </h3>
                        </Link>

                        {/* Rating */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
                          <Star size={14} color="#ffd700" fill="#ffd700" />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{product.rating}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>({product.numReviews})</span>
                        </div>

                        {/* Pricing & Add to cart */}
                        <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                              ${product.price.toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <span style={{ fontSize: '0.85rem', textDecoration: 'line-through', color: 'var(--color-text-muted)', marginLeft: '0.5rem' }}>
                                ${product.compareAtPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleAddToCart(product)}
                            disabled={addingId === product._id || (isOutOfStock && product.productType !== 'affiliate')}
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
                              cursor: (isOutOfStock && product.productType !== 'affiliate') ? 'not-allowed' : 'pointer',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                              transition: 'all 0.3s ease'
                            }}
                            title={isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
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
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        /* Responsive styling */
        .filter-toggle-btn {
          display: none !important;
        }

        @media (max-width: 992px) {
          .filter-toggle-btn {
            display: flex !important;
          }
          .catalog-sidebar {
            display: none !important;
            position: fixed;
            top: 80px;
            left: 0;
            bottom: 0;
            width: 280px;
            background: #fff;
            z-index: 900;
            box-shadow: var(--shadow-lg);
            padding: 2rem;
            overflow-y: auto;
          }
          .catalog-sidebar.show {
            display: block !important;
          }
        }
        
        .product-card {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .product-card:hover {
          transform: translateY(-5px);
        }
        .product-card:hover .product-img {
          transform: scale(1.05);
        }

        /* Enhanced Mobile Responsiveness */
        @media (max-width: 768px) {
          .catalog-page {
            padding: 1rem 0.5rem 3rem 0 !important;
          }
          
          .filter-toggle-btn {
            padding: 0.5rem 1rem !important;
            font-size: 0.85rem !important;
          }
          
          .catalog-sidebar {
            width: 100% !important;
            max-width: 320px !important;
          }
          
          .product-card {
            padding: 1rem !important;
          }
          
          .product-img {
            height: 200px !important;
          }
        }

        @media (max-width: 480px) {
          .catalog-page {
            padding: 1rem 0 3rem 0 !important;
          }
          
          .top-bar-container {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 1rem !important;
          }
          
          .search-input {
            width: 100% !important;
          }
          
          .sort-select {
            width: 100% !important;
          }
          
          .product-grid {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          
          .product-card {
            padding: 0.75rem !important;
          }
          
          .product-img {
            height: 180px !important;
          }
          
          .product-title {
            font-size: 0.9rem !important;
          }
          
          .product-price {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
};

/* Styles definitions */
const topBarContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  flexWrap: 'wrap',
  padding: '1.5rem',
  background: 'rgba(255, 255, 255, 0.6)',
  backdropFilter: 'var(--glass-backdrop)',
  border: '1px solid var(--color-border)',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-sm)'
};

const searchIconStyle: React.CSSProperties = {
  position: 'absolute',
  left: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--color-text-muted)',
  opacity: 0.6,
  display: 'flex'
};

const sidebarContainerStyle: React.CSSProperties = {
  width: '260px',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  paddingRight: '1rem'
};

const filterSectionStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--color-border)',
  paddingBottom: '1.5rem'
};

const filterTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  color: 'var(--color-primary-dark)',
  fontSize: '1rem',
  fontWeight: 600,
  marginBottom: '1rem'
};

const categoryFilterLinkStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  border: 'none',
  fontSize: '0.875rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease'
};

const productCardStyle: React.CSSProperties = {
  padding: '1.25rem',
  background: '#fff',
  border: '1px solid var(--color-border)',
  borderRadius: '16px',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  height: '100%'
};

const discountBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '15px',
  left: '15px',
  backgroundColor: 'var(--color-secondary)',
  color: '#fff',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  zIndex: 2
};

const outOfStockBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: '15px',
  left: '15px',
  backgroundColor: 'var(--color-text-muted)',
  color: '#fff',
  fontSize: '0.7rem',
  fontWeight: 'bold',
  padding: '0.25rem 0.5rem',
  borderRadius: '4px',
  zIndex: 2
};

const emptyContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: '4rem 2rem',
  background: 'rgba(255,255,255,0.4)',
  border: '1px dashed var(--color-border)',
  borderRadius: '16px'
};

const spinnerStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  border: '4px solid var(--color-primary-light)',
  borderTop: '4px solid var(--color-primary)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

export default ProductCatalog;
