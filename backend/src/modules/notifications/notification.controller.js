import { Notification } from './notification.model.js';
import { Event } from '../../models/Event.model.js';
import {
  createNotification,
  getEventVolunteerIds,
  NOTIFICATION_TYPES,
} from './notification.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[a-fA-F0-9]{24}$/.test(id);
}

async function assertCoordinatorForEvent(coordinatorId, eventId, res) {
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404).json({ success: false, message: 'Event not found' });
    return null;
  }
  if (
    !event.coordinatorId ||
    event.coordinatorId.toString() !== coordinatorId.toString()
  ) {
    res.status(403).json({
      success: false,
      message: 'Not authorized. You must be the assigned coordinator for this event.',
    });
    return null;
  }
  return event;
}

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .populate('sender', 'name')
    .populate('eventId', 'title date')
    .lean();

  res.json({
    success: true,
    data: notifications.map((n) => ({ ...n, id: n._id })),
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  )
    .populate('sender', 'name')
    .populate('eventId', 'title date')
    .lean();

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.json({
    success: true,
    data: { ...notification, id: notification._id },
  });
});

export const sendDirect = asyncHandler(async (req, res) => {
  const { recipientId, eventId, title, message } = req.body;

  if (!recipientId || !eventId || !title || !message) {
    return res.status(400).json({
      success: false,
      message: 'recipientId, eventId, title, and message are required',
    });
  }

  if (!isValidObjectId(recipientId) || !isValidObjectId(eventId)) {
    return res.status(400).json({ success: false, message: 'Invalid IDs' });
  }

  const event = await assertCoordinatorForEvent(req.user._id, eventId, res);
  if (!event) return;

  const volunteerIds = await getEventVolunteerIds(eventId);
  const isRegistered = volunteerIds.some(
    (id) => id && id.toString() === recipientId
  );
  if (!isRegistered) {
    return res.status(400).json({
      success: false,
      message: 'Recipient must be registered for this event',
    });
  }

  const notification = await createNotification({
    recipient: recipientId,
    sender: req.user._id,
    eventId,
    type: NOTIFICATION_TYPES[0],
    title: title.trim(),
    message: message.trim(),
  });

  const populated = await Notification.findById(notification._id)
    .populate('recipient', 'name email')
    .populate('sender', 'name')
    .populate('eventId', 'title date')
    .lean();

  res.status(201).json({
    success: true,
    data: { ...populated, id: populated._id },
  });
});

export const sendBroadcast = asyncHandler(async (req, res) => {
  const { eventId, title, message } = req.body;

  if (!eventId || !title || !message) {
    return res.status(400).json({
      success: false,
      message: 'eventId, title, and message are required',
    });
  }

  if (!isValidObjectId(eventId)) {
    return res.status(400).json({ success: false, message: 'Invalid eventId' });
  }

  const event = await assertCoordinatorForEvent(req.user._id, eventId, res);
  if (!event) return;

  const volunteerIds = await getEventVolunteerIds(eventId);
  if (volunteerIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No volunteers registered for this event',
    });
  }

  const notifications = await Notification.insertMany(
    volunteerIds.map((recipient) => ({
      recipient,
      sender: req.user._id,
      eventId,
      type: NOTIFICATION_TYPES[1],
      title: title.trim(),
      message: message.trim(),
    }))
  );

  res.status(201).json({
    success: true,
    message: `Notification sent to ${notifications.length} volunteer(s)`,
    count: notifications.length,
  });
});

export const sendEmergency = asyncHandler(async (req, res) => {
  const { eventId, title, message } = req.body;

  if (!eventId || !title || !message) {
    return res.status(400).json({
      success: false,
      message: 'eventId, title, and message are required',
    });
  }

  if (!isValidObjectId(eventId)) {
    return res.status(400).json({ success: false, message: 'Invalid eventId' });
  }

  const event = await assertCoordinatorForEvent(req.user._id, eventId, res);
  if (!event) return;

  const volunteerIds = await getEventVolunteerIds(eventId);
  if (volunteerIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No volunteers registered for this event',
    });
  }

  const notifications = await Notification.insertMany(
    volunteerIds.map((recipient) => ({
      recipient,
      sender: req.user._id,
      eventId,
      type: NOTIFICATION_TYPES[2],
      title: title.trim(),
      message: message.trim(),
    }))
  );

  res.status(201).json({
    success: true,
    message: `Emergency alert sent to ${notifications.length} volunteer(s)`,
    count: notifications.length,
  });
});
