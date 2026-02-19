import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Mail, Share2, Bookmark, Clock, CheckCircle, Award, ArrowLeft } from 'lucide-react';
import { getEventById, registerForEvent } from '../../services/eventService';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader';

export default function EventDetailsPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

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

  const handleRegister = async () => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    if (!event?.id || registering || registered) return;
    setRegistering(true);
    try {
      await registerForEvent(event.id);
      setRegistered(true);
    } catch {
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
          <Link to="/events" className="text-blue-600 hover:underline">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const volunteersRequired = event.volunteersRequired ?? 0;
  const volunteersRegistered = event.volunteersRegistered ?? 0;
  const spotsLeft = Math.max(0, volunteersRequired - volunteersRegistered);
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

              <button
                onClick={handleRegister}
                disabled={registering || spotsLeft <= 0 || registered}
                className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mb-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {registered ? 'Registered' : registering ? 'Registering...' : spotsLeft <= 0 ? 'Event Full' : 'Register Now'}
              </button>

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
