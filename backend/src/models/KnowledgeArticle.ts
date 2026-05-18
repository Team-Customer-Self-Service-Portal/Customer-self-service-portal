import { Document, Schema, model } from 'mongoose';

export interface IKnowledgeArticle extends Document {
  title: string;
  body: string;
  summary: string;
  category: string;
  tags: string[];
  publishedAt?: Date;
  viewCount: number;
  helpful: number;
  notHelpful: number;
  salesforceArticleId?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const knowledgeArticleSchema = new Schema<IKnowledgeArticle>(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    summary: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    publishedAt: { type: Date },
    viewCount: { type: Number, default: 0 },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 },
    salesforceArticleId: { type: String },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

knowledgeArticleSchema.index({ title: 'text', body: 'text' });

export default model<IKnowledgeArticle>('KnowledgeArticle', knowledgeArticleSchema);
