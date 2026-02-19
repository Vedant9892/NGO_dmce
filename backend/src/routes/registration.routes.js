import express from 'express';
import {
  approveRegistration,
  rejectRegistration,
  offerRole,
  acceptOffer,
  declineOffer,
} from '../controllers/registration.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { allowRoles } from '../middlewares/role.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.put(
  '/:id/approve',
  protect,
  allowRoles('coordinator'),
  asyncHandler(approveRegistration)
);

router.put(
  '/:id/reject',
  protect,
  allowRoles('coordinator'),
  asyncHandler(rejectRegistration)
);

router.put(
  '/:id/offer-role',
  protect,
  allowRoles('coordinator'),
  asyncHandler(offerRole)
);

router.put(
  '/:id/accept-offer',
  protect,
  allowRoles('volunteer'),
  asyncHandler(acceptOffer)
);

router.put(
  '/:id/decline-offer',
  protect,
  allowRoles('volunteer'),
  asyncHandler(declineOffer)
);

export default router;
