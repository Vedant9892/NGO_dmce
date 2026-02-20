import express from 'express';
import { getNotifications, markAsRead } from './notification.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(getNotifications));
router.patch('/:id/read', asyncHandler(markAsRead));

export default router;
