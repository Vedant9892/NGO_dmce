import { User } from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function parseArrayField(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return val.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
    }
  }
  return val ? [val] : [];
}

const VALID_EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .lean();

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({
    success: true,
    data: {
      ...user,
      id: user._id,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== 'volunteer') {
    return res.status(403).json({
      success: false,
      message: 'Only volunteers can update profile skills',
    });
  }

  const { skills, experienceLevel, preferredRoles } = req.body;

  const updates = {};
  if (skills !== undefined) {
    updates.skills = parseArrayField(skills);
  }
  if (experienceLevel !== undefined) {
    const level = typeof experienceLevel === 'string' ? experienceLevel.trim() : '';
    if (level && VALID_EXPERIENCE_LEVELS.includes(level)) {
      updates.experienceLevel = level;
    } else if (level === '' || level === null) {
      updates.experienceLevel = null;
    }
  }
  if (preferredRoles !== undefined) {
    updates.preferredRoles = parseArrayField(preferredRoles);
  }

  if (Object.keys(updates).length === 0) {
    const user = await User.findById(req.user._id).select('-password').lean();
    return res.json({
      success: true,
      data: { ...user, id: user._id },
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  )
    .select('-password')
    .lean();

  res.json({
    success: true,
    data: {
      ...user,
      id: user._id,
    },
  });
});
