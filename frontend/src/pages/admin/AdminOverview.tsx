import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  AlertTriangle, 
  DollarSign,
  Loader,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface DashboardStats {
  revenue: number;
  orders: number;
  users: number;
  products: number;
}

interface ChartDataPoint {
  month: string;
  revenue: number;
  orders: number;
}

interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  slug: string;
  images: { url: string; publicId: string; alt?: string }[];
}

export const AdminOverview: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setError('');
      const [statsRes, chartRes, stockRes] = await Promise.all([
        apiClient.get('/admin/analytics/overview'),
        apiClient.get('/admin/analytics/sales-chart'),
        apiClient.get('/admin/analytics/low-stock?threshold=10')
      ]);

      setStats(statsRes.data?.data || statsRes.data || null);
      setChartData(chartRes.data?.data?.chartData || chartRes.data?.chartData || []);
      setLowStock(stockRes.data?.data?.products || stockRes.data?.products || []);
    } catch (err: any) {
      console.error('Error fetching dashboard analytics:', err);
      setError('Failed to fetch dashboard metrics. Please try again.');
      
      // Fallback demo data if backend is empty or failing
      setStats({
        revenue: 12450.85,
        orders: 142,
        users: 84,
        products: 18
      });
      setChartData([
        { month: 'Jan 2026', revenue: 850, orders: 10 },
        { month: 'Feb 2026', revenue: 1200, orders: 15 },
        { month: 'Mar 2026', revenue: 2100, orders: 24 },
        { month: 'Apr 2026', revenue: 1800, orders: 20 },
        { month: 'May 2026', revenue: 3400, orders: 38 },
        { month: 'Jun 2026', revenue: 3100, orders: 35 }
      ]);
      setLowStock([
        {
          _id: 'prod-1',
          name: 'Premium PCOS Support Supplement',
          sku: 'SUPP-PCOS-01',
          stock: 4,
          price: 49.99,
          slug: 'premium-pcos-support-supplement',
          images: []
        },
        {
          _id: 'prod-2',
          name: 'Kidist\'s Male Fertility Boost Capsule',
          sku: 'SUPP-MALE-02',
          stock: 2,
          price: 59.99,
          slug: 'kidists-male-fertility-boost-capsule',
          images: []
        }
      ]);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboardData().finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <Loader size={40} className="spin-animation" style={{ color: 'var(--color-primary)' }} />
        <p style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>Loading administration dashboard overview...</p>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="admin-overview" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header with Title and Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary-dark)', margin: 0 }}>
            Dashboard Overview
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Real-time analytics, key metrics, and inventory alerts.
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn btn-outline"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            borderRadius: '999px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: '#fff',
            border: '1px solid var(--color-border)'
          }}
        >
          <RefreshCw size={16} className={refreshing ? 'spin-animation' : ''} />
          {refreshing ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

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
          <AlertTriangle size={20} />
          <span>{error} (Viewing offline demo mode)</span>
        </div>
      )}

      {/* Grid: Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Card 1: Revenue */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 255, 255, 0.65)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'default'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(74, 117, 89, 0.1)',
            color: 'var(--color-primary-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '0.25rem', display: 'block' }}>
              {stats ? formatCurrency(stats.revenue) : '$0.00'}
            </span>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 255, 255, 0.65)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'default'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(212, 163, 115, 0.1)',
            color: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Orders</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '0.25rem', display: 'block' }}>
              {stats ? stats.orders : 0}
            </span>
          </div>
        </div>

        {/* Card 3: Customers */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 255, 255, 0.65)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'default'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(42, 157, 143, 0.1)',
            color: '#2a9d8f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Customers</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '0.25rem', display: 'block' }}>
              {stats ? stats.users : 0}
            </span>
          </div>
        </div>

        {/* Card 4: Products */}
        <div className="glass-panel" style={{
          padding: '1.5rem',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 255, 255, 0.65)',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'default'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(231, 111, 81, 0.1)',
            color: '#e76f51',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Products</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginTop: '0.25rem', display: 'block' }}>
              {stats ? stats.products : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Charts & Low Stock Alerts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem'
      }}>
        {/* Sales Performance Area Chart */}
        <div className="glass-panel" style={{
          padding: '2rem',
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)', fontSize: '1.25rem', fontWeight: 700 }}>
              <TrendingUp size={20} /> Sales Performance
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
              Monthly Revenue (USD)
            </span>
          </div>
          
          <div style={{ width: '100%', height: 350 }}>
            {chartData.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                No sales volume recorded. Complete standard checkouts to view transaction graphs.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 500 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid var(--color-border)', 
                      borderRadius: '12px',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
                      fontFamily: 'inherit'
                    }}
                    formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--color-primary-dark)" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-panel" style={{
          padding: '2rem',
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
          background: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(8px)'
        }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-dark)', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            <AlertTriangle size={20} color="#e76f51" /> Low Stock Alerts
          </h3>

          {lowStock.length === 0 ? (
            <div style={{
              padding: '1.5rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(74, 117, 89, 0.04)',
              border: '1px solid rgba(74, 117, 89, 0.1)',
              color: 'var(--color-primary-dark)',
              fontSize: '0.9rem',
              fontWeight: 500,
              textAlign: 'center'
            }}>
              ✓ All products are fully stocked. No immediate restocks needed.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lowStock.map((prod) => (
                <div 
                  key={prod._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    backgroundColor: '#fff',
                    border: '1px solid var(--color-border)',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)', fontSize: '0.95rem' }}>
                      {prod.name}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                      SKU: {prod.sku || 'N/A'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                      Price: {formatCurrency(prod.price)}
                    </span>
                    
                    <span style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: prod.stock <= 2 ? 'rgba(235, 87, 87, 0.1)' : 'rgba(212, 163, 115, 0.15)',
                      color: prod.stock <= 2 ? 'var(--color-error)' : 'var(--color-secondary)'
                    }}>
                      {prod.stock === 0 ? 'Out of stock' : `${prod.stock} left in stock`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default AdminOverview;
