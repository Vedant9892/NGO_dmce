import multer from 'multer';
import mongoose from 'mongoose';
import { Event } from '../models/Event.model.js';
import { Registration } from '../models/Registration.model.js';
import { User } from '../models/User.model.js';
import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed (jpeg, png, webp)'), false);
    }
  },
}).single('bannerImage');

export const uploadBannerToSupabase = async (file) => {
  if (!file || !file.buffer) return null;
  const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
  const uniqueName = `${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('events')
    .upload(uniqueName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(error.message || 'Image upload failed');
  }

  const { data: urlData } = supabase.storage.from('events').getPublicUrl(data.path);
  return urlData?.publicUrl || null;
};

const validateCoordinatorId = async (coordinatorId) => {
  if (!coordinatorId) return null;
  const user = await User.findById(coordinatorId).select('role');
  if (!user || user.role !== 'coordinator') {
    throw new Error('coordinatorId must reference a user with coordinator role');
  }
  return coordinatorId;
};

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

export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    detailedDescription,
    location,
    mode,
    date,
    registrationDeadline,
    skills,
    volunteersRequired,
    roles,
    eligibility,
    timeline,
    perks,
    contactEmail,
    coordinatorId: bodyCoordinatorId,
  } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  let coordinatorId = null;
  if (bodyCoordinatorId) {
    coordinatorId = await validateCoordinatorId(bodyCoordinatorId);
  }

  let bannerImage = null;
  if (req.file) {
    try {
      bannerImage = await uploadBannerToSupabase(req.file);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to upload image',
      });
    }
  }

  const event = await Event.create({
    title,
    ngoId: req.user._id,
    coordinatorId,
    description,
    detailedDescription,
    location,
    mode: mode || 'Offline',
    date: date ? new Date(date) : undefined,
    registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
    bannerImage,
    skills: parseArrayField(skills),
    volunteersRequired: parseInt(volunteersRequired, 10) || 0,
    roles: parseArrayField(roles),
    eligibility: parseArrayField(eligibility),
    timeline: Array.isArray(timeline) ? timeline : typeof timeline === 'string' ? (() => { try { const t = JSON.parse(timeline); return Array.isArray(t) ? t : []; } catch { return []; } })() : [],
    perks: parseArrayField(perks),
    contactEmail,
  });

  const populated = await Event.findById(event._id)
    .populate('ngoId', 'name email')
    .populate('coordinatorId', 'name email')
    .lean();

  res.status(201).json({
    success: true,
    data: formatEvent(populated),
  });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const ngoIdStr = event.ngoId.toString();
  const currentUserId = req.user._id.toString();

  const isOwnerNGO = req.user.role === 'ngo' && ngoIdStr === currentUserId;
  const isAssignedCoordinator =
    req.user.role === 'coordinator' &&
    event.coordinatorId &&
    event.coordinatorId.toString() === currentUserId;

  if (!isOwnerNGO && !isAssignedCoordinator) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to edit this event',
    });
  }

  const allowedForCoordinator = [
    'title',
    'description',
    'detailedDescription',
    'location',
    'mode',
    'date',
    'registrationDeadline',
    'skills',
    'volunteersRequired',
    'roles',
    'eligibility',
    'timeline',
    'perks',
    'contactEmail',
    'trending',
  ];

  const allowedForNGO = [...allowedForCoordinator, 'coordinatorId'];

  const allowed = isOwnerNGO ? allowedForNGO : allowedForCoordinator;

  const updates = {};
  for (const key of allowed) {
    if (req.body[key] === undefined) continue;
    if (key === 'date' || key === 'registrationDeadline') {
      updates[key] = new Date(req.body[key]);
    } else if (key === 'coordinatorId') {
      if (!req.body[key]) {
        updates[key] = null;
      } else {
        updates[key] = await validateCoordinatorId(req.body[key]);
      }
    } else {
      updates[key] = req.body[key];
    }
  }

  if (req.file) {
    updates.bannerImage = await uploadBannerToSupabase(req.file);
  }

  const updated = await Event.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('ngoId', 'name email')
    .populate('coordinatorId', 'name email')
    .lean();

  res.json({ success: true, data: formatEvent(updated) });
});

export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .populate('ngoId', 'name')
    .sort({ date: 1 })
    .lean();

  const result = [];
  for (const ev of events) {
    const count = await Registration.countDocuments({
      eventId: ev._id,
      status: { $in: ['pending', 'confirmed', 'attended'] },
    });
    result.push(formatEvent({ ...ev, volunteersRegistered: count }));
  }

  res.json({
    success: true,
    data: result,
    events: result,
  });
});

export const getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('ngoId', 'name email')
    .populate('coordinatorId', 'name email')
    .lean();

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const registrations = await Registration.countDocuments({
    eventId: event._id,
    status: { $in: ['pending', 'confirmed', 'attended'] },
  });

  res.json({
    success: true,
    data: {
      ...formatEvent(event),
      volunteersRegistered: registrations,
    },
  });
});

export const registerForEvent = asyncHandler(async (req, res) => {
  if (req.user.role !== 'volunteer') {
    return res.status(403).json({
      success: false,
      message: 'Only volunteers can register for events',
    });
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const capacity = event.volunteersRequired || 0;
  const count = await Registration.countDocuments({
    eventId: event._id,
    status: { $in: ['pending', 'confirmed', 'attended'] },
  });

  if (capacity > 0 && count >= capacity) {
    return res.status(400).json({ success: false, message: 'Event is full' });
  }

  const exists = await Registration.findOne({
    eventId: event._id,
    volunteerId: req.user._id,
  });
  if (exists) {
    return res.status(400).json({ success: false, message: 'Already registered' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Registration.create(
      [{ eventId: event._id, volunteerId: req.user._id }],
      { session }
    );
    await Event.findByIdAndUpdate(
      event._id,
      { $addToSet: { registeredVolunteers: req.user._id } },
      { session }
    );
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  res.status(201).json({
    success: true,
    message: 'Registered successfully',
  });
});

export const markAttendance = asyncHandler(async (req, res) => {
  if (req.user.role !== 'coordinator') {
    return res.status(403).json({
      success: false,
      message: 'Only assigned coordinators can mark attendance',
    });
  }

  const event = await Event.findById(req.params.id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (!event.coordinatorId || event.coordinatorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Only the assigned coordinator can mark attendance for this event',
    });
  }

  const { volunteerIds } = req.body;
  if (!Array.isArray(volunteerIds) || volunteerIds.length === 0) {
    return res.status(400).json({ success: false, message: 'volunteerIds array required' });
  }

  await Registration.updateMany(
    {
      eventId: event._id,
      volunteerId: { $in: volunteerIds },
    },
    { status: 'attended', attendedAt: new Date() }
  );

  res.json({
    success: true,
    message: 'Attendance marked',
  });
});

function formatEvent(event) {
  const ngoName =
    event.ngoId?.name || (event.ngoId && typeof event.ngoId === 'object' ? event.ngoId.name : null);
  return {
    ...event,
    id: event._id,
    ngoName: ngoName || 'NGO',
  };
}
