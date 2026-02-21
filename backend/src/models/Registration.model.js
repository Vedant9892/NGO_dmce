import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appliedRole: { type: String, trim: true },
    offeredRole: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'role_offered', 'declined', 'confirmed', 'attended', 'cancelled'],
      default: 'pending',
    },
    attendedAt: {
      type: Date,
    },
    markedAt: {
      type: Date,
    },
    markedLocation: {
      type: String,
      trim: true,
    },
    markedMethod: {
      type: String,
      enum: ['qr', 'code'],
    },
  },
  { timestamps: true }
);

registrationSchema.index({ eventId: 1, volunteerId: 1 }, { unique: true });
registrationSchema.index({ volunteerId: 1 });
registrationSchema.index({ eventId: 1 });

export const Registration = mongoose.model('Registration', registrationSchema);
