import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMessage extends Document {
  fromUserId: mongoose.Types.ObjectId | undefined;
  guestEmail: string;
  guestName: string;
  subject: string;
  body: string;
  isDirectMessage: boolean; // true = authenticated DM; false = contact form
  messageType: 'contact' | 'newsletter';
  status: 'unread' | 'read' | 'replied';
  adminReply: string;
  repliedAt: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
    guestEmail: {
      type: String,
      default: '',
      trim: true,
      lowercase: true,
    },
    guestName: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    body: {
      type: String,
      required: [true, 'Message body is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
      trim: true,
    },
    isDirectMessage: {
      type: Boolean,
      default: false,
    },
    messageType: {
      type: String,
      enum: ['contact', 'newsletter'],
      default: 'contact',
    },
    status: {
      type: String,
      enum: ['unread', 'read', 'replied'],
      default: 'unread',
    },
    adminReply: {
      type: String,
      default: '',
    },
    repliedAt: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true }
);

messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ fromUserId: 1 });
messageSchema.index({ messageType: 1, createdAt: -1 });

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', messageSchema);
export default Message;
