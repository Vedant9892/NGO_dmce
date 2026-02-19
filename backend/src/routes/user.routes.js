import express from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);

router.put(
  '/profile',
  allowRoles('volunteer'),
  updateProfile
);

export default router;
