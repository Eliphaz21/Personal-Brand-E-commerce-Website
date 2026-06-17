import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { sendSuccess } from '../utils/apiResponse';
import Order from '../models/Order.model';
import Product from '../models/Product.model';
import User from '../models/User.model';

/**
 * @desc    Get dashboard aggregate overview (total revenue, orders, products, users)
 * @route   GET /api/admin/analytics/overview
 * @access  Private (Admin Only)
 */
export const getDashboardOverview = catchAsync(async (_req: Request, res: Response) => {
  // Aggregate total revenue and count from paid/delivered orders
  const salesStats = await Order.aggregate([
    {
      $match: {
        paymentStatus: 'paid',
        orderStatus: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const stats = salesStats[0] || { totalRevenue: 0, totalOrders: 0 };

  const totalUsers = await User.countDocuments({ role: 'customer' });
  const totalProducts = await Product.countDocuments();

  sendSuccess(
    res,
    {
      revenue: stats.totalRevenue,
      orders: stats.totalOrders,
      users: totalUsers,
      products: totalProducts,
    },
    'Dashboard overview fetched successfully'
  );
});

/**
 * @desc    Get monthly sales and revenue chart data (last 12 months)
 * @route   GET /api/admin/analytics/sales-chart
 * @access  Private (Admin Only)
 */
export const getSalesChartData = catchAsync(async (_req: Request, res: Response) => {
  const d = new Date();
  d.setMonth(d.getMonth() - 11);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);

  const monthlyData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: d },
        paymentStatus: 'paid',
        orderStatus: { $ne: 'cancelled' },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  // Format response to be easier for frontend charting libraries
  const chartData = monthlyData.map((data) => {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return {
      month: `${monthNames[data._id.month - 1]} ${data._id.year}`,
      revenue: data.revenue,
      orders: data.orders,
    };
  });

  sendSuccess(res, { chartData }, 'Sales chart data fetched successfully');
});

/**
 * @desc    Get low stock products
 * @route   GET /api/admin/analytics/low-stock
 * @access  Private (Admin Only)
 */
export const getLowStockProducts = catchAsync(async (req: Request, res: Response) => {
  const lowStockThreshold = parseInt(req.query.threshold as string, 10) || 10;
  
  const products = await Product.find({ stock: { $lte: lowStockThreshold } })
    .sort({ stock: 1 })
    .limit(20)
    .select('title sku stock price slug images');

  sendSuccess(res, { products }, 'Low stock products fetched successfully');
});
