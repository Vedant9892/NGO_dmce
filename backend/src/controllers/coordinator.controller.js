import { Event } from '../models/Event.model.js';
import { Registration } from '../models/Registration.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getEventVolunteers = asyncHandler(async (req, res) => {
  const event = await Event.findOne({
    _id: req.params.eventId,
    coordinatorId: req.user._id,
  });
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found or not assigned to you',
    });
  }

  const regs = await Registration.find({
    eventId: event._id,
    status: { $in: ['pending', 'approved', 'role_offered', 'confirmed', 'attended', 'rejected', 'declined'] },
  })
    .populate('volunteerId', 'name email skills experienceLevel')
    .sort({ createdAt: -1 })
    .lean();

  const volunteers = regs.map((r) => ({
    id: r._id,
    volunteerId: r.volunteerId?._id,
    name: r.volunteerId?.name,
    email: r.volunteerId?.email,
    skills: r.volunteerId?.skills || [],
    experienceLevel: r.volunteerId?.experienceLevel || null,
    appliedRole: r.appliedRole || null,
    offeredRole: r.offeredRole || null,
    status: r.status,
    attendedAt: r.attendedAt,
  }));

  res.json({ success: true, data: volunteers });
});

export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ coordinatorId: req.user._id })
    .populate('ngoId', 'name')
    .sort({ date: -1 })
    .lean();

  const result = [];
  for (const ev of events) {
    const count = await Registration.countDocuments({
      eventId: ev._id,
      status: { $in: ['pending', 'approved', 'role_offered', 'confirmed', 'attended'] },
    });
    result.push({
      ...ev,
      id: ev._id,
      ngoName: ev.ngoId?.name || 'NGO',
      volunteersRegistered: count,
    });
  }

  res.json({
    success: true,
    data: result,
  });
});
