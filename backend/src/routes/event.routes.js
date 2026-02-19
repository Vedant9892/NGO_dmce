import express from 'express';
import {
  createEvent,
  updateEvent,
  getEvents,
  getEventById,
  registerForEvent,
  markAttendance,
  upload,
} from '../controllers/event.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);

router.post(
  '/',
  protect,
  allowRoles('ngo'),
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  createEvent
);

router.put(
  '/:id',
  protect,
  allowRoles('ngo', 'coordinator'),
  (req, res, next) => {
    upload(req, res, (err) => {
      if (err) return res.status(400).json({ success: false, message: err.message });
      next();
    });
  },
  updateEvent
);

router.post(
  '/:id/register',
  protect,
  allowRoles('volunteer'),
  asyncHandler(registerForEvent)
);

router.put(
  '/:id/attendance',
  protect,
  allowRoles('coordinator'),
  asyncHandler(markAttendance)
);

export default router;
