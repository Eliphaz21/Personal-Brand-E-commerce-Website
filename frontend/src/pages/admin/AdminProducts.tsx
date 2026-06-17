import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import type { Product } from '../../types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader, 
  X, 
  Upload, 
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Link2,
  ImagePlus
} from 'lucide-react';

const STATIC_CATEGORIES = [
  'Fertility Supplements',
  'Hormone Balance',
  'PCOS',
  'Prenatal',
  'Male Fertility',
  'Egg Quality',
  'Hair Care',
  'Skin & Face',
  'Super Foods',
  "Kids' Books",
  'Kitchen Gadgets',
  'Women\'s Supplements',
  'Coaching Services',
  'Books & Community',
  'Wellness & Lifestyle'
];

interface ProductForm {
  title: string;
  sku: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number;
  stock: number;
  category: string;
  productType: 'physical' | 'service' | 'affiliate';
  affiliateUrl: string;
  weight: number;
  tags: string;
  isFeatured: boolean;
  isActive: boolean;
}

const initialFormState: ProductForm = {
  title: '',
  sku: '',
  description: '',
  shortDescription: '',
  price: 0,
  compareAtPrice: 0,
  stock: 0,
  category: 'Fertility Supplements',
  productType: 'physical',
  affiliateUrl: '',
  weight: 0,
  tags: '',
  isFeatured: false,
  isActive: true
};

const isValidImageUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(STATIC_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Table options
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 8;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(initialFormState);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [existingImages, setExistingImages] = useState<{ url: string; publicId: string }[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        sort: 'newest',
      };
      if (search.trim()) params.search = search.trim();
      if (categoryFilter) params.category = categoryFilter;

      const res = await apiClient.get('/products', { params });
      const data = res.data?.data || res.data;

      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotalCount(data.total || 0);
    } catch (err: any) {
      console.error('Error fetching admin products:', err);
      setProducts([]);
      setError(
        err.response?.data?.message ||
        'Could not retrieve product listing. Please reload page.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/products/categories');
      const cats = res.data?.data || res.data?.categories;
      if (cats && Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      }
    } catch (err) {
      console.error('Error fetching categories, using static list', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setPage(1);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(initialFormState);
    setSelectedFiles(null);
    setImageUrls([]);
    setImageUrlInput('');
    setExistingImages([]);
    setImagesToDelete([]);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setForm({
      title: prod.title,
      sku: prod.sku || '',
      description: prod.description,
      shortDescription: prod.shortDescription || '',
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || 0,
      stock: prod.stock,
      category: prod.category,
      productType: prod.productType || 'physical',
      affiliateUrl: prod.affiliateUrl || '',
      weight: prod.weight || 0,
      tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : '',
      isFeatured: prod.isFeatured || false,
      isActive: prod.isActive !== undefined ? prod.isActive : true
    });
    setSelectedFiles(null);
    setImageUrls([]);
    setImageUrlInput('');
    setExistingImages(prod.images || []);
    setImagesToDelete([]);
    setModalError('');
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you absolutely sure you want to permanently delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      await apiClient.delete(`/products/${id}`);
      setSuccessMsg('Product deleted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProducts();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete the product.');
    }
  };

  const handleAddImageUrl = () => {
    const trimmed = imageUrlInput.trim();
    if (!trimmed) {
      setModalError('Please enter an image URL.');
      return;
    }
    if (!isValidImageUrl(trimmed)) {
      setModalError('Please enter a valid http or https image URL.');
      return;
    }
    if (imageUrls.includes(trimmed)) {
      setModalError('This image URL is already added.');
      return;
    }
    setImageUrls((prev) => [...prev, trimmed]);
    setImageUrlInput('');
    setModalError('');
  };

  const handleRemoveImageUrl = (url: string) => {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(prev => ({ ...prev, [name]: checked }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    // Form validation
    if (!form.title.trim()) {
      setModalError('Product title is required.');
      setSubmitting(false);
      return;
    }
    if (!form.description.trim()) {
      setModalError('Description is required.');
      setSubmitting(false);
      return;
    }
    if (form.price < 0 || form.stock < 0) {
      setModalError('Price and stock cannot be negative.');
      setSubmitting(false);
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('sku', form.sku.trim());
    formData.append('description', form.description.trim());
    formData.append('shortDescription', form.shortDescription.trim());
    formData.append('price', form.price.toString());
    formData.append('compareAtPrice', form.compareAtPrice.toString());
    formData.append('stock', form.stock.toString());
    formData.append('category', form.category);
    formData.append('productType', form.productType);
    formData.append('affiliateUrl', form.affiliateUrl.trim());
    formData.append('weight', form.weight.toString());
    formData.append('isFeatured', form.isFeatured ? 'true' : 'false');
    formData.append('isActive', form.isActive ? 'true' : 'false');

    // Parse and attach tags
    const tagsArr = form.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    formData.append('tags', JSON.stringify(tagsArr));

    // Attach new images files
    if (selectedFiles && selectedFiles.length > 0) {
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('images', selectedFiles[i]);
      }
    }

    if (imageUrls.length > 0) {
      formData.append('imageUrls', JSON.stringify(imageUrls));
    }

    const remainingExisting = existingImages.filter(
      (img) => !imagesToDelete.includes(img.publicId)
    ).length;
    const newImageCount =
      (selectedFiles?.length || 0) + imageUrls.length;

    try {
      if (editingProduct) {
        if (remainingExisting + newImageCount === 0) {
          setModalError('Product must have at least one image.');
          setSubmitting(false);
          return;
        }

        // Handle images to delete
        if (imagesToDelete.length > 0) {
          formData.append('deleteImages', JSON.stringify(imagesToDelete));
        }

        // Put request
        await apiClient.put(`/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccessMsg('Product updated successfully!');
      } else {
        // At least one image required for creation (file or URL)
        if (newImageCount === 0) {
          setModalError('Please upload at least one product image or add an image URL.');
          setSubmitting(false);
          return;
        }

        // Post request
        await apiClient.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccessMsg('Product added successfully!');
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setModalError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to save product details. Please check form constraints.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleImageDelete = (publicId: string) => {
    if (imagesToDelete.includes(publicId)) {
      setImagesToDelete(prev => prev.filter(id => id !== publicId));
    } else {
      // Ensure we don't delete everything
      const remainingCount = existingImages.length - imagesToDelete.length;
      if (remainingCount <= 1 && (!selectedFiles || selectedFiles.length === 0) && imageUrls.length === 0) {
        alert('A product must maintain at least one active image.');
        return;
      }
      setImagesToDelete(prev => [...prev, publicId]);
    }
  };

  return (
    <div className="admin-products" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header and Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
            Manage Products
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Add, update, or remove store supplements and digital services.
          </p>
        </div>

        <button 
          onClick={openAddModal} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '999px', fontSize: '0.9rem', fontWeight: 600 }}
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      {successMsg && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(39, 174, 96, 0.06)',
          border: '1px solid rgba(39, 174, 96, 0.2)',
          color: 'var(--color-success)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <CheckCircle size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          backgroundColor: 'rgba(235, 87, 87, 0.06)',
          border: '1px solid rgba(235, 87, 87, 0.2)',
          color: 'var(--color-error)',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{
        padding: '1.25rem',
        borderRadius: '16px',
        border: '1px solid var(--color-border)',
        background: 'rgba(255, 255, 255, 0.65)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '280px', maxWidth: '450px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Search products by title, SKU, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 1rem 0.625rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <button type="submit" className="btn btn-outline" style={{ fontSize: '0.9rem', padding: '0.625rem 1.25rem' }}>
            Find
          </button>
        </form>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: '#fff',
                fontSize: '0.9rem',
                minWidth: '180px'
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {(search || categoryFilter) && (
            <button 
              onClick={handleResetFilters} 
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem',
                textDecoration: 'underline'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Products Table Card */}
      <div className="glass-panel" style={{
        borderRadius: '20px',
        border: '1px solid var(--color-border)',
        background: 'rgba(255, 255, 255, 0.7)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem' }}>
            <Loader size={36} className="spin-animation" style={{ color: 'var(--color-primary)' }} />
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Refreshing products table...</p>
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No products found matching filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'rgba(74, 117, 89, 0.04)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Image</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Name / SKU</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Category</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Price</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Stock</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem' }}>Status</th>
                  <th style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr 
                    key={prod._id} 
                    style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'transparent', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.4)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <img 
                        src={prod.images?.[0]?.url || 'https://via.placeholder.com/60?text=No+Image'} 
                        alt={prod.title} 
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                      />
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>
                          {prod.title}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          SKU: {prod.sku || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                      {prod.category}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.95rem', fontWeight: 600 }}>
                      ${prod.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: prod.stock <= 5 ? 'var(--color-error)' : 'var(--color-text-main)'
                      }}>
                        {prod.stock}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.625rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: prod.isActive ? 'rgba(39, 174, 96, 0.1)' : 'rgba(120, 120, 120, 0.15)',
                        color: prod.isActive ? 'var(--color-success)' : 'var(--color-text-muted)'
                      }}>
                        {prod.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => openEditModal(prod)} 
                          style={{
                            border: 'none',
                            background: 'none',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: 'var(--color-primary)',
                            borderRadius: '6px'
                          }}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(prod._id)} 
                          style={{
                            border: 'none',
                            background: 'none',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            color: 'var(--color-error)',
                            borderRadius: '6px'
                          }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)'
          }}>
            <span>Showing {products.length} of {totalCount} items</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setPage(prev => Math.max(prev - 1, 1))} 
                disabled={page === 1}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center' }}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button 
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={page === totalPages}
                className="btn btn-outline"
                style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center' }}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL OVERLAY */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem 1rem'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            backgroundColor: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem 2rem',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'rgba(74, 117, 89, 0.02)'
            }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--color-primary-dark)', margin: 0 }}>
                {editingProduct ? 'Edit Product Details' : 'Create New Product'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '60vh' }}>
                
                {modalError && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(235, 87, 87, 0.06)',
                    border: '1px solid rgba(235, 87, 87, 0.2)',
                    color: 'var(--color-error)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={16} />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Grid 2 Column fields */}
                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Product Name *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={form.title}
                      onChange={handleFormChange}
                      className="form-input"
                      placeholder="e.g. PCOS Support Plus"
                    />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">SKU / Code</label>
                    <input
                      type="text"
                      name="sku"
                      value={form.sku}
                      onChange={handleFormChange}
                      className="form-input"
                      placeholder="e.g. SUPP-PCOS-01"
                    />
                  </div>
                </div>

                <div className="grid-2" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Category *</label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      className="form-input"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Product Type *</label>
                    <select
                      name="productType"
                      value={form.productType}
                      onChange={handleFormChange}
                      className="form-input"
                    >
                      <option value="physical">Physical Supplement</option>
                      <option value="service">Digital Coaching Service</option>
                      <option value="affiliate">Affiliate / Recommended Item</option>
                    </select>
                  </div>
                </div>

                {form.productType === 'affiliate' && (
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Affiliate URL *</label>
                    <input
                      type="url"
                      name="affiliateUrl"
                      required={form.productType === 'affiliate'}
                      value={form.affiliateUrl}
                      onChange={handleFormChange}
                      className="form-input"
                      placeholder="https://amazon.com/... or partner link"
                    />
                  </div>
                )}

                {/* Description and Short Description */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Short Description</label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={form.shortDescription}
                    onChange={handleFormChange}
                    className="form-input"
                    placeholder="Brief 1-sentence sales pitch"
                    maxLength={300}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Full Description *</label>
                  <textarea
                    name="description"
                    required
                    value={form.description}
                    onChange={handleFormChange}
                    className="form-input"
                    placeholder="Detailed ingredients, features, and benefits..."
                    style={{ minHeight: '100px', resize: 'vertical' }}
                  />
                </div>

                {/* Price, Compare Price, Stock, Weight */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '1rem'
                }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="price"
                      required
                      min={0}
                      value={form.price}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Compare-at ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="compareAtPrice"
                      min={0}
                      value={form.compareAtPrice}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Stock Qty *</label>
                    <input
                      type="number"
                      name="stock"
                      required
                      min={0}
                      disabled={form.productType === 'service'}
                      value={form.productType === 'service' ? 9999 : form.stock}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Weight (g)</label>
                    <input
                      type="number"
                      name="weight"
                      min={0}
                      disabled={form.productType !== 'physical'}
                      value={form.productType !== 'physical' ? 0 : form.weight}
                      onChange={handleFormChange}
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Tags and Checkboxes */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={form.tags}
                    onChange={handleFormChange}
                    className="form-input"
                    placeholder="e.g. pcos, hormone, female health"
                  />
                </div>

                <div style={{ display: 'flex', gap: '2.5rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={form.isFeatured}
                      onChange={handleFormChange}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                    />
                    Featured Product
                  </label>
                  
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleFormChange}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
                    />
                    Active / Published
                  </label>
                </div>

                {/* File Upload / Image URL / Image Management */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem', marginTop: '0.25rem' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '0.75rem' }}>
                    Product Images *
                  </label>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {/* File upload */}
                    <div style={{
                      border: '2px dashed var(--color-border)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: 'rgba(0,0,0,0.01)',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}>
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => setSelectedFiles(e.target.files)}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                      <Upload size={22} style={{ color: 'var(--color-primary)', marginBottom: '0.35rem' }} />
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>Upload from your computer</p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        JPEG, PNG, WebP — max 5MB each, multiple allowed
                      </p>
                    </div>

                    {/* URL input */}
                    <div style={{
                      border: '1px solid var(--color-border)',
                      borderRadius: '12px',
                      padding: '1rem',
                      backgroundColor: 'rgba(74, 117, 89, 0.03)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                        <Link2 size={16} style={{ color: 'var(--color-primary)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Or add image from URL</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="url"
                          value={imageUrlInput}
                          onChange={(e) => setImageUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddImageUrl();
                            }
                          }}
                          placeholder="https://example.com/product-image.jpg"
                          className="form-input"
                          style={{ flex: 1, fontSize: '0.85rem' }}
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="btn btn-outline"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            whiteSpace: 'nowrap',
                            fontSize: '0.85rem',
                            padding: '0.5rem 0.85rem',
                          }}
                        >
                          <ImagePlus size={15} /> Add URL
                        </button>
                      </div>
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                        Paste a direct image link. It will be saved to our CDN for fast loading.
                      </p>
                    </div>
                  </div>

                  {selectedFiles && selectedFiles.length > 0 && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                      Files selected: {selectedFiles.length} ({Array.from(selectedFiles).map(f => f.name).join(', ')})
                    </div>
                  )}

                  {imageUrls.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                        Image URLs to import ({imageUrls.length})
                      </span>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {imageUrls.map((url) => (
                          <div
                            key={url}
                            style={{
                              width: '72px',
                              position: 'relative',
                            }}
                          >
                            <div
                              style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                border: '1px solid var(--color-border)',
                                background: '#f5f5f5',
                              }}
                            >
                              <img
                                src={url}
                                alt=""
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/72?text=URL';
                                }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImageUrl(url)}
                              title="Remove URL"
                              style={{
                                position: 'absolute',
                                top: '-6px',
                                right: '-6px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: 'none',
                                background: 'var(--color-error)',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                lineHeight: 1,
                              }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Images list (Only in Edit mode) */}
                  {editingProduct && existingImages.length > 0 && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                        Manage Existing Images (Select to delete)
                      </span>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {existingImages.map((img) => {
                          const isMarked = imagesToDelete.includes(img.publicId);
                          return (
                            <div 
                              key={img.publicId} 
                              onClick={() => toggleImageDelete(img.publicId)}
                              style={{
                                width: '64px',
                                height: '64px',
                                position: 'relative',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                border: isMarked ? '2.5px solid var(--color-error)' : '1px solid var(--color-border)',
                                filter: isMarked ? 'grayscale(80%) opacity(50%)' : 'none',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {isMarked && (
                                <div style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: 'rgba(235, 87, 87, 0.25)',
                                  color: '#fff',
                                  fontWeight: 800,
                                  fontSize: '0.7rem'
                                }}>
                                  DEL
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                padding: '1.25rem 2rem',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'rgba(74, 117, 89, 0.02)'
              }}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.9rem', padding: '0.625rem 1.25rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{
                    fontSize: '0.9rem',
                    padding: '0.625rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader size={16} className="spin-animation" /> Saving...
                    </>
                  ) : (
                    'Save Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
