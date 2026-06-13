import mongoose, { Document, Schema, Model } from 'mongoose';
import slugify from 'slugify';

// The 15 product categories from Kidist's actual product lines
export const PRODUCT_CATEGORIES = [
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
  'Wellness & Lifestyle',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface IProductImage {
  url: string;
  publicId: string;
  alt?: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice: number;
  currency: 'USD';
  stock: number;
  images: IProductImage[];
  category: ProductCategory;
  tags: string[];
  productType: 'physical' | 'service' | 'affiliate';
  affiliateUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  numReviews: number;
  lowStockThreshold: number;
  weight: number; // grams, for shipping calculations
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: {
      type: Number,
      default: 0,
      min: [0, 'Compare-at price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD'],
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    images: {
      type: [productImageSchema],
      validate: {
        validator: (images: IProductImage[]) => images.length > 0,
        message: 'At least one product image is required',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: PRODUCT_CATEGORIES,
    },
    tags: {
      type: [String],
      default: [],
    },
    productType: {
      type: String,
      enum: ['physical', 'service', 'affiliate'],
      default: 'physical',
    },
    affiliateUrl: {
      type: String,
      default: '',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    weight: {
      type: Number,
      default: 0,
    },
    sku: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug from title before saving
productSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

// Virtual: check if product is in stock
productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

// Virtual: check if price is discounted
productSchema.virtual('isOnSale').get(function () {
  return this.compareAtPrice > 0 && this.compareAtPrice > this.price;
});

// Indexes for fast search, filter, sort
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ slug: 1 });

const Product: Model<IProduct> = mongoose.model<IProduct>('Product', productSchema);
export default Product;
