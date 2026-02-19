import { Event } from '../models/Event.model.js';
import { Registration } from '../models/Registration.model.js';
import { User } from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPlatformStats = asyncHandler(async (req, res) => {
  const [totalEvents, totalVolunteers, totalNGOs] = await Promise.all([
    Event.countDocuments(),
    User.countDocuments({ role: 'volunteer' }),
    User.countDocuments({ role: 'ngo' }),
  ]);

  res.json({
    success: true,
    totalEvents,
    totalVolunteers,
    totalNGOs,
  });
});
