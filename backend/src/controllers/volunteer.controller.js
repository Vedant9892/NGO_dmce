import { Registration } from '../models/Registration.model.js';
import { Event } from '../models/Event.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const volunteerId = req.user._id;

  const regs = await Registration.find({
    volunteerId,
    status: { $in: ['pending', 'approved', 'role_offered', 'confirmed', 'attended'] },
  })
    .populate('eventId')
    .lean();

  const totalJoined = regs.length;
  const completed = regs.filter((r) => r.status === 'attended').length;
  const upcoming = regs.filter(
    (r) =>
      ['pending', 'approved', 'role_offered', 'confirmed'].includes(r.status) &&
      r.eventId &&
      new Date(r.eventId.date) >= new Date()
  ).length;

  const statsData = {
    totalEventsJoined: totalJoined,
    totalHoursVolunteered: completed * 4,
    upcomingEvents: upcoming,
    completedEvents: completed,
  };
  res.json({ success: true, ...statsData });
});

export const getCertificates = asyncHandler(async (req, res) => {
  const regs = await Registration.find({
    volunteerId: req.user._id,
    status: 'attended',
  })
    .populate({ path: 'eventId', populate: { path: 'ngoId', select: 'name' } })
    .lean();

  const certificates = regs
    .filter((r) => r.eventId)
    .map((r) => ({
      id: r._id,
      eventName: r.eventId.title,
      ngoName: r.eventId.ngoId?.name || 'NGO',
      date: r.attendedAt || r.createdAt,
      hours: 4,
    }));

  res.json({ success: true, certificates });
});

export const getEvents = asyncHandler(async (req, res) => {
  const volunteerId = req.user._id;

  const regs = await Registration.find({
    volunteerId,
    status: { $in: ['pending', 'approved', 'role_offered', 'confirmed', 'attended'] },
  })
    .populate({
      path: 'eventId',
      populate: { path: 'ngoId', select: 'name' },
    })
    .lean();

  const registered = [];
  const completed = [];

  for (const r of regs) {
    if (!r.eventId) continue;
    const ev = {
      ...r.eventId,
      id: r.eventId._id,
      ngoName: r.eventId.ngoId?.name || 'NGO',
      appliedRole: r.appliedRole || null,
      offeredRole: r.offeredRole || null,
      registrationStatus: r.status,
      registrationId: r._id,
    };
    if (r.status === 'attended') {
      completed.push(ev);
    } else {
      registered.push(ev);
    }
  }

  res.json({
    success: true,
    registered,
    completed,
  });
});
