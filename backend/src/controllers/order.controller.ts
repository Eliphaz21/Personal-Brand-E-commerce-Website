import { Request, Response } from 'express';
import Order, { IOrderItem } from '../models/Order.model';
import Product from '../models/Product.model';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';

/**
 * @desc    Create a new pending order
 * @route   POST /api/orders
 * @access  Private (Authenticated)
 */
export const createOrder = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { items, shippingAddress, couponCode, notes } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  if (!items || items.length === 0) {
    throw new AppError('Order must contain at least one item.', 400);
  }

  const orderItems: IOrderItem[] = [];
  let subtotal = 0;

  // Validate items and calculate secure prices
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new AppError(`Product not found: ${item.productId}`, 404);
    }

    if (product.stock < item.qty) {
      throw new AppError(`Insufficient stock for product: ${product.title}`, 400);
    }

    const price = product.price; // Use price from DB, ignore frontend price
    subtotal += price * item.qty;

    orderItems.push({
      productId: product._id as any,
      title: product.title,
      image: product.images[0]?.url || '',
      qty: item.qty,
      price: price,
    });
  }

  const tax = subtotal * 0.05; // 5% tax example
  const shippingCost = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const discount = 0; // Future coupon logic
  const totalPrice = subtotal + tax + shippingCost - discount;

  const order = await Order.create({
    userId,
    items: orderItems,
    shippingAddress,
    subtotal,
    tax,
    shippingCost,
    discount,
    couponCode,
    totalPrice,
    notes,
    paymentStatus: 'pending',
    orderStatus: 'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Order created successfully.',
    order,
  });
});

/**
 * @desc    Get current user's order history
 * @route   GET /api/orders/myorders
 * @access  Private (Authenticated)
 */
export const getMyOrders = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const orders = await Order.find({ userId }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

/**
 * @desc    Get order details by ID
 * @route   GET /api/orders/:id
 * @access  Private (Authenticated)
 */
export const getOrderById = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  // Ensure user owns the order, unless admin
  if (order.userId.toString() !== userId && userRole !== 'admin') {
    throw new AppError('You do not have permission to view this order.', 403);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

/**
 * @desc    Get all orders (Admin Only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
export const getAllOrders = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

/**
 * @desc    Update order shipping/delivery status (Admin Only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
export const updateOrderStatus = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { orderStatus, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  order.orderStatus = orderStatus;
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully.',
    order,
  });
});
