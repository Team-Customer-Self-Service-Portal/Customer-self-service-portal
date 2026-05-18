import { Document, Schema, model, Types } from 'mongoose';
import { CasePriority, CaseStatus } from '../utils/constants';

export interface ICaseComment {
  text: string;
  authorId: Types.ObjectId;
  createdAt: Date;
}

export interface ICaseAttachment {
  filename: string;
  url: string;
  size: number;
}

export interface ICase extends Document {
  caseNumber: string;
  subject: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  category: string;
  userId: Types.ObjectId;
  salesforceCaseId?: string;
  salesforceCaseNumber?: string;
  comments: ICaseComment[];
  attachments: ICaseAttachment[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const caseSchema = new Schema<ICase>(
  {
    caseNumber: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: Object.values(CaseStatus), default: CaseStatus.New, index: true },
    priority: { type: String, enum: Object.values(CasePriority), default: CasePriority.Medium },
    category: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    salesforceCaseId: { type: String, index: true },
    salesforceCaseNumber: { type: String },
    comments: [
      {
        text: { type: String, required: true },
        authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    attachments: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number, required: true },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

caseSchema.index({ userId: 1, status: 1, salesforceCaseId: 1 });

export default model<ICase>('Case', caseSchema);
