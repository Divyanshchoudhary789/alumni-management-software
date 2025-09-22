import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  clerkUserId: string;
  email: string;
  role: 'admin' | 'alumni';
  oauthProvider: 'google' | 'linkedin';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['admin', 'alumni'],
    default: 'alumni',
    required: true,
  },
  oauthProvider: {
    type: String,
    enum: ['google', 'linkedin'],
    required: true,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
UserSchema.index({ clerkUserId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });

export const User = mongoose.model<IUser>('User', UserSchema);