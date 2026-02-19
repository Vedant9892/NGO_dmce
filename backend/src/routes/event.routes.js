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

// IMPORTANT: Static routes MUST come before dynamic :id routes.
// GET /api/events must hit getEvents, not getEventById.
router.get('/', getEvents);

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

// Dynamic :id routes (after all static routes)
router.get('/:id', getEventById);

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
