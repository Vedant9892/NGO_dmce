import express from 'express';
import { sendCertificates } from '../controllers/certificate.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

// Both NGO admins and coordinators can trigger certificate sending
router.post('/:eventId/send', protect, allowRoles('ngo', 'coordinator'), sendCertificates);

export default router;
