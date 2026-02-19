import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    ngoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coordinatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      trim: true,
    },
    detailedDescription: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Hybrid'],
    },
    date: {
      type: Date,
    },
    registrationDeadline: {
      type: Date,
    },
    bannerImage: {
      type: String,
      trim: true,
    },
    skills: [String],
    volunteersRequired: {
      type: Number,
      default: 0,
    },
    roles: [String],
    eligibility: [String],
    timeline: [
      {
        time: String,
        activity: String,
      },
    ],
    perks: [String],
    contactEmail: {
      type: String,
      trim: true,
    },
    trending: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

eventSchema.index({ ngoId: 1 });
eventSchema.index({ coordinatorId: 1 });
eventSchema.index({ date: 1 });

export const Event = mongoose.model('Event', eventSchema);
