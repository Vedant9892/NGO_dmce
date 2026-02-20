import mongoose from 'mongoose';
import { Event } from '../models/Event.model.js';
import { Registration } from '../models/Registration.model.js';
import { createNotification } from '../modules/notifications/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function isValidObjectId(id) {
  if (!id || typeof id !== 'string') return false;
  return /^[a-fA-F0-9]{24}$/.test(id);
}

function findEventRoleIndex(eventRoles, roleTitle) {
  if (!roleTitle || !Array.isArray(eventRoles)) return -1;
  return eventRoles.findIndex(
    (r) => r.title && r.title.trim().toLowerCase() === roleTitle.trim().toLowerCase()
  );
}

function getRoleSlotsInfo(eventRoles, roleTitle) {
  const idx = findEventRoleIndex(eventRoles, roleTitle);
  if (idx < 0) return null;
  const r = eventRoles[idx];
  return { index: idx, filled: r.filledSlots ?? 0, slots: r.slots ?? 0 };
}

export const approveRegistration = asyncHandler(async (req, res) => {
  if (req.user.role !== 'coordinator') {
    return res.status(403).json({ success: false, message: 'Only coordinators can approve registrations' });
  }

  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  const reg = await Registration.findById(id);
  if (!reg) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  const event = await Event.findById(reg.eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (!event.coordinatorId || event.coordinatorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to approve registrations for this event' });
  }

  if (reg.status === 'approved' || reg.status === 'confirmed' || reg.status === 'attended') {
    return res.status(400).json({ success: false, message: 'Already approved' });
  }

  if (reg.status === 'rejected' || reg.status === 'declined') {
    return res.status(400).json({ success: false, message: 'Cannot approve a rejected or declined registration' });
  }

  const eventRoles = event.eventRoles || [];
  const appliedRole = reg.appliedRole;

  if (eventRoles.length > 0 && appliedRole) {
    const roleInfo = getRoleSlotsInfo(eventRoles, appliedRole);
    if (!roleInfo) {
      return res.status(400).json({ success: false, message: `Role "${appliedRole}" not found in event` });
    }
    if (roleInfo.filled >= roleInfo.slots) {
      return res.status(400).json({ success: false, message: `Role "${appliedRole}" has no slots available` });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await Registration.findByIdAndUpdate(id, { status: 'approved' }, { session });
      const key = `eventRoles.${roleInfo.index}.filledSlots`;
      await Event.findByIdAndUpdate(event._id, { $inc: { [key]: 1 } }, { session });
      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } else {
    await Registration.findByIdAndUpdate(id, { status: 'approved' });
  }

  const updated = await Registration.findById(id).populate('volunteerId', 'name email').lean();

  try {
    await createNotification({
      recipient: reg.volunteerId,
      type: 'registration_approved',
      title: 'Registration approved',
      message: `Your registration for "${event.title}" has been approved.`,
      relatedEvent: event._id,
      relatedRegistration: reg._id,
    });
  } catch {
    // Don't fail the response if notification fails
  }

  res.json({ success: true, data: { ...updated, id: updated._id } });
});

export const rejectRegistration = asyncHandler(async (req, res) => {
  if (req.user.role !== 'coordinator') {
    return res.status(403).json({ success: false, message: 'Only coordinators can reject registrations' });
  }

  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  const reg = await Registration.findById(id);
  if (!reg) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  const event = await Event.findById(reg.eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (!event.coordinatorId || event.coordinatorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized to reject registrations for this event' });
  }

  if (['approved', 'confirmed', 'attended', 'rejected', 'declined'].includes(reg.status)) {
    return res.status(400).json({ success: false, message: 'Cannot reject this registration' });
  }

  await Registration.findByIdAndUpdate(id, { status: 'rejected' });
  const updated = await Registration.findById(id).populate('volunteerId', 'name email').lean();

  try {
    await createNotification({
      recipient: reg.volunteerId,
      type: 'registration_rejected',
      title: 'Registration rejected',
      message: `Your registration for "${event.title}" has been rejected.`,
      relatedEvent: event._id,
      relatedRegistration: reg._id,
    });
  } catch {
    // Don't fail the response if notification fails
  }

  res.json({ success: true, data: { ...updated, id: updated._id } });
});

export const offerRole = asyncHandler(async (req, res) => {
  if (req.user.role !== 'coordinator') {
    return res.status(403).json({ success: false, message: 'Only coordinators can offer roles' });
  }

  const id = req.params.id;
  const offeredRole = typeof req.body?.offeredRole === 'string' ? req.body.offeredRole.trim() : null;

  if (!offeredRole) {
    return res.status(400).json({ success: false, message: 'offeredRole is required' });
  }

  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  const reg = await Registration.findById(id);
  if (!reg) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  const event = await Event.findById(reg.eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  if (!event.coordinatorId || event.coordinatorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized for this event' });
  }

  const eventRoles = event.eventRoles || [];
  const roleInfo = getRoleSlotsInfo(eventRoles, offeredRole);
  if (!roleInfo) {
    return res.status(400).json({ success: false, message: `Role "${offeredRole}" not found in event` });
  }
  if (roleInfo.filled >= roleInfo.slots) {
    return res.status(400).json({ success: false, message: `Role "${offeredRole}" has no slots available` });
  }

  if (reg.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Can only offer role for pending registrations' });
  }

  await Registration.findByIdAndUpdate(id, { status: 'role_offered', offeredRole });
  const updated = await Registration.findById(id).populate('volunteerId', 'name email').lean();

  try {
    await createNotification({
      recipient: reg.volunteerId,
      type: 'role_offered',
      title: 'Role offered',
      message: `You have been offered the role "${offeredRole}" for "${event.title}". Please accept or decline.`,
      relatedEvent: event._id,
      relatedRegistration: reg._id,
    });
  } catch {
    // Don't fail the response if notification fails
  }

  res.json({ success: true, data: { ...updated, id: updated._id } });
});

export const acceptOffer = asyncHandler(async (req, res) => {
  if (req.user.role !== 'volunteer') {
    return res.status(403).json({ success: false, message: 'Only volunteers can accept offers' });
  }

  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  const reg = await Registration.findById(id);
  if (!reg) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  if (reg.volunteerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not your registration' });
  }

  if (reg.status !== 'role_offered') {
    return res.status(400).json({ success: false, message: 'No offer to accept' });
  }

  const offeredRole = reg.offeredRole;
  if (!offeredRole) {
    return res.status(400).json({ success: false, message: 'Invalid offer' });
  }

  const event = await Event.findById(reg.eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  const eventRoles = event.eventRoles || [];
  const roleInfo = getRoleSlotsInfo(eventRoles, offeredRole);
  if (!roleInfo) {
    return res.status(400).json({ success: false, message: `Role "${offeredRole}" no longer available` });
  }
  if (roleInfo.filled >= roleInfo.slots) {
    return res.status(400).json({ success: false, message: `Role "${offeredRole}" has no slots available` });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await Registration.findByIdAndUpdate(id, { status: 'approved' }, { session });
    const key = `eventRoles.${roleInfo.index}.filledSlots`;
    await Event.findByIdAndUpdate(event._id, { $inc: { [key]: 1 } }, { session });
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }

  const updated = await Registration.findById(id).populate('volunteerId', 'name email').lean();

  try {
    if (event.coordinatorId) {
      await createNotification({
        recipient: event.coordinatorId,
        type: 'offer_accepted',
        title: 'Offer accepted',
        message: `${req.user.name} accepted the role for "${event.title}".`,
        relatedEvent: event._id,
        relatedRegistration: reg._id,
      });
    }
  } catch {
    // Don't fail the response if notification fails
  }

  res.json({ success: true, data: { ...updated, id: updated._id } });
});

export const declineOffer = asyncHandler(async (req, res) => {
  if (req.user.role !== 'volunteer') {
    return res.status(403).json({ success: false, message: 'Only volunteers can decline offers' });
  }

  const id = req.params.id;
  if (!isValidObjectId(id)) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  const reg = await Registration.findById(id);
  if (!reg) {
    return res.status(404).json({ success: false, message: 'Registration not found' });
  }

  if (reg.volunteerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not your registration' });
  }

  if (reg.status !== 'role_offered') {
    return res.status(400).json({ success: false, message: 'No offer to decline' });
  }

  const event = await Event.findById(reg.eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: 'Event not found' });
  }

  await Registration.findByIdAndUpdate(id, { status: 'declined' });
  const updated = await Registration.findById(id).populate('volunteerId', 'name email').lean();

  try {
    if (event.coordinatorId) {
      await createNotification({
        recipient: event.coordinatorId,
        type: 'offer_declined',
        title: 'Offer declined',
        message: `${req.user.name} declined the role for "${event.title}".`,
        relatedEvent: event._id,
        relatedRegistration: reg._id,
      });
    }
  } catch {
    // Don't fail the response if notification fails
  }

  res.json({ success: true, data: { ...updated, id: updated._id } });
});
