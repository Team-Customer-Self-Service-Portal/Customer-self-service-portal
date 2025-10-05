import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityPost extends Document {
  title: string;
  content: string;
  category: string;
  author: mongoose.Types.ObjectId;
  tags: string[];
  upvotes: number;
  downvotes: number;
  views: number;
  isResolved: boolean;
  resolvedAt?: Date;
  acceptedAnswer?: mongoose.Types.ObjectId;
  replies: Array<{
    author: mongoose.Types.ObjectId;
    content: string;
    upvotes: number;
    downvotes: number;
    isAcceptedAnswer: boolean;
    createdAt: Date;
  }>;
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  incrementViews(): Promise<void>;
  vote(isUpvote: boolean): Promise<void>;
}

const CommunityPostSchema = new Schema<ICommunityPost>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true
  },
  
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  upvotes: {
    type: Number,
    default: 0,
    index: true
  },
  
  downvotes: {
    type: Number,
    default: 0
  },
  
  views: {
    type: Number,
    default: 0
  },
  
  isResolved: {
    type: Boolean,
    default: false,
    index: true
  },
  
  resolvedAt: {
    type: Date
  },
  
  acceptedAnswer: {
    type: Schema.Types.ObjectId
  },
  
  replies: [{
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, 'Reply cannot exceed 5000 characters']
    },
    upvotes: {
      type: Number,
      default: 0
    },
    downvotes: {
      type: Number,
      default: 0
    },
    isAcceptedAnswer: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
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
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

CommunityPostSchema.index({ title: 'text', content: 'text' });
CommunityPostSchema.index({ author: 1, createdAt: -1 });
CommunityPostSchema.index({ category: 1, createdAt: -1 });
CommunityPostSchema.index({ tags: 1 });
CommunityPostSchema.index({ upvotes: -1 });

CommunityPostSchema.pre('save', function(next) {
  const post = this as ICommunityPost;
  
  if (post.isResolved && !post.resolvedAt) {
    post.resolvedAt = new Date();
  }
  
  next();
});

CommunityPostSchema.methods.incrementViews = async function(): Promise<void> {
  await this.updateOne({ $inc: { views: 1 } });
};

CommunityPostSchema.methods.vote = async function(isUpvote: boolean): Promise<void> {
  const update = isUpvote ? { $inc: { upvotes: 1 } } : { $inc: { downvotes: 1 } };
  await this.updateOne(update);
};

const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);

export default CommunityPost;
