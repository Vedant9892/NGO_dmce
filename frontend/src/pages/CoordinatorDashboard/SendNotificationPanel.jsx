import { useState, useEffect } from 'react';
import { Send, AlertTriangle, MessageCircle, Radio, Bell } from 'lucide-react';
import {
  sendDirectNotification,
  sendBroadcastNotification,
  sendEmergencyNotification,
} from '../../services/notificationService';
import { getCoordinatorEventVolunteers } from '../../services/eventService';

const TABS = [
  {
    label: 'Direct Message',
    desc: 'Send to a specific volunteer',
    icon: MessageCircle,
    color: 'indigo',
  },
  {
    label: 'Broadcast to Event',
    desc: 'Notify all volunteers for an event',
    icon: Radio,
    color: 'blue',
  },
  {
    label: 'Emergency Alert',
    desc: 'Urgent alerts to all registered volunteers',
    icon: AlertTriangle,
    color: 'red',
  },
];

export default function SendNotificationPanel({ events }) {
  const [activeTab, setActiveTab] = useState(0);
  const [eventId, setEventId] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!eventId || activeTab !== 0) {
      setVolunteers([]);
      setRecipientId('');
      return;
    }
    setVolunteersLoading(true);
    getCoordinatorEventVolunteers(eventId)
      .then((data) => setVolunteers(Array.isArray(data) ? data : []))
      .catch(() => setVolunteers([]))
      .finally(() => setVolunteersLoading(false));
  }, [eventId, activeTab]);

  const resetForm = () => {
    setTitle('');
    setMessage('');
    setError(null);
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    resetForm();
    setTimeout(() => setSuccess(null), 4000);
  };

  const switchTab = (i) => {
    setActiveTab(i);
    setError(null);
    setSuccess(null);
    resetForm();
    setEventId('');
    setRecipientId('');
  };

  const handleDirectSend = async (e) => {
    e.preventDefault();
    if (!recipientId || !eventId || !title?.trim() || !message?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await sendDirectNotification({
        recipientId,
        eventId,
        title: title.trim(),
        message: message.trim(),
      });
      showSuccess(data?.message ?? 'Direct notification sent.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastSend = async (e) => {
    e.preventDefault();
    if (!eventId || !title?.trim() || !message?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await sendBroadcastNotification({
        eventId,
        title: title.trim(),
        message: message.trim(),
      });
      showSuccess(data?.message ?? 'Broadcast sent.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencySend = async (e) => {
    e.preventDefault();
    if (!eventId || !title?.trim() || !message?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await sendEmergencyNotification({
        eventId,
        title: title.trim(),
        message: message.trim(),
      });
      showSuccess(data?.message ?? 'Emergency alert sent.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  const tab = TABS[activeTab];
  const isEmergency = activeTab === 2;
  const inputBase = 'w-full px-4 py-2.5 rounded-lg border transition-all focus:ring-2 focus:outline-none';
  const inputStyles = isEmergency
    ? 'border-amber-200 focus:ring-amber-500 focus:border-amber-500 bg-amber-50/50'
    : activeTab === 1
    ? 'border-blue-200 focus:ring-blue-500 focus:border-blue-500 bg-blue-50/50'
    : 'border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/50';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 rounded-xl">
            <Bell className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Send Notification</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Reach volunteers via direct message, broadcast, or emergency alert
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {TABS.map((t, i) => {
            const Icon = t.icon;
            const isActive = activeTab === i;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => switchTab(i)}
                className={`flex items-start gap-3 p-4 rounded-xl text-left transition-all border-2 ${
                  isActive
                    ? i === 2
                      ? 'border-red-300 bg-red-50 shadow-sm'
                      : i === 1
                      ? 'border-blue-300 bg-blue-50 shadow-sm'
                      : 'border-indigo-300 bg-indigo-50 shadow-sm'
                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div
                  className={`p-2 rounded-lg flex-shrink-0 ${
                    isActive
                      ? i === 2
                        ? 'bg-red-200 text-red-700'
                        : i === 1
                        ? 'bg-blue-200 text-blue-700'
                        : 'bg-indigo-200 text-indigo-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-gray-900 block">{t.label}</span>
                  <span className="text-xs text-gray-500 mt-0.5 block">{t.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {success && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm">
            <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
              <Send className="h-4 w-4" />
            </div>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-6">
          {activeTab === 0 && (
            <form onSubmit={handleDirectSend} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event</label>
                  <select
                    value={eventId}
                    onChange={(e) => {
                      setEventId(e.target.value);
                      setRecipientId('');
                    }}
                    required
                    className={`${inputBase} ${inputStyles}`}
                  >
                    <option value="">Select event...</option>
                    {(events ?? []).map((ev) => (
                      <option key={ev.id ?? ev._id} value={ev.id ?? ev._id}>
                        {ev.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Volunteer</label>
                  <select
                    value={recipientId}
                    onChange={(e) => setRecipientId(e.target.value)}
                    required
                    disabled={volunteersLoading || !eventId}
                    className={`${inputBase} ${inputStyles} disabled:opacity-60`}
                  >
                    <option value="">
                      {volunteersLoading ? 'Loading...' : !eventId ? 'Select event first' : 'Select volunteer...'}
                    </option>
                    {volunteers.map((v) => (
                      <option key={v.volunteerId} value={v.volunteerId}>
                        {v.name || v.email || 'Unknown'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={`${inputBase} ${inputStyles}`}
                  placeholder="e.g. Event Update"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className={`${inputBase} ${inputStyles} resize-none`}
                  placeholder="Write your message..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}

          {activeTab === 1 && (
            <form onSubmit={handleBroadcastSend} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event</label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  required
                  className={`${inputBase} ${inputStyles}`}
                >
                  <option value="">Select event...</option>
                  {(events ?? []).map((ev) => (
                    <option key={ev.id ?? ev._id} value={ev.id ?? ev._id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={`${inputBase} ${inputStyles}`}
                  placeholder="e.g. Important Update for All Volunteers"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className={`${inputBase} ${inputStyles} resize-none`}
                  placeholder="Your message will be sent to all volunteers registered for this event..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Radio className="h-4 w-4" />
                )}
                {loading ? 'Broadcasting...' : 'Broadcast to All'}
              </button>
            </form>
          )}

          {activeTab === 2 && (
            <form onSubmit={handleEmergencySend} className="space-y-5">
              <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Emergency Alert</p>
                  <p className="mt-1 text-red-700">
                    This will be sent immediately to all volunteers registered for the selected event.
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Event</label>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  required
                  className={`${inputBase} border-amber-200 focus:ring-amber-500 focus:border-amber-500 bg-amber-50/50`}
                >
                  <option value="">Select event...</option>
                  {(events ?? []).map((ev) => (
                    <option key={ev.id ?? ev._id} value={ev.id ?? ev._id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className={`${inputBase} border-amber-200 focus:ring-amber-500 focus:border-amber-500 bg-amber-50/50`}
                  placeholder="e.g. URGENT: Event Location Change"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className={`${inputBase} border-amber-200 focus:ring-amber-500 focus:border-amber-500 bg-amber-50/50 resize-none`}
                  placeholder="Provide urgent details volunteers need to know..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                {loading ? 'Sending...' : 'Send Emergency Alert'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
