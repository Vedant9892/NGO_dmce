import { Notification } from './notification.model.js';

/**
 * Create a notification.
 * @param {Object} params
 * @param {import('mongoose').Types.ObjectId} params.recipient
 * @param {string} params.type
 * @param {string} params.title
 * @param {string} params.message
 * @param {import('mongoose').Types.ObjectId} [params.relatedEvent]
 * @param {import('mongoose').Types.ObjectId} [params.relatedRegistration]
 */
export async function createNotification({
  recipient,
  type,
  title,
  message,
  relatedEvent,
  relatedRegistration,
}) {
  const doc = await Notification.create({
    recipient,
    type,
    title,
    message,
    ...(relatedEvent && { relatedEvent }),
    ...(relatedRegistration && { relatedRegistration }),
  });
  return doc;
}
