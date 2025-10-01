import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunication extends Document {
  title: string;
  content: string;
  type: 'newsletter' | 'announcement' | 'event_invitation' | 'donation_request' | 'general';
  targetAudience: string[];
  sentDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledDate?: Date;
  recipients: mongoose.Types.ObjectId[];
  deliveryStats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommunicationTemplate extends Document {
  name: string;
  subject: string;
  content: string;
  type: 'newsletter' | 'announcement' | 'event_invitation' | 'donation_request' | 'general';
  variables: string[];
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommunicationSchema = new Schema<ICommunication>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000,
  },
  type: {
    type: String,
    enum: ['newsletter', 'announcement', 'event_invitation', 'donation_request', 'general'],
    required: true,
    index: true,
  },
  targetAudience: [{
    type: String,
    trim: true,
    enum: ['all', 'alumni', 'recent_graduates', 'donors', 'mentors', 'mentees', 'event_attendees'],
  }],
  sentDate: {
    type: Date,
    index: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'failed'],
    default: 'draft',
    required: true,
  },
  scheduledDate: {
    type: Date,
    validate: {
      validator: function(this: ICommunication, value: Date) {
        return !value || value > new Date();
      },
      message: 'Scheduled date must be in the future'
    }
  },
  recipients: [{
    type: Schema.Types.ObjectId,
    ref: 'AlumniProfile',
  }],
  deliveryStats: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
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

const CommunicationTemplateSchema = new Schema<ICommunicationTemplate>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    index: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000,
  },
  type: {
    type: String,
    enum: ['newsletter', 'announcement', 'event_invitation', 'donation_request', 'general'],
    required: true,
    index: true,
  },
  variables: [{
    type: String,
    trim: true,
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
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
CommunicationSchema.index({ type: 1, status: 1 });
CommunicationSchema.index({ createdBy: 1, createdAt: -1 });
CommunicationSchema.index({ sentDate: -1 });
CommunicationSchema.index({ scheduledDate: 1, status: 1 });

CommunicationTemplateSchema.index({ type: 1, isActive: 1 });
CommunicationTemplateSchema.index({ createdBy: 1 });

// Text index for search
CommunicationSchema.index({
  title: 'text',
  content: 'text'
});

CommunicationTemplateSchema.index({
  name: 'text',
  subject: 'text',
  content: 'text'
});

export const Communication = mongoose.model<ICommunication>('Communication', CommunicationSchema);
export const CommunicationTemplate = mongoose.model<ICommunicationTemplate>('CommunicationTemplate', CommunicationTemplateSchema);