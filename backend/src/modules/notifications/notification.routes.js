import express from 'express';
import {
  getNotifications,
  markAsRead,
  sendDirect,
  sendBroadcast,
  sendEmergency,
} from './notification.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { allowRoles } from '../../middlewares/role.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.use(protect);

// Static routes before dynamic :id
router.get('/', asyncHandler(getNotifications));
router.post('/direct', allowRoles('coordinator'), asyncHandler(sendDirect));
router.post('/broadcast', allowRoles('coordinator'), asyncHandler(sendBroadcast));
router.post('/emergency', allowRoles('coordinator'), asyncHandler(sendEmergency));

router.patch('/:id/read', asyncHandler(markAsRead));

export default router;
