import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const VALID_ROLES = ['volunteer', 'coordinator', 'ngo'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: VALID_ROLES,
    },
    organization: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

userSchema.pre('save', function (next) {
  if (['ngo', 'coordinator'].includes(this.role) && !this.organization?.trim()) {
    return next(new Error('Organization is required for NGO and coordinator roles'));
  }
  if (this.role === 'coordinator' && !this.createdBy) {
    return next(new Error('createdBy is required for coordinator role'));
  }
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
export { VALID_ROLES };
