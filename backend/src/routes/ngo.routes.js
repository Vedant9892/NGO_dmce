import express from 'express';
import { getStats, getEvents, getRegistrations } from '../controllers/ngo.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(protect, allowRoles('ngo'));

router.get('/stats', getStats);
router.get('/events', getEvents);
router.get('/registrations', getRegistrations);

export default router;
