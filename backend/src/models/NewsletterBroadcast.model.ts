import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface INewsletterBroadcast extends Document {
  subject: string;
  body: string;
  sentBy: Types.ObjectId;
  recipientCount: number;
  sentAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterBroadcastSchema = new Schema<INewsletterBroadcast>(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    sentBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipientCount: {
      type: Number,
      required: true,
      min: 0,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

newsletterBroadcastSchema.index({ sentAt: -1 });

const NewsletterBroadcast: Model<INewsletterBroadcast> = mongoose.model<INewsletterBroadcast>(
  'NewsletterBroadcast',
  newsletterBroadcastSchema
);

export default NewsletterBroadcast;
