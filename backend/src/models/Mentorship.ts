import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorshipConnection extends Document {
  mentorId: mongoose.Types.ObjectId;
  menteeId: mongoose.Types.ObjectId;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startDate?: Date;
  endDate?: Date;
  notes?: string;
  mentorFeedback?: string;
  menteeFeedback?: string;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMentorProfile extends Document {
  alumniId: mongoose.Types.ObjectId;
  expertise: string[];
  industries: string[];
  yearsOfExperience: number;
  maxMentees: number;
  currentMentees: number;
  bio: string;
  availableHours: string[];
  preferredCommunication: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenteeProfile extends Document {
  alumniId: mongoose.Types.ObjectId;
  goals: string[];
  interestedIndustries: string[];
  careerStage: 'student' | 'recent_graduate' | 'early_career' | 'mid_career' | 'career_change';
  bio: string;
  preferredCommunication: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MentorshipConnectionSchema = new Schema<IMentorshipConnection>({
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'MentorProfile',
    required: true,
    index: true,
  },
  menteeId: {
    type: Schema.Types.ObjectId,
    ref: 'MenteeProfile',
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending',
    required: true,
    index: true,
  },
  startDate: {
    type: Date,
    index: true,
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(this: IMentorshipConnection, value: Date) {
        return !value || !this.startDate || value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  mentorFeedback: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  menteeFeedback: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    validate: {
      validator: function(value: number) {
        return Number.isInteger(value);
      },
      message: 'Rating must be an integer between 1 and 5'
    }
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

const MentorProfileSchema = new Schema<IMentorProfile>({
  alumniId: {
    type: Schema.Types.ObjectId,
    ref: 'AlumniProfile',
    required: true,
    unique: true,
    index: true,
  },
  expertise: [{
    type: String,
    trim: true,
    maxlength: 50,
  }],
  industries: [{
    type: String,
    trim: true,
    maxlength: 50,
  }],
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0,
    max: 50,
  },
  maxMentees: {
    type: Number,
    required: true,
    min: 1,
    max: 20,
    default: 3,
  },
  currentMentees: {
    type: Number,
    default: 0,
    min: 0,
  },
  bio: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  availableHours: [{
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'weekend'],
  }],
  preferredCommunication: [{
    type: String,
    enum: ['email', 'video_call', 'phone', 'in_person', 'messaging'],
  }],
  isActive: {
    type: Boolean,
    default: true,
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

const MenteeProfileSchema = new Schema<IMenteeProfile>({
  alumniId: {
    type: Schema.Types.ObjectId,
    ref: 'AlumniProfile',
    required: true,
    unique: true,
    index: true,
  },
  goals: [{
    type: String,
    trim: true,
    maxlength: 100,
  }],
  interestedIndustries: [{
    type: String,
    trim: true,
    maxlength: 50,
  }],
  careerStage: {
    type: String,
    enum: ['student', 'recent_graduate', 'early_career', 'mid_career', 'career_change'],
    required: true,
    index: true,
  },
  bio: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  preferredCommunication: [{
    type: String,
    enum: ['email', 'video_call', 'phone', 'in_person', 'messaging'],
  }],
  isActive: {
    type: Boolean,
    default: true,
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
MentorshipConnectionSchema.index({ mentorId: 1, status: 1 });
MentorshipConnectionSchema.index({ menteeId: 1, status: 1 });
MentorshipConnectionSchema.index({ status: 1, startDate: -1 });
MentorshipConnectionSchema.index({ mentorId: 1, menteeId: 1 }, { unique: true });

MentorProfileSchema.index({ expertise: 1 });
MentorProfileSchema.index({ industries: 1 });
MentorProfileSchema.index({ yearsOfExperience: 1 });
MentorProfileSchema.index({ isActive: 1, currentMentees: 1 });

MenteeProfileSchema.index({ interestedIndustries: 1 });
MenteeProfileSchema.index({ careerStage: 1 });
MenteeProfileSchema.index({ isActive: 1 });

// Text indexes for search
MentorProfileSchema.index({
  expertise: 'text',
  industries: 'text',
  bio: 'text'
});

MenteeProfileSchema.index({
  goals: 'text',
  interestedIndustries: 'text',
  bio: 'text'
});

export const MentorshipConnection = mongoose.model<IMentorshipConnection>('MentorshipConnection', MentorshipConnectionSchema);
export const MentorProfile = mongoose.model<IMentorProfile>('MentorProfile', MentorProfileSchema);
export const MenteeProfile = mongoose.model<IMenteeProfile>('MenteeProfile', MenteeProfileSchema);