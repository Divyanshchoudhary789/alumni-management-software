import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  eventDate: Date;
  location: string;
  capacity: number;
  registrationDeadline: Date;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  imageUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  alumniId: mongoose.Types.ObjectId;
  registrationDate: Date;
  status: 'registered' | 'attended' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
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
  eventDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 10000,
  },
  registrationDeadline: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: IEvent, value: Date) {
        return value < this.eventDate;
      },
      message: 'Registration deadline must be before event date'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft',
    required: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
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

const EventRegistrationSchema = new Schema<IEventRegistration>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  },
  alumniId: {
    type: Schema.Types.ObjectId,
    ref: 'AlumniProfile',
    required: true,
    index: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled'],
    default: 'registered',
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
EventSchema.index({ eventDate: 1 });
EventSchema.index({ status: 1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ createdAt: -1 });

// Text index for search
EventSchema.index({
  title: 'text',
  description: 'text',
  location: 'text'
});

// Compound indexes
EventRegistrationSchema.index({ eventId: 1, alumniId: 1 }, { unique: true });
EventRegistrationSchema.index({ eventId: 1, status: 1 });
EventRegistrationSchema.index({ alumniId: 1, status: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
export const EventRegistration = mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);