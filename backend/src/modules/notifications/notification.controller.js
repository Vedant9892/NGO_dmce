import { Notification } from './notification.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[a-fA-F0-9]{24}$/.test(id);
}

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .populate('relatedEvent', 'title date')
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
  ).lean();

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.json({
    success: true,
    data: { ...notification, id: notification._id },
  });
});
