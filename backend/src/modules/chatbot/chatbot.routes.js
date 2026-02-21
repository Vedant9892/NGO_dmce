import express from 'express';
import { handleChatMessage } from './chatbot.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * POST /api/chatbot/message
 * Auth is optional: logged-in users get role-aware answers,
 * guests get general 'all' role answers.
 *
 * We use a custom optional-auth middleware rather than the strict protect.
 */
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  // Delegate to the strict protect middleware but swallow 401s
  protect(req, res, (err) => {
    // Even if token is invalid, continue as guest
    next();
  });
};

router.post('/message', optionalAuth, handleChatMessage);

export default router;
