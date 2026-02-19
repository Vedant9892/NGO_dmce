import express from 'express';
import { getEvents, getEventVolunteers } from '../controllers/coordinator.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(protect, allowRoles('coordinator'));

router.get('/events/:eventId/volunteers', getEventVolunteers);
router.get('/events', getEvents);

export default router;
