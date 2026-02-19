import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, TrendingUp, Clock, Plus, Edit, Trash2, Eye, BarChart3, UserPlus } from 'lucide-react';
import { getNGOStats, getNGOEvents, getNGORegistrations, getNGOCoordinators } from '../../services/eventService';
import Loader from '../../components/ui/Loader';
import ManageCoordinatorsTab from './ManageCoordinatorsTab';

export default function NGODashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshCoordinators = () =>
    getNGOCoordinators()
      .then((list) => setCoordinators(Array.isArray(list) ? list : []))
      .catch(() => setCoordinators([]));

  const refreshEvents = () =>
    getNGOEvents()
      .then((data) => setEvents(Array.isArray(data) ? data : (data?.events ?? [])))
      .catch(() => setEvents([]));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getNGOStats(), getNGOEvents(), getNGORegistrations(), getNGOCoordinators()])
      .then(([statsData, eventsData, regsData, coordsData]) => {
        if (cancelled) return;
        setStats(statsData);
        setEvents(Array.isArray(eventsData) ? eventsData : (eventsData?.events ?? []));
        setRegistrations(Array.isArray(regsData) ? regsData : (regsData?.registrations ?? []));
        setCoordinators(Array.isArray(coordsData) ? coordsData : []);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load dashboard data');
          setStats(null);
          setEvents([]);
          setRegistrations([]);
          setCoordinators([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statValues = {
    totalVolunteers: stats?.totalVolunteers ?? 0,
    activeEvents: stats?.activeEvents ?? 0,
    attendanceRate: stats?.attendanceRate ?? 0,
    totalVolunteerHours: stats?.totalVolunteerHours ?? 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">NGO Dashboard</h1>
            <p className="text-blue-100">Manage your events and track volunteer engagement</p>
          </div>
          <Link
            to="/create-event"
            className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Event
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap border-b">
            {['overview', 'events', 'registrations', 'coordinators', 'attendance', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'events' ? 'Manage Events' : tab === 'coordinators' ? 'Manage Coordinators' : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && <OverviewTab stats={statValues} events={events} />}
        {activeTab === 'events' && (
          <ManageEventsTab
            events={events}
            coordinators={coordinators}
            onRefresh={refreshEvents}
          />
        )}
        {activeTab === 'registrations' && <RegistrationsTab registrations={registrations} />}
        {activeTab === 'coordinators' && (
          <ManageCoordinatorsTab coordinators={coordinators} onRefresh={refreshCoordinators} />
        )}
        {activeTab === 'attendance' && <AttendanceTab events={events} />}
        {activeTab === 'reports' && <ReportsTab />}
      </div>
    </div>
  );
}

function OverviewTab({ stats, events }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Volunteers</span>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalVolunteers}</div>
          <div className="text-sm text-gray-500 mt-1">—</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Active Events</span>
            <Calendar className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.activeEvents}</div>
          <div className="text-sm text-gray-500 mt-1">—</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Attendance Rate</span>
            <TrendingUp className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.attendanceRate}%</div>
          <div className="text-sm text-gray-500 mt-1">—</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Volunteer Hours</span>
            <Clock className="h-6 w-6 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalVolunteerHours}</div>
          <div className="text-sm text-gray-500 mt-1">Total contributed</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Events</h2>
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center">
                  <img
                    src={event.bannerImage || 'https://placehold.co/64x64?text=Event'}
                    alt={event.title}
                    className="w-16 h-16 object-cover rounded-lg mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {(event.volunteersRegistered ?? 0)} / {(event.volunteersRequired ?? 0)} volunteers
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/events/${event.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-5 w-5" />
                  </Link>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No events yet. Create your first event to get started.</p>
            <Link to="/create-event" className="mt-4 inline-block text-blue-600 font-semibold hover:underline">
              Create Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function ManageEventsTab({ events, coordinators = [], onRefresh }) {
  const [editingEvent, setEditingEvent] = useState(null);
  const [coordinatorId, setCoordinatorId] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const handleOpenEdit = (event) => {
    const coordId =
      event.coordinatorId?._id ||
      event.coordinatorId?.id ||
      (typeof event.coordinatorId === 'string' ? event.coordinatorId : '');
    setEditingEvent(event);
    setCoordinatorId(coordId || '');
    setEditError('');
  };

  const handleCloseEdit = () => {
    setEditingEvent(null);
    setCoordinatorId('');
    setEditError('');
  };

  const handleSaveCoordinator = async (e) => {
    e.preventDefault();
    if (!editingEvent?.id) return;
    setSaving(true);
    setEditError('');
    try {
      const { updateEvent } = await import('../../services/eventService');
      await updateEvent(editingEvent.id, {
        coordinatorId: coordinatorId || null,
      });
      handleCloseEdit();
      onRefresh?.();
    } catch (err) {
      setEditError(err.response?.data?.message || err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Events</h2>
        <Link
          to="/create-event"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Event
        </Link>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                <img
                  src={event.bannerImage || 'https://placehold.co/400x200?text=Event'}
                  alt={event.title}
                  className="w-full md:w-48 h-48 object-cover"
                />
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {event.location || 'TBD'} • {event.mode || 'Offline'}
                      </p>
                      {event.coordinatorId && (
                        <p className="text-sm text-blue-600 mt-1">
                          Coordinator: {event.coordinatorId?.name || event.coordinatorId}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/events/${event.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(event)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit / Assign Coordinator"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{event.description || ''}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Date: </span>
                      <span className="font-semibold text-gray-900">
                        {event.date
                          ? new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'TBD'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Registrations: </span>
                      <span className="font-semibold text-gray-900">
                        {event.volunteersRegistered ?? 0} / {event.volunteersRequired ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status: </span>
                      <span
                        className={`font-semibold ${
                          (event.volunteersRegistered ?? 0) >= (event.volunteersRequired ?? 1)
                            ? 'text-green-600'
                            : 'text-orange-600'
                        }`}
                      >
                        {(event.volunteersRegistered ?? 0) >= (event.volunteersRequired ?? 1)
                          ? 'Full'
                          : 'Open'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl text-gray-500">
          <p className="text-lg">No events yet. Create your first event to get started.</p>
          <Link to="/create-event" className="mt-4 inline-block text-blue-600 font-semibold hover:underline">
            Create Event
          </Link>
        </div>
      )}

      {editingEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={handleCloseEdit} aria-hidden />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Assign Coordinator</h3>
              <p className="text-sm text-gray-600 mb-4">{editingEvent.title}</p>
              <form onSubmit={handleSaveCoordinator}>
                {editError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{editError}</div>
                )}
                <div className="mb-6">
                  <label htmlFor="edit-coordinatorId" className="block text-sm font-semibold text-gray-700 mb-1">
                    Coordinator
                  </label>
                  <select
                    id="edit-coordinatorId"
                    value={coordinatorId}
                    onChange={(e) => setCoordinatorId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">None</option>
                    {coordinators.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                  {coordinators.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">Add coordinators in Manage Coordinators first.</p>
                  )}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RegistrationsTab({ registrations }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Volunteer Registrations</h2>
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {registrations.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Volunteer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {registrations.map((reg) => (
                <tr key={reg.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{reg.volunteerName ?? reg.name ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {reg.eventName ?? reg.event ?? '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {reg.date
                      ? new Date(reg.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        (reg.status ?? '').toLowerCase() === 'confirmed'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-yellow-100 text-yellow-600'
                      }`}
                    >
                      {reg.status ?? 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p>No registrations yet. Events will show volunteer registrations here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AttendanceTab({ events }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance Management</h2>
      <div className="bg-white rounded-xl shadow-md p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">QR Code Check-in</h3>
            <p className="text-gray-600">Use this QR code for volunteer check-in at events</p>
          </div>
          <div className="bg-gray-100 p-8 rounded-lg">
            <div className="w-32 h-32 bg-white border-4 border-gray-300 flex items-center justify-center">
              <BarChart3 className="h-16 w-16 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {events.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Registered
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Attended
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Attendance Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.slice(0, 10).map((event) => {
                const registered = event.volunteersRegistered ?? 0;
                const attended = event.attended ?? Math.floor(registered * 0.9);
                const rate = registered > 0 ? Math.round((attended / registered) * 100) : 0;
                return (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {event.date
                        ? new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{registered}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{attended}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rate >= 90
                            ? 'bg-green-100 text-green-600'
                            : rate >= 70
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {rate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p>No events to show attendance for yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports & Analytics</h2>

      <div className="bg-white rounded-xl shadow-md p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h3>
        <p className="text-gray-600 mb-6">
          Reports will be available once you have event and volunteer data.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            Download Volunteer Report
          </button>
          <button className="px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors">
            Download Event Report
          </button>
          <button className="px-6 py-3 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors">
            Download Impact Report
          </button>
        </div>
      </div>
    </div>
  );
}
