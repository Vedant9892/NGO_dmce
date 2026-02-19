import express from 'express';
import { getStats, getEvents, getCertificates } from '../controllers/volunteer.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(protect, allowRoles('volunteer'));

router.get('/stats', getStats);
router.get('/events', getEvents);
router.get('/certificates', getCertificates);

export default router;
