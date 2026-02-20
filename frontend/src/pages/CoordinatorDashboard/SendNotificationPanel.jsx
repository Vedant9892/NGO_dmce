import { useState, useEffect } from 'react';
import { Send, AlertTriangle } from 'lucide-react';
import {
  sendDirectNotification,
  sendBroadcastNotification,
  sendEmergencyNotification,
} from '../../services/notificationService';
import { getCoordinatorEventVolunteers } from '../../services/eventService';

const TABS = ['Direct Message', 'Broadcast to Event', 'Emergency Alert'];

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

  const isEmergency = activeTab === 2;
  const tabStyles = isEmergency
    ? 'bg-red-600 text-white hover:bg-red-700'
    : 'bg-blue-600 text-white hover:bg-blue-700';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-bold text-gray-900">Send Notification</h3>
      </div>
      <div className="flex border-b">
        {TABS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              setActiveTab(i);
              setError(null);
              setSuccess(null);
              resetForm();
              setEventId('');
              setRecipientId('');
            }}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === i
                ? i === 2
                  ? 'border-b-2 border-red-600 text-red-600 bg-red-50'
                  : 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="p-6">
        {success && (
          <div className="mb-4 px-4 py-3 bg-green-100 text-green-800 rounded-lg text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-100 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        {activeTab === 0 && (
          <form onSubmit={handleDirectSend} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Event
              </label>
              <select
                value={eventId}
                onChange={(e) => {
                  setEventId(e.target.value);
                  setRecipientId('');
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Volunteer
              </label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
                disabled={volunteersLoading || !eventId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notification title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notification message"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}

        {activeTab === 1 && (
          <form onSubmit={handleBroadcastSend} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Event</label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notification title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notification message"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}

        {activeTab === 2 && (
          <form onSubmit={handleEmergencySend} className="space-y-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span>Emergency alerts are sent to all volunteers registered for the selected event.</span>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Event</label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Emergency title"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Emergency message"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-2 font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${tabStyles}`}
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {loading ? 'Sending...' : 'Send Emergency'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
