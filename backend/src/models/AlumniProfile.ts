import mongoose, { Document, Schema } from 'mongoose';

export interface IAlumniProfile extends Document {
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  graduationYear: number;
  degree: string;
  currentCompany?: string;
  currentPosition?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  phone?: string;
  isPublic: boolean;
  skills: string[];
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AlumniProfileSchema = new Schema<IAlumniProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  graduationYear: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 10,
  },
  degree: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  currentCompany: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  currentPosition: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  profileImage: {
    type: String,
    trim: true,
  },
  linkedinUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(v);
      },
      message: 'Invalid LinkedIn URL format'
    }
  },
  websiteUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid website URL format'
    }
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        return !v || /^\+?[\d\s\-\(\)]+$/.test(v);
      },
      message: 'Invalid phone number format'
    }
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: 50,
  }],
  interests: [{
    type: String,
    trim: true,
    maxlength: 50,
  }],
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

// Indexes for performance and search
AlumniProfileSchema.index({ userId: 1 });
AlumniProfileSchema.index({ graduationYear: 1 });
AlumniProfileSchema.index({ location: 1 });
AlumniProfileSchema.index({ currentCompany: 1 });
AlumniProfileSchema.index({ skills: 1 });
AlumniProfileSchema.index({ interests: 1 });
AlumniProfileSchema.index({ isPublic: 1 });
AlumniProfileSchema.index({ createdAt: -1 });

// Text index for search functionality
AlumniProfileSchema.index({
  firstName: 'text',
  lastName: 'text',
  currentCompany: 'text',
  currentPosition: 'text',
  skills: 'text',
  interests: 'text'
});

// Virtual for full name
AlumniProfileSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

export const AlumniProfile = mongoose.model<IAlumniProfile>('AlumniProfile', AlumniProfileSchema);