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

function parseEventRoles(val) {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((r) => ({
      title: typeof r === 'string' ? r : (r?.title || ''),
      requiredSkills: Array.isArray(r?.requiredSkills) ? r.requiredSkills : parseArrayField(r?.requiredSkills || []),
      slots: parseInt(r?.slots, 10) || 0,
      filledSlots: parseInt(r?.filledSlots, 10) || 0,
    })).filter((r) => r.title);
  }
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return parseEventRoles(parsed);
    } catch {
      return [];
    }
  }
  return [];
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
    volunteersRequired: bodyVolunteersRequired,
    eventRoles: bodyEventRoles,
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

  const eventRoles = parseEventRoles(bodyEventRoles);
  const totalFromRoles = eventRoles.reduce((s, r) => s + (r.slots || 0), 0);
  const volunteersRequired =
    totalFromRoles > 0 ? totalFromRoles : parseInt(bodyVolunteersRequired, 10) || 0;

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
    volunteersRequired,
    eventRoles: eventRoles.length > 0 ? eventRoles : undefined,
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
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  const event = await Event.findById(id);
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
    'eventRoles',
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
    } else if (key === 'eventRoles') {
      const parsed = parseEventRoles(req.body[key]);
      if (parsed.length > 0) {
        updates.eventRoles = parsed;
        updates.volunteersRequired = parsed.reduce((s, r) => s + (r.slots || 0), 0);
      }
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

  const updated = await Event.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('ngoId', 'name email')
    .populate('coordinatorId', 'name email')
    .lean();

  res.json({ success: true, data: formatEvent(updated) });
});

const VALID_MODES = ['Online', 'Offline', 'Hybrid'];

function buildEventFilters(query) {
  const filter = {};
  const mode = query?.mode;
  if (mode && typeof mode === 'string' && VALID_MODES.includes(mode)) {
    filter.mode = mode;
  }
  const city = query?.city;
  if (city && typeof city === 'string' && city.trim()) {
    filter.location = { $regex: city.trim(), $options: 'i' };
  }
  const trending = query?.trending;
  if (trending === 'true' || trending === true) {
    filter.trending = true;
  } else if (trending === 'false' || trending === false) {
    filter.trending = false;
  }
  return filter;
}

export const getEvents = asyncHandler(async (req, res) => {
  const filter = buildEventFilters(req.query);
  const events = await Event.find(filter)
    .populate('ngoId', 'name')
    .sort({ date: 1 })
    .lean();

  const result = [];
  for (const ev of events) {
    if (!ev || !ev._id) continue;
    const count = await Registration.countDocuments({
      eventId: ev._id,
      status: { $in: ['pending', 'approved', 'role_offered', 'confirmed', 'attended'] },
    });
    result.push(formatEvent({ ...ev, volunteersRegistered: count }));
  }

  res.json({
    success: true,
    data: result,
    events: result,
  });
});

function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[a-fA-F0-9]{24}$/.test(id);
}

export const getEventById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  const event = await Event.findById(id)
    .populate('ngoId', 'name email')
    .populate('coordinatorId', 'name email')
    .lean();

  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const registrations = await Registration.countDocuments({
    eventId: event._id,
    status: { $in: ['pending', 'approved', 'role_offered', 'confirmed', 'attended'] },
  });

  let myRegistrationStatus = null;
  if (req.user?.role === 'volunteer') {
    const myReg = await Registration.findOne({
      eventId: event._id,
      volunteerId: req.user._id,
    }).select('status').lean();
    if (myReg) myRegistrationStatus = myReg.status;
  }

  const formatted = formatEvent(event, registrations);
  const data = { ...formatted, volunteersRegistered: registrations };
  if (myRegistrationStatus) data.myRegistrationStatus = myRegistrationStatus;

  res.json({ success: true, data });
});

export const registerForEvent = asyncHandler(async (req, res) => {
  if (req.user.role !== 'volunteer') {
    return res.status(403).json({
      success: false,
      message: 'Only volunteers can register for events',
    });
  }
  const id = req.params.id;
  const appliedRole = typeof req.body?.appliedRole === 'string' ? req.body.appliedRole.trim() : null;

  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const rawEventRoles = event.eventRoles || [];
  const eventRoles = rawEventRoles.filter((r) => r && (r.title ?? '').trim());
  const hasRolesWithSlots = eventRoles.some((r) => (r.slots ?? 0) > 0);
  const usesEventRoles = eventRoles.length > 0 && hasRolesWithSlots;

  if (usesEventRoles) {
    if (!appliedRole) {
      return res.status(400).json({
        success: false,
        message: 'appliedRole is required when event has role-based slots',
      });
    }
    const roleDef = eventRoles.find((r) => r.title.trim().toLowerCase() === appliedRole.toLowerCase());
    if (!roleDef) {
      const validRoleNames = eventRoles.map((r) => r.title).filter(Boolean).join(', ') || 'Volunteer';
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoleNames}`,
      });
    }
    const filled = roleDef.filledSlots ?? 0;
    const slots = roleDef.slots ?? 0;
    if (filled >= slots) {
      return res.status(400).json({
        success: false,
        message: `Role "${roleDef.title}" has no slots available`,
      });
    }
  } else {
    const capacity = event.volunteersRequired || 0;
    const count = await Registration.countDocuments({
      eventId: event._id,
      status: { $in: ['pending', 'approved', 'role_offered', 'confirmed', 'attended'] },
    });
    if (capacity > 0 && count >= capacity) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }
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
      [{ eventId: event._id, volunteerId: req.user._id, appliedRole: usesEventRoles ? appliedRole : undefined, status: 'pending' }],
      { session }
    );
    await Event.findByIdAndUpdate(
      event._id,
      { $addToSet: { registeredVolunteers: req.user._id } },
      { session }
    );
    // filledSlots incremented on coordinator approval, not on registration
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
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }
  const event = await Event.findById(id);
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

export const markSelfAttendance = asyncHandler(async (req, res) => {
  if (req.user.role !== 'volunteer') {
    return res.status(403).json({
      success: false,
      message: 'Only volunteers can self-mark attendance',
    });
  }

  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const { code, method = 'code', latitude, longitude } = req.body;
  const codeStr = typeof code === 'string' ? code.trim().toUpperCase() : '';
  if (!codeStr) {
    return res.status(400).json({
      success: false,
      message: 'Attendance code is required',
    });
  }

  if (event.attendanceCode !== codeStr) {
    return res.status(400).json({
      success: false,
      message: 'Invalid attendance code',
    });
  }

  const registration = await Registration.findOne({
    eventId: event._id,
    volunteerId: req.user._id,
  });

  if (!registration) {
    return res.status(400).json({
      success: false,
      message: 'You are not registered for this event',
    });
  }

  if (!['approved', 'confirmed'].includes(registration.status)) {
    return res.status(400).json({
      success: false,
      message: 'Your registration must be approved before marking attendance',
    });
  }

  if (registration.status === 'attended') {
    return res.status(400).json({
      success: false,
      message: 'Attendance already marked',
    });
  }

  const markedMethod = ['qr', 'code'].includes(method) ? method : 'code';
  let markedLocation = null;
  if (latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)) {
    markedLocation = `${latitude},${longitude}`;
  }

  const now = new Date();
  await Registration.findByIdAndUpdate(registration._id, {
    status: 'attended',
    attendedAt: now,
    markedAt: now,
    markedLocation,
    markedMethod,
  });

  res.json({
    success: true,
    message: 'Attendance marked successfully',
  });
});

function formatEvent(event, registrationsCount = null) {
  const ngoName =
    event.ngoId?.name || (event.ngoId && typeof event.ngoId === 'object' ? event.ngoId.name : null);
  const volunteersRegistered = registrationsCount ?? event.volunteersRegistered ?? 0;
  const eventRoles = event.eventRoles || [];
  const hasRolesWithSlots = eventRoles.some((r) => (r.slots ?? 0) > 0);
  let eventRolesFormatted = eventRoles;
  if (eventRoles.length === 0 || !hasRolesWithSlots) {
    const defaultSlots = Math.max(event.volunteersRequired || 1, 1);
    eventRolesFormatted = [{ title: 'Volunteer', slots: defaultSlots, filledSlots: volunteersRegistered }];
  }
  return {
    ...event,
    id: event._id,
    ngoName: ngoName || 'NGO',
    eventRoles: eventRolesFormatted,
  };
}
