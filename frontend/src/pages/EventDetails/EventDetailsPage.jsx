import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Mail, Share2, Bookmark, Clock, CheckCircle, Award, ArrowLeft, UserCheck, X } from 'lucide-react';
import { getEventById, registerForEvent, getCoordinatorEventVolunteers, markAttendance } from '../../services/eventService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader';

function RoleSelectModal({ eventRoles, selectedRole, onSelect, onSubmit, onClose, loading }) {
  const availableRoles = eventRoles.filter((r) => {
    const filled = r.filledSlots ?? 0;
    const slots = r.slots ?? 0;
    return slots > 0 && filled < slots;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Select a Role</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Choose the role you would like to apply for in this event.
        </p>
        <div className="space-y-2 mb-6">
          {availableRoles.map((role) => {
            const filled = role.filledSlots ?? 0;
            const slots = role.slots ?? 0;
            const available = slots - filled;
            return (
              <label
                key={role.title}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                  selectedRole === role.title ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value={role.title}
                    checked={selectedRole === role.title}
                    onChange={() => onSelect(role.title)}
                    className="rounded-full"
                  />
                  <span className="font-medium text-gray-900">{role.title}</span>
                </div>
                <span className="text-sm text-gray-500">{available} spot(s) left</span>
              </label>
            );
          })}
        </div>
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
            onClick={onSubmit}
            disabled={!selectedRole || loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Submit Registration'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const showAttendance = searchParams.get('markAttendance') === 'true';
  const { user, token } = useAuth();
  const isVolunteer = user?.role === 'volunteer';
  const isCoordinator = user?.role === 'coordinator';
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEventById(id)
      .then((data) => {
        if (!cancelled) setEvent(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load event');
          setEvent(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id || !isCoordinator || !showAttendance) return;
    getCoordinatorEventVolunteers(id)
      .then(setVolunteers)
      .catch(() => setVolunteers([]));
  }, [id, isCoordinator, showAttendance]);

  const handleMarkAttendance = async () => {
    if (!event?.id || selectedVolunteers.length === 0 || attendanceLoading) return;
    setAttendanceLoading(true);
    try {
      await markAttendance(event.id, selectedVolunteers);
      setSelectedVolunteers([]);
      setVolunteers((prev) =>
        prev.map((v) =>
          selectedVolunteers.includes(v.volunteerId) ? { ...v, status: 'attended' } : v
        )
      );
    } finally {
      setAttendanceLoading(false);
    }
  };

  const toggleVolunteer = (volunteerId) => {
    setSelectedVolunteers((prev) =>
      prev.includes(volunteerId)
        ? prev.filter((id) => id !== volunteerId)
        : [...prev, volunteerId]
    );
  };

  const eventRoles = event?.eventRoles ?? [];
  const hasEventRoles = eventRoles.length > 0;

  const handleRegisterClick = () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    if (!event?.id || registering || registered) return;
    if (hasEventRoles) {
      setSelectedRole(eventRoles[0]?.title ?? '');
      setShowRoleModal(true);
    } else {
      handleRegister(null);
    }
  };

  const handleRegister = async (appliedRole = null) => {
    if (!event?.id || registering || registered) return;
    setRegistering(true);
    setShowRoleModal(false);
    try {
      await registerForEvent(event.id, appliedRole ? { appliedRole } : {});
      setRegistered(true);
    } catch {
      setRegistering(false);
    }
  };

  const handleRoleModalSubmit = () => {
    if (!selectedRole?.trim()) return;
    handleRegister(selectedRole.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <Link to="/events" className="text-blue-600 hover:underline">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const eventRoles = event.eventRoles ?? [];
  const hasEventRoles = eventRoles.length > 0;
  const volunteersRequired = event.volunteersRequired ?? 0;
  const volunteersRegistered = event.volunteersRegistered ?? 0;
  const totalRoleSlots = eventRoles.reduce((sum, r) => sum + (r.slots ?? 0), 0);
  const filledRoleSlots = eventRoles.reduce((sum, r) => sum + (r.filledSlots ?? 0), 0);
  const spotsLeft = hasEventRoles
    ? Math.max(0, totalRoleSlots - filledRoleSlots)
    : Math.max(0, volunteersRequired - volunteersRegistered);
  const roles = event.roles ?? [];
  const eligibility = event.eligibility ?? [];
  const skills = event.skills ?? [];
  const timeline = event.timeline ?? [];
  const perks = event.perks ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative h-96 overflow-hidden">
        <img
          src={event.bannerImage || 'https://placehold.co/1200x600?text=Event'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/events"
              className="inline-flex items-center text-white mb-4 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Link>
            <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm font-semibold inline-block mb-4">
              {event.mode || 'Offline'}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{event.title}</h1>
            <p className="text-xl text-white/90">{event.ngoName || 'NGO'}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {event.detailedDescription && (
              <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Event</h2>
                <p className="text-gray-700 leading-relaxed">{event.detailedDescription}</p>
              </div>
            )}

            {roles.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Roles & Responsibilities</h2>
                <ul className="space-y-3">
                  {roles.map((role, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {eligibility.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Eligibility</h2>
                <ul className="space-y-3">
                  {eligibility.map((criterion, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills Required</h2>
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {timeline.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Timeline</h2>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-24">
                        <span className="text-blue-600 font-semibold">{item.time}</span>
                      </div>
                      <div className="flex-1 border-l-2 border-blue-200 pl-4 pb-4">
                        <p className="text-gray-700">{item.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {perks.length > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="h-6 w-6 mr-2 text-green-600" />
                  Perks & Benefits
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {perks.map((perk, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{event.location || 'TBD'}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                  <span>
                    {event.date
                      ? new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'TBD'}
                  </span>
                </div>
                {event.registrationDeadline && (
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-5 w-5 mr-3 text-gray-400" />
                    <span>
                      Register by{' '}
                      {new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                <div className="flex items-center text-gray-700">
                  <Users className="h-5 w-5 mr-3 text-gray-400" />
                  <span>
                    <strong>{spotsLeft}</strong> spots available
                  </span>
                </div>
              </div>

              {isVolunteer && (
                <>
                  <button
                    onClick={handleRegisterClick}
                    disabled={registering || spotsLeft <= 0 || registered}
                    className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mb-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {registered ? 'Registered' : registering ? 'Registering...' : spotsLeft <= 0 ? 'Event Full' : 'Register Now'}
                  </button>
                  {showRoleModal && hasEventRoles && (
                    <RoleSelectModal
                      eventRoles={eventRoles}
                      selectedRole={selectedRole}
                      onSelect={setSelectedRole}
                      onSubmit={handleRoleModalSubmit}
                      onClose={() => setShowRoleModal(false)}
                      loading={registering}
                    />
                  )}
                </>
              )}
              {!token && (
                <Link
                  to="/login"
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mb-3"
                >
                  Login to Register
                </Link>
              )}

              {isCoordinator && showAttendance && volunteers.length > 0 && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                    Mark Attendance
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                    {volunteers
                      .filter((v) => v.status !== 'attended')
                      .map((v) => (
                        <label
                          key={v.id}
                          className="flex items-center gap-2 cursor-pointer text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedVolunteers.includes(v.volunteerId)}
                            onChange={() => toggleVolunteer(v.volunteerId)}
                            className="rounded"
                          />
                          <span>{v.name || v.email || 'Volunteer'}</span>
                          {v.status === 'attended' && (
                            <span className="text-green-600 text-xs">✓ Attended</span>
                          )}
                        </label>
                      ))}
                  </div>
                  <button
                    onClick={handleMarkAttendance}
                    disabled={selectedVolunteers.length === 0 || attendanceLoading}
                    className="w-full px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {attendanceLoading ? 'Marking...' : `Mark ${selectedVolunteers.length} Attended`}
                  </button>
                </div>
              )}

              {isCoordinator && !showAttendance && (
                <Link
                  to={`/events/${id}?markAttendance=true`}
                  className="block w-full text-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 mb-3"
                >
                  Mark Attendance
                </Link>
              )}

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </button>
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save
                </button>
              </div>

              {event.contactEmail && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Contact NGO</h3>
                  <a
                    href={`mailto:${event.contactEmail}`}
                    className="flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {event.contactEmail}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
