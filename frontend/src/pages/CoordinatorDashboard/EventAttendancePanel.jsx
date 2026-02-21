import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Percent,
  Download,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  UserX,
  QrCode,
  Copy,
  MapPin,
  Clock,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  getCoordinatorEventVolunteers,
  getAttendanceCode,
  markAttendance,
  approveRegistration,
  rejectRegistration,
  offerRole,
} from '../../services/eventService';
import Loader from '../../components/ui/Loader';

function formatEventNameForFile(name) {
  return (name || 'event')
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function exportAttendanceCSV(volunteers, eventTitle) {
  const headers = ['Name', 'Email', 'Status', 'Marked At', 'Location', 'Method'];
  const rows = volunteers.map((v) => [
    v.name || 'N/A',
    v.email || 'N/A',
    v.status || 'pending',
    v.markedAt ? new Date(v.markedAt).toLocaleString() : '—',
    v.markedLocation || '—',
    v.markedMethod || '—',
  ]);
  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${formatEventNameForFile(eventTitle)}-attendance.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function StatusBadge({ status }) {
  const styles = {
    attended: 'bg-emerald-100 text-emerald-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    approved: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800',
    role_offered: 'bg-purple-100 text-purple-800',
    rejected: 'bg-red-100 text-red-800',
    declined: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  const labels = {
    attended: 'Attended',
    confirmed: 'Confirmed',
    approved: 'Approved',
    pending: 'Pending',
    role_offered: 'Role Offered',
    rejected: 'Rejected',
    declined: 'Declined',
    cancelled: 'Cancelled',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
      {labels[status] || status || 'Unknown'}
    </span>
  );
}

function OfferRoleModal({ event, registrationId, volunteerName, availableRoles, onClose, onSuccess }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!selectedRole?.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      await offerRole(registrationId, selectedRole.trim());
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to offer role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Offer Different Role</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select a role to offer to {volunteerName || 'this volunteer'}.
        </p>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
        >
          <option value="">Choose role...</option>
          {availableRoles.map((r) => {
            const filled = r.filledSlots ?? 0;
            const slots = r.slots ?? 0;
            const available = slots - filled;
            if (available <= 0) return null;
            return (
              <option key={r.title} value={r.title}>
                {r.title} ({available} spot{available !== 1 ? 's' : ''} left)
              </option>
            );
          })}
        </select>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedRole || loading}
            className="flex-1 px-4 py-2 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 disabled:opacity-50"
          >
            {loading ? 'Offering...' : 'Offer Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AttendanceCodeCard({ event, onCodeLoaded }) {
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!event?.id) return;
    setLoading(true);
    setError(null);
    getAttendanceCode(event.id)
      .then((data) => {
        setCode(data?.code || null);
        onCodeLoaded?.(data?.code);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load code'))
      .finally(() => setLoading(false));
  }, [event?.id]);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return <div className="p-4 bg-white rounded-lg"><Loader size="sm" /></div>;
  if (error) return <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>;
  if (!code) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
        <QrCode className="h-5 w-5 mr-2 text-emerald-700" />
        Attendance Code & QR
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Volunteers can scan this QR or enter the code to mark their attendance.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="flex-shrink-0 p-4 bg-white border border-gray-200 rounded-lg">
          <QRCodeSVG value={code} size={160} level="M" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">Code for manual entry</p>
          <div className="flex items-center gap-2">
            <code className="px-4 py-2 bg-gray-100 rounded-lg font-mono text-xl font-bold text-gray-900 tracking-wider">
              {code}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title="Copy code"
            >
              <Copy className="h-5 w-5 text-gray-600" />
            </button>
            {copied && <span className="text-sm text-emerald-600">Copied!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventAttendancePanel({ event }) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [offerModalFor, setOfferModalFor] = useState(null);

  useEffect(() => {
    if (!event?.id) return;
    setLoading(true);
    getCoordinatorEventVolunteers(event.id)
      .then((data) => setVolunteers(Array.isArray(data) ? data : []))
      .catch(() => setVolunteers([]))
      .finally(() => setLoading(false));
  }, [event?.id]);

  const total = volunteers.length;
  const attended = volunteers.filter((v) => v.status === 'attended').length;
  const absent = total - attended;
  const percent = total > 0 ? Math.round((attended / total) * 100) : 0;

  const notYetAttended = volunteers.filter((v) => ['approved', 'confirmed'].includes(v.status));
  const canMarkAll = notYetAttended.length > 0;

  const toggleSelect = (volunteerId) => {
    setSelectedIds((prev) =>
      prev.includes(volunteerId)
        ? prev.filter((id) => id !== volunteerId)
        : [...prev, volunteerId]
    );
  };

  const selectAllPresent = () => {
    const ids = notYetAttended.map((v) => v.volunteerId).filter(Boolean);
    setSelectedIds(ids);
  };

  const handleMarkAttendance = async (volunteerIds) => {
    if (!event?.id || volunteerIds.length === 0 || attendanceLoading) return;
    setAttendanceLoading(true);
    try {
      await markAttendance(event.id, volunteerIds);
      setVolunteers((prev) =>
        prev.map((v) =>
          volunteerIds.includes(v.volunteerId) ? { ...v, status: 'attended' } : v
        )
      );
      setSelectedIds((prev) => prev.filter((id) => !volunteerIds.includes(id)));
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleMarkSelected = () => {
    if (selectedIds.length === 0) return;
    handleMarkAttendance(selectedIds);
  };

  const handleMarkAllPresent = () => {
    const ids = notYetAttended.map((v) => v.volunteerId).filter(Boolean);
    if (ids.length > 0) handleMarkAttendance(ids);
  };

  const refreshVolunteers = () => {
    if (!event?.id) return;
    getCoordinatorEventVolunteers(event.id)
      .then((data) => setVolunteers(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const handleApprove = async (regId) => {
    if (actionLoadingId) return;
    setActionLoadingId(regId);
    try {
      await approveRegistration(regId);
      refreshVolunteers();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (regId) => {
    if (actionLoadingId) return;
    setActionLoadingId(regId);
    try {
      await rejectRegistration(regId);
      refreshVolunteers();
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 border-t border-gray-100">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50/50">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <Users className="h-4 w-4 mr-1" />
              Total Registered
            </div>
            <div className="text-2xl font-bold text-gray-900">{total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <UserCheck className="h-4 w-4 mr-1" />
              Attended
            </div>
            <div className="text-2xl font-bold text-emerald-700">{attended}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <Percent className="h-4 w-4 mr-1" />
              Attendance %
            </div>
            <div className="text-2xl font-bold text-emerald-700">{percent}%</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <UserX className="h-4 w-4 mr-1" />
              Absent
            </div>
            <div className="text-2xl font-bold text-amber-600">{absent}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 col-span-2 md:col-span-2">
            <div className="text-gray-500 text-sm mb-2">Status breakdown</div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                Registered {total}
              </span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                Attended {attended}
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                Absent {absent}
              </span>
            </div>
          </div>
        </div>

        <AttendanceCodeCard event={event} />

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <UserCheck className="h-5 w-5 mr-2 text-emerald-700" />
            Mark Attendance
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleMarkSelected}
              disabled={selectedIds.length === 0 || attendanceLoading}
              className="px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              Mark Selected ({selectedIds.length})
            </button>
            <button
              type="button"
              onClick={handleMarkAllPresent}
            disabled={!canMarkAll || attendanceLoading}
            className="px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Mark All Present
            </button>
            <button
              type="button"
              onClick={() => exportAttendanceCSV(volunteers, event?.title)}
            disabled={volunteers.length === 0}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Attendance CSV
            </button>
            <Link
              to={`/events/${event?.id ?? event?._id}?markAttendance=true`}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 flex items-center"
          >
            Full Attendance View
            </Link>
          </div>
        </div>

        {volunteers.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Registration Review</h3>
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      <span className="sr-only">Select</span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Volunteer Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Skills
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Applied Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Marked Info
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {volunteers.map((v) => {
                    const isAttended = v.status === 'attended';
                    const isApprovedOrConfirmed = ['approved', 'confirmed'].includes(v.status);
                    const isSelected = selectedIds.includes(v.volunteerId);
                    const isPending = v.status === 'pending';
                    const isRoleOffered = v.status === 'role_offered';
                    const acting = actionLoadingId === v.id;
                    const skills = Array.isArray(v.skills) ? v.skills : [];
                    return (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {isApprovedOrConfirmed && !isAttended && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(v.volunteerId)}
                              className="rounded border-gray-300"
                            />
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {v.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {skills.length > 0 ? skills.join(', ') : 'â€”'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {v.appliedRole || v.offeredRole || 'â€”'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={v.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {isAttended && (v.markedAt || v.markedLocation || v.markedMethod) ? (
                            <div className="space-y-1">
                              {v.markedAt && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {new Date(v.markedAt).toLocaleString()}
                                </div>
                              )}
                              {v.markedLocation && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {v.markedLocation}
                                </div>
                              )}
                              {v.markedMethod && (
                                <span className="text-xs text-gray-500">via {v.markedMethod === 'qr' ? 'QR scan' : 'code'}</span>
                              )}
                            </div>
                          ) : isAttended ? (
                            <span className="text-gray-400">—</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {isPending && (
                            <div className="flex flex-wrap gap-1">
                              <button
                                type="button"
                                onClick={() => handleApprove(v.id)}
                                disabled={acting}
                                className="px-2 py-1 text-xs font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800 disabled:opacity-50"
                              >
                                {acting ? '...' : 'Approve'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(v.id)}
                                disabled={acting}
                                className="px-2 py-1 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                              {event?.eventRoles?.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setOfferModalFor(v)}
                                  disabled={acting}
                                  className="px-2 py-1 text-xs font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800 disabled:opacity-50"
                                >
                                  Offer Role
                                </button>
                              )}
                            </div>
                          )}
                          {isRoleOffered && (
                            <span className="px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded">
                              Waiting for volunteer response
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {offerModalFor && (
              <OfferRoleModal
                event={event}
                registrationId={offerModalFor.id}
                volunteerName={offerModalFor.name}
                availableRoles={event?.eventRoles ?? []}
                onClose={() => setOfferModalFor(null)}
                onSuccess={refreshVolunteers}
              />
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No volunteers registered</p>
            <p className="text-sm mt-1">Volunteers will appear here when they register for this event.</p>
          </div>
        )}
      </div>
    </div>
  );
}

