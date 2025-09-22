import mongoose, { Document, Schema } from 'mongoose';

export interface IDonation extends Document {
  donorId: mongoose.Types.ObjectId;
  amount: number;
  donationDate: Date;
  purpose: string;
  campaignId?: mongoose.Types.ObjectId;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICampaign extends Document {
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DonationSchema = new Schema<IDonation>({
  donorId: {
    type: Schema.Types.ObjectId,
    ref: 'AlumniProfile',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
    validate: {
      validator: function(value: number) {
        return Number.isFinite(value) && value > 0;
      },
      message: 'Amount must be a positive number'
    }
  },
  donationDate: {
    type: Date,
    default: Date.now,
    required: true,
    index: true,
  },
  purpose: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'Campaign',
    index: true,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe'],
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    required: true,
    index: true,
  },
  transactionId: {
    type: String,
    trim: true,
    index: true,
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

const CampaignSchema = new Schema<ICampaign>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    index: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  goalAmount: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: function(value: number) {
        return Number.isFinite(value) && value > 0;
      },
      message: 'Goal amount must be a positive number'
    }
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  startDate: {
    type: Date,
    required: true,
    index: true,
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: ICampaign, value: Date) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft',
    required: true,
    index: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
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
DonationSchema.index({ donorId: 1, donationDate: -1 });
DonationSchema.index({ campaignId: 1, status: 1 });
DonationSchema.index({ status: 1, donationDate: -1 });
DonationSchema.index({ transactionId: 1 });

CampaignSchema.index({ status: 1, startDate: 1 });
CampaignSchema.index({ endDate: 1 });
CampaignSchema.index({ createdBy: 1 });

// Text index for search
CampaignSchema.index({
  title: 'text',
  description: 'text'
});

export const Donation = mongoose.model<IDonation>('Donation', DonationSchema);
export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);