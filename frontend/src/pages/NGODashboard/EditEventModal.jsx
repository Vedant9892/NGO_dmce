import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { updateEvent } from '../../services/eventService';

export default function EditEventModal({ event, coordinators = [], onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    detailedDescription: '',
    location: '',
    mode: 'Offline',
    date: '',
    registrationDeadline: '',
    volunteersRequired: 0,
    contactEmail: '',
    skills: [],
    roles: '',
    eligibility: '',
    perks: '',
    coordinatorId: '',
  });
  const [currentSkill, setCurrentSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!event) return;
    const d = event.date ? new Date(event.date) : null;
    const rd = event.registrationDeadline ? new Date(event.registrationDeadline) : null;
    const coordId =
      event.coordinatorId?._id ||
      event.coordinatorId?.id ||
      (typeof event.coordinatorId === 'string' ? event.coordinatorId : '');
    setForm({
      title: event.title || '',
      description: event.description || '',
      detailedDescription: event.detailedDescription || '',
      location: event.location || '',
      mode: event.mode || 'Offline',
      date: d ? d.toISOString().slice(0, 10) : '',
      registrationDeadline: rd ? rd.toISOString().slice(0, 10) : '',
      volunteersRequired: event.volunteersRequired ?? 0,
      contactEmail: event.contactEmail || '',
      skills: Array.isArray(event.skills) ? [...event.skills] : [],
      roles: Array.isArray(event.roles) ? event.roles.join('\n') : (event.roles || ''),
      eligibility: Array.isArray(event.eligibility) ? event.eligibility.join('\n') : (event.eligibility || ''),
      perks: Array.isArray(event.perks) ? event.perks.join('\n') : (event.perks || ''),
      coordinatorId: coordId || '',
    });
  }, [event]);

  const handleAddSkill = () => {
    const t = currentSkill.trim();
    if (t && !form.skills.includes(t)) {
      setForm((p) => ({ ...p, skills: [...p.skills, t] }));
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (s) => {
    setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        detailedDescription: form.detailedDescription.trim(),
        location: form.location.trim(),
        mode: form.mode || 'Offline',
        date: form.date ? `${form.date}T12:00:00` : undefined,
        registrationDeadline: form.registrationDeadline ? `${form.registrationDeadline}T23:59:59` : undefined,
        volunteersRequired: parseInt(form.volunteersRequired, 10) || 0,
        contactEmail: form.contactEmail.trim() || undefined,
        skills: form.skills,
        roles: form.roles.split(/\n/).map((s) => s.trim()).filter(Boolean),
        eligibility: form.eligibility.split(/\n/).map((s) => s.trim()).filter(Boolean),
        perks: form.perks.split(/\n/).map((s) => s.trim()).filter(Boolean),
        coordinatorId: form.coordinatorId || null,
      };
      const eventId = event.id ?? event._id;
      await updateEvent(eventId, payload);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden />
        <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Edit Event</h3>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Short Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Description</label>
              <textarea
                value={form.detailedDescription}
                onChange={(e) => setForm((p) => ({ ...p, detailedDescription: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mode</label>
                <select
                  value={form.mode}
                  onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Offline">Offline</option>
                  <option value="Online">Online</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Event Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Registration Deadline</label>
                <input
                  type="date"
                  value={form.registrationDeadline}
                  onChange={(e) => setForm((p) => ({ ...p, registrationDeadline: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Max Volunteers</label>
                <input
                  type="number"
                  min="0"
                  value={form.volunteersRequired}
                  onChange={(e) => setForm((p) => ({ ...p, volunteersRequired: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Coordinator</label>
              <select
                value={form.coordinatorId}
                onChange={(e) => setForm((p) => ({ ...p, coordinatorId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">None</option>
                {coordinators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Add skill"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={handleAddSkill} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded flex items-center gap-1"
                  >
                    {s}
                    <button type="button" onClick={() => handleRemoveSkill(s)} className="hover:text-red-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Roles (one per line)</label>
              <textarea
                value={form.roles}
                onChange={(e) => setForm((p) => ({ ...p, roles: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Eligibility (one per line)</label>
              <textarea
                value={form.eligibility}
                onChange={(e) => setForm((p) => ({ ...p, eligibility: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Perks (one per line)</label>
              <textarea
                value={form.perks}
                onChange={(e) => setForm((p) => ({ ...p, perks: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
