import { Event } from '../models/Event.model.js';
import { Registration } from '../models/Registration.model.js';
import { User } from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCoordinators = asyncHandler(async (req, res) => {
  const coordinators = await User.find({
    role: 'coordinator',
    createdBy: req.user._id,
  })
    .select('name email createdAt')
    .sort({ createdAt: -1 })
    .lean();

  const data = coordinators.map((c) => ({
    id: c._id,
    name: c.name,
    email: c.email,
    createdAt: c.createdAt,
  }));

  res.json({ success: true, data });
});

export const createCoordinator = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered',
    });
  }

  const organization = req.user.organization || req.user.name || 'NGO';

  const coordinator = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: 'coordinator',
    organization,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: {
      id: coordinator._id,
      name: coordinator.name,
      email: coordinator.email,
      createdAt: coordinator.createdAt,
    },
  });
});

export const deleteCoordinator = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coordinator = await User.findOne({
    _id: id,
    role: 'coordinator',
    createdBy: req.user._id,
  });
  if (!coordinator) {
    return res.status(404).json({
      success: false,
      message: 'Coordinator not found',
    });
  }

  await Event.updateMany(
    { coordinatorId: coordinator._id },
    { $set: { coordinatorId: null } }
  );

  await User.findByIdAndDelete(coordinator._id);

  res.json({ success: true, message: 'Coordinator deleted' });
});

export const getStats = asyncHandler(async (req, res) => {
  const ngoId = req.user._id;

  const events = await Event.find({ ngoId }).lean();
  const eventIds = events.map((e) => e._id);

  const [totalVolunteers, attendanceCount] = await Promise.all([
    Registration.distinct('volunteerId', {
      eventId: { $in: eventIds },
      status: { $in: ['pending', 'confirmed', 'attended'] },
    }).then((arr) => arr.length),
    Registration.countDocuments({
      eventId: { $in: eventIds },
      status: 'attended',
    }),
  ]);

  const totalRegs = await Registration.countDocuments({
    eventId: { $in: eventIds },
    status: { $in: ['pending', 'confirmed', 'attended'] },
  });

  const attendanceRate = totalRegs > 0 ? Math.round((attendanceCount / totalRegs) * 100) : 0;

  const statsData = {
    totalVolunteers,
    activeEvents: events.filter((e) => new Date(e.date) >= new Date()).length,
    attendanceRate,
    totalVolunteerHours: attendanceCount * 4,
  };
  res.json({ success: true, ...statsData });
});

export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ ngoId: req.user._id })
    .populate('coordinatorId', 'name email')
    .sort({ date: -1 })
    .lean();

  const result = [];
  for (const ev of events) {
    const count = await Registration.countDocuments({
      eventId: ev._id,
      status: { $in: ['pending', 'confirmed', 'attended'] },
    });
    result.push({
      ...ev,
      id: ev._id,
      ngoName: req.user.name,
      volunteersRegistered: count,
    });
  }

  res.json({
    success: true,
    data: result,
    events: result,
  });
});

export const getRegistrations = asyncHandler(async (req, res) => {
  const events = await Event.find({ ngoId: req.user._id }).select('_id');
  const eventIds = events.map((e) => e._id);

  const regs = await Registration.find({ eventId: { $in: eventIds } })
    .populate('volunteerId', 'name email')
    .populate('eventId', 'title')
    .sort({ createdAt: -1 })
    .lean();

  const data = regs.map((r) => ({
    id: r._id,
    volunteerName: r.volunteerId?.name,
    volunteerEmail: r.volunteerId?.email,
    eventName: r.eventId?.title,
    date: r.createdAt,
    status: r.status,
  }));

  res.json({
    success: true,
    data,
    registrations: data,
  });
});
