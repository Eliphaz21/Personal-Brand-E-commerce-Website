import { Request, Response } from 'express';
import slugify from 'slugify';
import Product, { PRODUCT_CATEGORIES } from '../models/Product.model';
import { AppError } from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import { verifyAccessToken } from '../utils/generateToken';

/**
 * Helper to check if the request contains a valid admin token (doesn't throw on failure)
 */
const checkIsAdmin = (req: Request): boolean => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = verifyAccessToken(token);
      return decoded.role === 'admin';
    } catch {
      return false;
    }
  }
  return false;
};

/**
 * @desc    Create a new product (Admin Only)
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const files = req.files as Express.Multer.File[];

  if (!files || files.length === 0) {
    throw new AppError('At least one product image is required.', 400);
  }

  // Upload images to Cloudinary
  const images = [];
  for (const file of files) {
    const uploadResult = await uploadBufferToCloudinary(file.buffer, 'kiduendu/products');
    images.push({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      alt: req.body.title || '',
    });
  }

  // Create product
  const productData = {
    ...req.body,
    images,
  };

  const product = await Product.create(productData);

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    product,
  });
});

/**
 * @desc    Get all products (with advanced filters, search, sorting & pagination)
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    isFeatured,
    productType,
    sort,
    page: pageQuery,
    limit: limitQuery,
  } = req.query;

  // Build MongoDB query
  const query: any = {};

  // For safety, public users can only see active products. Admins can view active/inactive.
  const isAdmin = checkIsAdmin(req);
  if (!isAdmin) {
    query.isActive = true;
  } else if (req.query.isActive !== undefined) {
    if (req.query.isActive === 'true') query.isActive = true;
    if (req.query.isActive === 'false') query.isActive = false;
  }

  // Search filter
  let projection: any = {};
  let sortObj: any = {};

  if (search) {
    query.$text = { $search: search as string };
    projection = { score: { $meta: 'textScore' } };
    sortObj = { score: { $meta: 'textScore' } };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Rating filter
  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }

  // Stock filter
  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  } else if (inStock === 'false') {
    query.stock = 0;
  }

  // Featured filter
  if (isFeatured === 'true') {
    query.isFeatured = true;
  } else if (isFeatured === 'false') {
    query.isFeatured = false;
  }

  // Product Type filter
  if (productType) {
    query.productType = productType;
  }

  // Custom sorting (overrides text score sort if text search was used)
  if (sort) {
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else if (sort === 'best_selling') sortObj = { numReviews: -1 };
    else if (sort === 'top_rated') sortObj = { rating: -1 };
  } else if (!search) {
    // Default sort
    sortObj = { createdAt: -1 };
  }

  // Pagination
  const page = parseInt((pageQuery as string) || '1', 10);
  const limit = parseInt((limitQuery as string) || '12', 10);
  const skip = (page - 1) * limit;

  const total = await Product.countDocuments(query);
  const products = await Product.find(query, projection)
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const pages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    pages,
    page,
    limit,
    products,
  });
});

/**
 * @desc    Get single product by SEO slug
 * @route   GET /api/products/:slug
 * @access  Public
 */
export const getProductBySlug = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;

  const query: any = { slug };

  // Only admins can request inactive products by slug
  const isAdmin = checkIsAdmin(req);
  if (!isAdmin) {
    query.isActive = true;
  }

  const product = await Product.findOne(query);

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  res.status(200).json({
    success: true,
    product,
  });
});

/**
 * @desc    Update a product (Admin Only)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];

  const product = await Product.findById(id);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  let updatedImages = [...product.images];

  // 1. Delete selected existing images if requested
  if (req.body.deleteImages) {
    let imagesToDelete: string[] = [];
    try {
      imagesToDelete = typeof req.body.deleteImages === 'string'
        ? JSON.parse(req.body.deleteImages)
        : req.body.deleteImages;
    } catch {
      imagesToDelete = [req.body.deleteImages];
    }

    if (Array.isArray(imagesToDelete)) {
      for (const publicId of imagesToDelete) {
        await deleteFromCloudinary(publicId);
        updatedImages = updatedImages.filter((img) => img.publicId !== publicId);
      }
    }
  }

  // 2. Upload new images to Cloudinary
  if (files && files.length > 0) {
    for (const file of files) {
      const uploadResult = await uploadBufferToCloudinary(file.buffer, 'kiduendu/products');
      updatedImages.push({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        alt: req.body.title || product.title,
      });
    }
  }

  // Ensure at least one image remains
  if (updatedImages.length === 0) {
    throw new AppError('Product must have at least one image.', 400);
  }

  // 3. Update product fields
  const updateFields = {
    ...req.body,
    images: updatedImages,
  };

  // If title is changing, mongoose pre-save hook handles slug change,
  // but since we are doing findByIdAndUpdate, hooks might not run.
  // So let's handle slug manually if title is updated.
  if (req.body.title && req.body.title !== product.title) {
    updateFields.slug = slugify(req.body.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Product updated successfully.',
    product: updatedProduct,
  });
});

/**
 * @desc    Delete a product (Admin Only)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  // Clean up all associated images from Cloudinary
  for (const img of product.images) {
    await deleteFromCloudinary(img.publicId);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Product and associated images deleted successfully.',
  });
});

/**
 * @desc    Get all product categories
 * @route   GET /api/products/categories
 * @access  Public
 */
export const getProductCategories = catchAsync(async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    categories: PRODUCT_CATEGORIES,
  });
});
