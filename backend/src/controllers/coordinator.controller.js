import { Event } from '../models/Event.model.js';
import { Registration } from '../models/Registration.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ coordinatorId: req.user._id })
    .populate('ngoId', 'name')
    .sort({ date: -1 })
    .lean();

  const result = [];
  for (const ev of events) {
    const count = await Registration.countDocuments({
      eventId: ev._id,
      status: { $in: ['confirmed', 'attended'] },
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
