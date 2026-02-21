import { getChatbotAnswer } from './chatbot.service.js';

/**
 * POST /api/chatbot/message
 *
 * Body: { question: string }
 * Auth: optional — if JWT present, role is read from req.user; otherwise 'guest'
 */
export const handleChatMessage = async (req, res) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ success: false, message: 'question is required.' });
  }

  // Derive role from authenticated user or default to 'guest'
  let userRole = 'guest';
  if (req.user) {
    // Normalize backend role values to chatbot role names
    const roleMap = {
      volunteer: 'volunteer',
      organizer: 'organizer',
      coordinator: 'organizer',
      admin: 'admin',
      ngo: 'admin',
    };
    userRole = roleMap[req.user.role?.toLowerCase()] ?? 'volunteer';
  }

  const { answer, fallback } = await getChatbotAnswer(question.trim(), userRole);

  return res.json({
    success: true,
    role: userRole,
    answer,
    ...(fallback ? { notice: 'AI service unavailable — showing best matching content.' } : {}),
  });
};
