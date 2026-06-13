import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IKnowledgeDoc extends Document {
  filename: string;
  originalName: string;
  mimeType: string;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  status: 'processing' | 'indexed' | 'failed';
  chunkCount: number;
  vectorIds: string[];
  uploadedBy: mongoose.Types.ObjectId;
  errorMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const knowledgeDocSchema = new Schema<IKnowledgeDoc>(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['processing', 'indexed', 'failed'],
      default: 'processing',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    vectorIds: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

knowledgeDocSchema.index({ status: 1 });
knowledgeDocSchema.index({ uploadedBy: 1 });

const KnowledgeDoc: Model<IKnowledgeDoc> = mongoose.model<IKnowledgeDoc>(
  'KnowledgeDoc',
  knowledgeDocSchema
);
export default KnowledgeDoc;
