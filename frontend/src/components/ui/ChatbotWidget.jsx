import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { sendChatMessage } from '../../services/chatbotService';

// ── Small helper to render markdown-ish bullet lists and bold text ──────────
function MessageText({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Bold: **text**
        const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const isListItem = /^\s*\d+[\.\)]\s|^\s*[-•]\s/.test(line);
        return (
          <p
            key={i}
            className={isListItem ? 'pl-3' : ''}
            dangerouslySetInnerHTML={{ __html: rendered || '&nbsp;' }}
          />
        );
      })}
    </div>
  );
}

const SUGGESTED_QUESTIONS = [
  'How do I register for an event?',
  'How do I create an event?',
  'What can an admin do?',
  'How do notifications work?',
];

export default function ChatbotWidget() {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: `Hi${user?.name ? ` ${user.name.split(' ')[0]}` : ''}! 👋 I'm Sahayak AI. Ask me anything about the platform — registering for events, creating events, or navigating your dashboard.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async (text) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    setInput('');
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', text: question },
    ]);
    setLoading(true);

    try {
      const data = await sendChatMessage(question);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          text: data.answer,
          sources: data.sources,
          notice: data.notice,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          text: "Sorry, I couldn't reach the server. Please try again shortly.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Floating button ───────────────────────────────── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open Sahayak AI assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        {open ? (
          // X icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Chat bubble icon
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* ── Chat window ───────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
          style={{ maxHeight: '70vh' }}>

          {/* Header */}
          <div className="bg-green-600 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">AI</div>
            <div>
              <p className="text-white text-sm font-semibold">Sahayak AI</p>
              <p className="text-green-100 text-xs">
                {user ? `Role: ${user.role ?? 'user'}` : 'Guest — log in for personalised answers'}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50" style={{ minHeight: 220 }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-green-600 text-white rounded-br-sm'
                    : msg.error
                      ? 'bg-red-50 text-red-700 rounded-bl-sm border border-red-200'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
                  }`}>
                  <MessageText text={msg.text} />
                  {/* Sources */}
                  {msg.sources?.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 font-medium mb-1">Sources:</p>
                      {msg.sources.map((s, i) => (
                        <p key={i} className="text-xs text-green-600">• {s}</p>
                      ))}
                    </div>
                  )}
                  {/* Notice (fallback) */}
                  {msg.notice && (
                    <p className="mt-1 text-xs text-amber-600 italic">{msg.notice}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="w-2 h-2 rounded-full bg-green-400 animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions (only when few messages) */}
          {messages.length <= 2 && !loading && (
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex flex-wrap gap-1">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="px-3 py-2 bg-white border-t border-gray-200 flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question…"
              disabled={loading}
              className="flex-1 text-sm border border-gray-200 rounded-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-green-600 hover:bg-green-700 disabled:opacity-40 flex items-center justify-center text-white transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
