import { Notification, NOTIFICATION_TYPES } from './notification.model.js';
import { Registration } from '../../models/Registration.model.js';

/**
 * Create a notification.
 * @param {Object} params
 * @param {import('mongoose').Types.ObjectId} params.recipient
 * @param {import('mongoose').Types.ObjectId} params.sender
 * @param {import('mongoose').Types.ObjectId} params.eventId
 * @param {string} params.type - DIRECT_MESSAGE | EVENT_BROADCAST | EMERGENCY_ALERT
 * @param {string} params.title
 * @param {string} params.message
 */
export async function createNotification({ recipient, sender, eventId, type, title, message }) {
  const doc = await Notification.create({
    recipient,
    sender,
    eventId,
    type,
    title,
    message,
  });
  return doc;
}

/**
 * Get volunteer IDs registered for an event (active registrations).
 */
export async function getEventVolunteerIds(eventId) {
  const regs = await Registration.find({
    eventId,
    status: { $in: ['pending', 'approved', 'role_offered', 'confirmed', 'attended'] },
  })
    .select('volunteerId')
    .lean();
  return regs.map((r) => r.volunteerId);
}

export { NOTIFICATION_TYPES };
