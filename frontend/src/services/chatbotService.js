import api from './api';

/**
 * Send a message to the RAG chatbot.
 *
 * @param {string} question
 * @returns {Promise<{ answer: string, role: string, sources: string[], notice?: string }>}
 */
export async function sendChatMessage(question) {
  const { data } = await api.post('/chatbot/message', { question });
  return data;
}
