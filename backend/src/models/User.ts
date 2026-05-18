import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  salesforceId?: string;
  accountId?: string;
  avatar?: string;
  timezone: string;
  language: string;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    newsletter: boolean;
    theme: 'light' | 'dark' | 'auto';
  };
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  status: 'active' | 'inactive' | 'suspended';
  role: 'customer' | 'admin' | 'support';
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;
  fullName: string;
  isLocked: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  incrementLoginAttempts(): Promise<void>;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  phone: {
    type: String,
    trim: true,
    match: [
      /^\+?[\d\s\-\(\)]{10,}$/,
      'Please provide a valid phone number'
    ]
  },
  
  salesforceId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  
  accountId: {
    type: String,
    index: true
  },
  
  avatar: {
    type: String,
    default: null
  },
  
  timezone: {
    type: String,
    default: 'UTC',
    enum: [
      'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 
      'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 
      'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney'
    ]
  },
  
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'ja', 'zh']
  },
  
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    newsletter: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    }
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: {
    type: String,
    select: false
  },
  
  passwordResetToken: {
    type: String,
    select: false
  },
  
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  lastLoginAt: {
    type: Date,
    default: null
  },
  
  loginAttempts: {
    type: Number,
    default: 0
  },
  
  lockUntil: {
    type: Date,
    select: false
  },
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  role: {
    type: String,
    enum: ['customer', 'admin', 'support'],
    default: 'customer'
  },
  
  lastSyncedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: removePrivateFields },
  toObject: { virtuals: true }
});

UserSchema.index({ email: 1 });
UserSchema.index({ salesforceId: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLoginAt: -1 });

UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual('isLocked').get(function(this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

UserSchema.pre('save', async function(next) {
  const user = this as IUser;
  
  if (!user.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.pre('save', function(next) {
  const user = this as IUser;
  
  if (user.isModified('loginAttempts') && user.loginAttempts >= 5) {
    user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
  }
  
  next();
});

UserSchema.methods.comparePassword = async function(
  candidatePassword: string
): Promise<boolean> {
  const user = this as IUser;
  
  if (!user.password) {
    throw new Error('Password not available for comparison');
  }
  
  return bcrypt.compare(candidatePassword, user.password);
};

UserSchema.methods.generatePasswordResetToken = function(): string {
  const user = this as IUser;
  
  const resetToken = require('crypto').randomBytes(32).toString('hex');
  
  user.passwordResetToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
  
  return resetToken;
};

UserSchema.methods.incrementLoginAttempts = async function(): Promise<void> {
  const user = this as IUser;
  
  if (user.lockUntil && user.lockUntil < new Date()) {
    return user.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  if (user.loginAttempts + 1 >= 5 && !user.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return user.updateOne(updates);
};

UserSchema.statics.findByEmailOrSalesforceId = function(
  email: string, 
  salesforceId?: string
) {
  const query: any = { email };
  
  if (salesforceId) {
    query.$or = [
      { email },
      { salesforceId }
    ];
  }
  
  return this.findOne(query);
};

function removePrivateFields(doc: any, ret: any) {
  delete ret.password;
  delete ret.passwordResetToken;
  delete ret.passwordResetExpires;
  delete ret.emailVerificationToken;
  delete ret.loginAttempts;
  delete ret.lockUntil;
  return ret;
}

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
