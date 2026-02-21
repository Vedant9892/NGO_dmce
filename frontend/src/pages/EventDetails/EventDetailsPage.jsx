import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapPin, Calendar, Mail, Share2, Bookmark, Clock, CheckCircle, Award, ArrowLeft, UserCheck, QrCode } from 'lucide-react';
import { getEventById, registerForEvent, getCoordinatorEventVolunteers, markAttendance } from '../../services/eventService';
import MarkAttendanceModal from '../../components/attendance/MarkAttendanceModal';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader';

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
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [regError, setRegError] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [showMarkAttendanceModal, setShowMarkAttendanceModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEventById(id)
      .then((data) => {
        if (!cancelled) {
          setEvent(data);
          setRegError(null);
          if (data?.myRegistrationStatus) {
            setRegistered(true);
            setRegistrationStatus(data.myRegistrationStatus);
          } else {
            setRegistered(false);
            setRegistrationStatus(null);
          }
        }
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

  // Poll for approval status when volunteer is waiting (so button turns green when approved)
  useEffect(() => {
    if (!id || !isVolunteer || registrationStatus !== 'pending') return;
    const interval = setInterval(() => {
      getEventById(id).then((data) => {
        if (data?.myRegistrationStatus && data.myRegistrationStatus !== 'pending') {
          setRegistrationStatus(data.myRegistrationStatus);
        }
      }).catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [id, isVolunteer, registrationStatus]);

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
  const firstValidRole = eventRoles.find((r) => r?.title?.trim())?.title?.trim() || null;

  const handleRegisterClick = () => {
    setRegError(null);
    if (!token) {
      window.location.href = '/login';
      return;
    }
    const eventId = event?.id ?? event?._id;
    if (!eventId || registering || registered || registrationStatus) return;
    handleRegister(firstValidRole);
  };

  const handleRegister = async (appliedRole = null) => {
    const eventId = event?.id ?? event?._id;
    if (!eventId || registering || registered || registrationStatus) return;
    setRegError(null);
    setRegistering(true);
    // Optimistic update: instantly show "Waiting for approval" (yellow) before API completes
    setRegistered(true);
    setRegistrationStatus('pending');
    try {
      await registerForEvent(eventId, appliedRole ? { appliedRole } : {});
    } catch (err) {
      setRegError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
      setRegistered(false);
      setRegistrationStatus(null);
    } finally {
      setRegistering(false);
    }
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
          <Link to="/events" className="text-emerald-700 hover:underline">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

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
              className="inline-flex items-center text-white mb-4 hover:text-emerald-300 transition-colors"
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
                      <CheckCircle className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
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
                      <CheckCircle className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
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
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg"
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
                        <span className="text-emerald-700 font-semibold">{item.time}</span>
                      </div>
                      <div className="flex-1 border-l-2 border-emerald-200 pl-4 pb-4">
                        <p className="text-gray-700">{item.activity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {perks.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-50 rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <Award className="h-6 w-6 mr-2 text-emerald-700" />
                  Perks & Benefits
                </h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {perks.map((perk, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-emerald-700 mr-3 mt-0.5 flex-shrink-0" />
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
              </div>

              {isVolunteer && (
                <>
                  {regError && (
                    <div className="mb-3 px-4 py-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                      {regError}
                    </div>
                  )}
                  {(() => {
                    const isApproved = registrationStatus && ['approved', 'confirmed', 'role_offered'].includes(registrationStatus);
                    const isAttended = registrationStatus === 'attended';
                    const isWaiting = (registered || registrationStatus) && !isApproved && !isAttended;
                    const canMarkAttendance = ['approved', 'confirmed'].includes(registrationStatus) && !isAttended;
                    return (
                      <>
                        <button
                          onClick={handleRegisterClick}
                          disabled={registered || !!registrationStatus}
                          className={`w-full font-semibold py-3 px-6 rounded-lg transition-all mb-3 disabled:cursor-not-allowed disabled:transform-none ${
                            isAttended
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
                              : isApproved
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
                              : isWaiting
                              ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-amber-900'
                              : 'bg-gradient-to-r from-emerald-700 to-emerald-500 text-white hover:shadow-xl transform hover:-translate-y-0.5'
                          }`}
                        >
                          {isAttended ? 'Attendance Marked' : isApproved ? 'Application Approved' : isWaiting ? 'Waiting for Approval' : 'Register Now'}
                        </button>
                        {canMarkAttendance && (
                          <button
                            type="button"
                            onClick={() => setShowMarkAttendanceModal(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 px-6 border-2 border-emerald-600 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors mb-3"
                          >
                            <QrCode className="h-5 w-5" />
                            Mark My Attendance
                          </button>
                        )}
                        {showMarkAttendanceModal && (
                          <MarkAttendanceModal
                            eventId={event?.id ?? event?._id}
                            eventTitle={event?.title}
                            onClose={() => setShowMarkAttendanceModal(false)}
                            onSuccess={() => {
                              setRegistrationStatus('attended');
                              setShowMarkAttendanceModal(false);
                            }}
                          />
                        )}
                      </>
                    );
                  })()}
                </>
              )}
              {!token && (
                <Link
                  to="/login"
                  className="block w-full text-center bg-gradient-to-r from-emerald-700 to-emerald-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mb-3"
                >
                  Login to Register
                </Link>
              )}

              {isCoordinator && showAttendance && volunteers.length > 0 && (
                <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-emerald-700" />
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
                            <span className="text-emerald-700 text-xs">âœ“ Attended</span>
                          )}
                        </label>
                      ))}
                  </div>
                  <button
                    onClick={handleMarkAttendance}
                    disabled={selectedVolunteers.length === 0 || attendanceLoading}
                    className="w-full px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 disabled:opacity-50"
                  >
                    {attendanceLoading ? 'Marking...' : `Mark ${selectedVolunteers.length} Attended`}
                  </button>
                </div>
              )}

              {isCoordinator && !showAttendance && (
                <Link
                  to={`/events/${id}?markAttendance=true`}
                  className="block w-full text-center px-4 py-2 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 mb-3"
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
                    className="flex items-center text-emerald-700 hover:text-emerald-700"
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

