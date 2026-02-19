import { Event } from '../models/Event.model.js';
import { Registration } from '../models/Registration.model.js';
import { User } from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPlatformStats = asyncHandler(async (req, res) => {
  const [
    totalEvents,
    totalNGOs,
    totalVolunteers,
    registrationStats,
    citiesResult,
    trendingEvents,
  ] = await Promise.all([
    Event.countDocuments(),
    User.countDocuments({ role: 'ngo' }),
    User.countDocuments({ role: 'volunteer' }),
    Registration.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          attended: [{ $match: { status: 'attended' } }, { $count: 'count' }],
        },
      },
      {
        $project: {
          totalRegistrations: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
          totalAttendanceMarked: { $ifNull: [{ $arrayElemAt: ['$attended.count', 0] }, 0] },
        },
      },
    ]),
    Event.distinct('location', {
      location: { $exists: true, $nin: [null, ''] },
    }),
    Event.aggregate([
      {
        $match: {
          volunteersRequired: { $gt: 0 },
          $expr: {
            $gte: [
              { $size: { $ifNull: ['$registeredVolunteers', []] } },
              { $multiply: ['$volunteersRequired', 0.7] },
            ],
          },
        },
      },
      {
        $project: {
          id: { $toString: '$_id' },
          _id: 1,
          title: 1,
          location: 1,
          date: 1,
          volunteersRequired: 1,
          registeredCount: { $size: { $ifNull: ['$registeredVolunteers', []] } },
          bannerImage: 1,
          description: 1,
        },
      },
      { $sort: { date: -1 } },
      { $limit: 20 },
    ]),
  ]);

  const totalRegistrations = registrationStats[0]?.totalRegistrations ?? 0;
  const totalAttendanceMarked = registrationStats[0]?.totalAttendanceMarked ?? 0;
  const attendanceRate =
    totalRegistrations > 0
      ? Math.round((totalAttendanceMarked / totalRegistrations) * 100 * 100) / 100
      : 0;

  const citiesCovered = Array.isArray(citiesResult)
    ? citiesResult.filter((loc) => loc && String(loc).trim()).length
    : 0;

  res.json({
    success: true,
    totalEvents,
    totalNGOs,
    totalVolunteers,
    totalRegistrations,
    totalAttendanceMarked,
    attendanceRate,
    citiesCovered,
    trendingEvents,
  });
});
