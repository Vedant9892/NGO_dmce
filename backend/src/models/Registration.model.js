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
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'attended', 'cancelled'],
      default: 'confirmed',
    },
    attendedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

registrationSchema.index({ eventId: 1, volunteerId: 1 }, { unique: true });
registrationSchema.index({ volunteerId: 1 });
registrationSchema.index({ eventId: 1 });

export const Registration = mongoose.model('Registration', registrationSchema);
