import { knowledgeChunks } from './knowledge/platformKnowledge.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

// ─── TF-IDF Retrieval ─────────────────────────────────────────────────────

/**
 * Tokenise text into lowercase words (strips punctuation).
 */
function tokenise(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Compute Term Frequency for an array of tokens.
 */
function computeTF(tokens) {
  const tf = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  const total = tokens.length || 1;
  for (const t in tf) tf[t] /= total;
  return tf;
}

/**
 * Build IDF map over all chunks so common words score lower.
 */
function buildIDF(chunks) {
  const docCount = chunks.length;
  const df = {};
  for (const chunk of chunks) {
    const unique = new Set(tokenise(`${chunk.title} ${chunk.content}`));
    for (const t of unique) df[t] = (df[t] || 0) + 1;
  }
  const idf = {};
  for (const t in df) idf[t] = Math.log((docCount + 1) / (df[t] + 1)) + 1;
  return idf;
}

const IDF = buildIDF(knowledgeChunks);

/**
 * TF-IDF vector for a list of tokens.
 */
function tfidfVector(tokens) {
  const tf = computeTF(tokens);
  const vec = {};
  for (const t in tf) vec[t] = tf[t] * (IDF[t] || 1);
  return vec;
}

/**
 * Cosine similarity between two sparse vectors (plain objects).
 */
function cosineSim(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (const t in a) {
    normA += a[t] ** 2;
    if (b[t]) dot += a[t] * b[t];
  }
  for (const t in b) normB += b[t] ** 2;
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Pre-compute chunk vectors once at startup
const chunkVectors = knowledgeChunks.map((chunk) => ({
  chunk,
  vec: tfidfVector(tokenise(`${chunk.title} ${chunk.content}`)),
}));

/**
 * Retrieve top-k relevant knowledge chunks for a query, filtered by user role.
 * Role 'all' chunks are always eligible; role-specific chunks only for that role.
 *
 * @param {string} query
 * @param {string} userRole  – 'volunteer' | 'organizer' | 'admin' | 'guest'
 * @param {number} topK
 */
export function retrieveChunks(query, userRole = 'volunteer', topK = 4) {
  const normRole = userRole?.toLowerCase().trim();
  const queryVec = tfidfVector(tokenise(query));

  const eligible = chunkVectors.filter(
    ({ chunk }) => chunk.role === 'all' || chunk.role === normRole
  );

  const scored = eligible.map(({ chunk, vec }) => ({
    chunk,
    score: cosineSim(queryVec, vec),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(({ chunk }) => chunk);
}

// ─── RAG Prompt Builder ───────────────────────────────────────────────────

function buildSystemPrompt(role, retrievedChunks) {
  const context = retrievedChunks
    .map((c, i) => `[${i + 1}] ${c.title}\n${c.content}`)
    .join('\n\n');

  return `You are an AI assistant for the NGO_dmce volunteer management platform.

You are given:
1) The role of the user: ${role}
2) Context chunks retrieved from the platform documentation
3) The user's question

Instructions:
- Answer ONLY based on the provided context chunks below.
- Adapt the response based on the user's role (${role}).
- Provide clear, concise, step-by-step instructions when asked how to do something.
- If the action is outside the user's role permissions, respond with: "This feature is available only for [required role]."
- If the answer is not found in the context, say: "I don't have information about that. Please contact the platform administrator."
- Keep answers friendly, short, and easy to follow.
- Do NOT make up features or steps that are not in the context.

--- CONTEXT START ---
${context}
--- CONTEXT END ---`;
}

// ─── LLM Call (Groq) ─────────────────────────────────────────────────────

async function callGroq(systemPrompt, userMessage) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set in environment variables.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? 'No response from AI.';
}

// ─── Fallback (no API key) ────────────────────────────────────────────────

function fallbackAnswer(retrieved, query) {
  if (retrieved.length === 0) {
    return "I don't have information about that topic. Please contact the platform administrator.";
  }
  const top = retrieved[0];
  return `**${top.title}**\n\n${top.content}`;
}

// ─── Main Service Function ────────────────────────────────────────────────

/**
 * Generate a RAG-based chatbot response.
 *
 * @param {string} question   – user's message
 * @param {string} userRole   – volunteer | organizer | admin | guest
 * @returns {Promise<{ answer: string, sources: string[] }>}
 */
export async function getChatbotAnswer(question, userRole = 'guest') {
  const retrieved = retrieveChunks(question, userRole, 4);
  const sources = retrieved.map((c) => c.title);

  try {
    const systemPrompt = buildSystemPrompt(userRole, retrieved);
    const answer = await callGroq(systemPrompt, question);
    return { answer, sources };
  } catch (err) {
    // Graceful fallback: return best matching chunk content directly
    console.warn('[Chatbot] LLM call failed, using fallback:', err.message);
    const answer = fallbackAnswer(retrieved, question);
    return { answer, sources, fallback: true };
  }
}
