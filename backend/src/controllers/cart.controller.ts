import { Request, Response } from 'express';
import Cart from '../models/Cart.model';
import Product from '../models/Product.model';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';

/**
 * Helper to fetch a populated cart document or create one if it doesn't exist.
 */
const getOrCreateCart = async (userId: string) => {
  let cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'title slug price compareAtPrice images stock category productType weight',
  });

  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

/**
 * @desc    Get current user's cart
 * @route   GET /api/cart
 * @access  Private (Authenticated)
 */
export const getCart = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const cart = await getOrCreateCart(userId);

  res.status(200).json({
    success: true,
    cart,
  });
});

/**
 * @desc    Add product to cart
 * @route   POST /api/cart/items
 * @access  Private (Authenticated)
 */
export const addToCart = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { productId, qty = 1 } = req.body;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  // Validate product exists and check stock
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  if (!product.isActive) {
    throw new AppError('This product is currently unavailable.', 400);
  }

  if (product.stock < qty) {
    throw new AppError(`Cannot add quantity. Only ${product.stock} items in stock.`, 400);
  }

  const cart = await getOrCreateCart(userId);

  // Check if product is already in the cart
  const itemIndex = cart.items.findIndex(
    (item) => item.productId && item.productId._id.toString() === productId
  );

  if (itemIndex > -1) {
    // Increment quantity
    const newQty = cart.items[itemIndex].qty + qty;
    if (product.stock < newQty) {
      throw new AppError(
        `Cannot update quantity. Adding ${qty} would exceed the available stock of ${product.stock}.`,
        400
      );
    }
    cart.items[itemIndex].qty = newQty;
  } else {
    // Add new item
    cart.items.push({ productId, qty });
  }

  await cart.save();

  // Populate product details for response
  const populatedCart = await cart.populate({
    path: 'items.productId',
    select: 'title slug price compareAtPrice images stock category productType weight',
  });

  res.status(200).json({
    success: true,
    message: 'Item added to cart successfully.',
    cart: populatedCart,
  });
});

/**
 * @desc    Update quantity of a cart item
 * @route   PUT /api/cart/items/:productId
 * @access  Private (Authenticated)
 */
export const updateCartItemQty = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { productId } = req.params;
  const { qty } = req.body;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  if (product.stock < qty) {
    throw new AppError(`Cannot update quantity. Only ${product.stock} items in stock.`, 400);
  }

  const cart = await getOrCreateCart(userId);

  // Find item index
  const itemIndex = cart.items.findIndex(
    (item) => item.productId && item.productId._id.toString() === productId
  );

  if (itemIndex === -1) {
    throw new AppError('Item not found in cart.', 404);
  }

  cart.items[itemIndex].qty = qty;
  await cart.save();

  const populatedCart = await cart.populate({
    path: 'items.productId',
    select: 'title slug price compareAtPrice images stock category productType weight',
  });

  res.status(200).json({
    success: true,
    message: 'Cart item quantity updated.',
    cart: populatedCart,
  });
});

/**
 * @desc    Remove an item from cart
 * @route   DELETE /api/cart/items/:productId
 * @access  Private (Authenticated)
 */
export const removeFromCart = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  const { productId } = req.params;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const cart = await getOrCreateCart(userId);

  // Filter out the item
  const originalLength = cart.items.length;
  cart.items = cart.items.filter(
    (item) => item.productId && item.productId._id.toString() !== productId
  );

  if (cart.items.length === originalLength) {
    throw new AppError('Item not found in cart.', 404);
  }

  await cart.save();

  const populatedCart = await cart.populate({
    path: 'items.productId',
    select: 'title slug price compareAtPrice images stock category productType weight',
  });

  res.status(200).json({
    success: true,
    message: 'Item removed from cart.',
    cart: populatedCart,
  });
});

/**
 * @desc    Clear all items from cart
 * @route   DELETE /api/cart
 * @access  Private (Authenticated)
 */
export const clearCart = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new AppError('Authentication required.', 401);
  }

  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared successfully.',
    cart,
  });
});
