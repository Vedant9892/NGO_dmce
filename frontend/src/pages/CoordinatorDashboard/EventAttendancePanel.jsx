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
} from 'lucide-react';
import {
  getCoordinatorEventVolunteers,
  markAttendance,
} from '../../services/eventService';
import Loader from '../../components/ui/Loader';

function formatEventNameForFile(name) {
  return (name || 'event')
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function exportAttendanceCSV(volunteers, eventTitle) {
  const headers = ['Name', 'Email', 'Status'];
  const rows = volunteers.map((v) => [
    v.name || 'N/A',
    v.email || 'N/A',
    v.status || 'pending',
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
    attended: 'bg-green-100 text-green-800',
    confirmed: 'bg-blue-100 text-blue-800',
    pending: 'bg-amber-100 text-amber-800',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  const label = status === 'attended' ? 'Attended' : status === 'pending' ? 'Registered' : status === 'confirmed' ? 'Confirmed' : status || 'Unknown';
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
      {label}
    </span>
  );
}

export default function EventAttendancePanel({ event }) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

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

  const notYetAttended = volunteers.filter((v) => v.status !== 'attended');
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
            <div className="text-2xl font-bold text-green-600">{attended}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <Percent className="h-4 w-4 mr-1" />
              Attendance %
            </div>
            <div className="text-2xl font-bold text-blue-600">{percent}%</div>
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
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Registered {total}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Attended {attended}
              </span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                Absent {absent}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleMarkSelected}
            disabled={selectedIds.length === 0 || attendanceLoading}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Mark Selected ({selectedIds.length})
          </button>
          <button
            type="button"
            onClick={handleMarkAllPresent}
            disabled={!canMarkAll || attendanceLoading}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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

        {volunteers.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {volunteers.map((v) => {
                  const isAttended = v.status === 'attended';
                  const isSelected = selectedIds.includes(v.volunteerId);
                  return (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {!isAttended && (
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
                      <td className="px-4 py-3 text-sm text-gray-600">{v.email || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={v.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
