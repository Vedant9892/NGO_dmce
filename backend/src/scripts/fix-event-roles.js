/**
 * Fix events with malformed eventRoles (empty titles).
 * Run: node src/scripts/fix-event-roles.js
 */
import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { Event } from '../models/Event.model.js';
import { Registration } from '../models/Registration.model.js';

await connectDB();

const events = await Event.find({ eventRoles: { $exists: true, $ne: [] } }).lean();
let fixed = 0;

for (const event of events) {
  const roles = event.eventRoles || [];
  const validRoles = roles.filter((r) => r && (r.title ?? '').trim());
  const needsFix = validRoles.length !== roles.length;

  if (!needsFix) continue;

  let newRoles = validRoles;
  if (validRoles.length === 0) {
    const count = await Registration.countDocuments({
      eventId: event._id,
      status: { $in: ['pending', 'approved', 'role_offered', 'confirmed', 'attended'] },
    });
    newRoles = [{ title: 'Volunteer', slots: Math.max(event.volunteersRequired || 1, 1), filledSlots: count }];
  }

  await Event.findByIdAndUpdate(event._id, { eventRoles: newRoles });
  fixed++;
}

console.log(`Fixed ${fixed} event(s) with malformed roles.`);
process.exit(0);
