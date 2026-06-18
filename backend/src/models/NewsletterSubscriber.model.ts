import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INewsletterSubscriber extends Document {
  email: string;
  name: string;
  isActive: boolean;
  subscribedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    name: {
      type: String,
      default: '',
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

newsletterSubscriberSchema.index({ isActive: 1, subscribedAt: -1 });

const NewsletterSubscriber: Model<INewsletterSubscriber> = mongoose.model<INewsletterSubscriber>(
  'NewsletterSubscriber',
  newsletterSubscriberSchema
);

export default NewsletterSubscriber;
