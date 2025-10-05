import mongoose, { Document, Schema } from 'mongoose';

export interface ICase extends Document {
  caseNumber: string;
  subject: string;
  description: string;
  status: 'New' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  type: 'Question' | 'Problem' | 'Feature Request' | 'Bug Report';
  userId: mongoose.Types.ObjectId;
  salesforceId?: string;
  assignedTo?: mongoose.Types.ObjectId;
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
  }>;
  comments: Array<{
    author: mongoose.Types.ObjectId;
    content: string;
    isInternal: boolean;
    createdAt: Date;
  }>;
  tags: string[];
  resolution?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;
}

const CaseSchema = new Schema<ICase>({
  caseNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [255, 'Subject cannot exceed 255 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Pending', 'Resolved', 'Closed'],
    default: 'New',
    index: true
  },
  
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    index: true
  },
  
  type: {
    type: String,
    enum: ['Question', 'Problem', 'Feature Request', 'Bug Report'],
    required: true
  },
  
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  salesforceId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
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
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  comments: [{
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  resolution: {
    type: String,
    maxlength: [2000, 'Resolution cannot exceed 2000 characters']
  },
  
  resolvedAt: {
    type: Date
  },
  
  closedAt: {
    type: Date
  },
  
  lastSyncedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

CaseSchema.index({ userId: 1, createdAt: -1 });
CaseSchema.index({ status: 1, priority: 1 });
CaseSchema.index({ tags: 1 });
CaseSchema.index({ subject: 'text', description: 'text' });

CaseSchema.pre('save', async function(next) {
  const caseDoc = this as ICase;
  
  if (caseDoc.isNew && !caseDoc.caseNumber) {
    const count = await mongoose.model('Case').countDocuments();
    caseDoc.caseNumber = `CASE-${String(count + 1).padStart(6, '0')}`;
  }
  
  if (caseDoc.status === 'Resolved' && !caseDoc.resolvedAt) {
    caseDoc.resolvedAt = new Date();
  }
  
  if (caseDoc.status === 'Closed' && !caseDoc.closedAt) {
    caseDoc.closedAt = new Date();
  }
  
  next();
});

const Case = mongoose.model<ICase>('Case', CaseSchema);

export default Case;
