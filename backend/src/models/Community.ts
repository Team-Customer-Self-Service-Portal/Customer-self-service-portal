import { Document, Schema, Types, model } from 'mongoose';

export type CommunityStatus = 'open' | 'answered' | 'closed';

export interface ICommunityComment {
  body: string;
  authorId: Types.ObjectId;
  upvotes: Types.ObjectId[];
  createdAt: Date;
  isAnswer: boolean;
}

export interface ICommunityPost extends Document {
  title: string;
  body: string;
  authorId: Types.ObjectId;
  category: string;
  tags: string[];
  views: number;
  upvotes: Types.ObjectId[];
  status: CommunityStatus;
  comments: ICommunityComment[];
  createdAt: Date;
  updatedAt: Date;
}

const communitySchema = new Schema<ICommunityPost>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, required: true, index: true },
    tags: [{ type: String }],
    views: { type: Number, default: 0 },
    upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },
    comments: [
      {
        body: { type: String, required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        createdAt: { type: Date, default: Date.now },
        isAnswer: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

communitySchema.index({ authorId: 1, category: 1 });

export default model<ICommunityPost>('CommunityPost', communitySchema);
