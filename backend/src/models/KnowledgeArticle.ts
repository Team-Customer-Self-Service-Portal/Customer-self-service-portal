import mongoose, { Document, Schema } from 'mongoose';

export interface IKnowledgeArticle extends Document {
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  author: mongoose.Types.ObjectId;
  isPublished: boolean;
  publishedAt?: Date;
  viewCount: number;
  helpful: number;
  notHelpful: number;
  salesforceId?: string;
  relatedArticles: mongoose.Types.ObjectId[];
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;
  incrementViewCount(): Promise<void>;
  markHelpful(helpful: boolean): Promise<void>;
}

const KnowledgeArticleSchema = new Schema<IKnowledgeArticle>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    trim: true,
    maxlength: [500, 'Summary cannot exceed 500 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  
  publishedAt: {
    type: Date
  },
  
  viewCount: {
    type: Number,
    default: 0,
    index: true
  },
  
  helpful: {
    type: Number,
    default: 0
  },
  
  notHelpful: {
    type: Number,
    default: 0
  },
  
  salesforceId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  
  relatedArticles: [{
    type: Schema.Types.ObjectId,
    ref: 'KnowledgeArticle'
  }],
  
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    }
  }],
  
  lastSyncedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

KnowledgeArticleSchema.index({ title: 'text', content: 'text', tags: 'text' });
KnowledgeArticleSchema.index({ category: 1, isPublished: 1 });
KnowledgeArticleSchema.index({ tags: 1 });
KnowledgeArticleSchema.index({ createdAt: -1 });
KnowledgeArticleSchema.index({ viewCount: -1 });

KnowledgeArticleSchema.pre('save', function(next) {
  const article = this as IKnowledgeArticle;
  
  if (article.isPublished && !article.publishedAt) {
    article.publishedAt = new Date();
  }
  
  next();
});

KnowledgeArticleSchema.methods.incrementViewCount = async function(): Promise<void> {
  await this.updateOne({ $inc: { viewCount: 1 } });
};

KnowledgeArticleSchema.methods.markHelpful = async function(helpful: boolean): Promise<void> {
  const update = helpful ? { $inc: { helpful: 1 } } : { $inc: { notHelpful: 1 } };
  await this.updateOne(update);
};

const KnowledgeArticle = mongoose.model<IKnowledgeArticle>('KnowledgeArticle', KnowledgeArticleSchema);

export default KnowledgeArticle;
