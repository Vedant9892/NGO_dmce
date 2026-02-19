import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Award, TrendingUp, MapPin, Download } from 'lucide-react';
import {
  getVolunteerStats,
  getVolunteerEvents,
  getVolunteerCertificates,
} from '../../services/eventService';
import Loader from '../../components/ui/Loader';

export default function VolunteerDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [completedEvents, setCompletedEvents] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getVolunteerStats(),
      getVolunteerEvents(),
      getVolunteerCertificates(),
    ])
      .then(([statsData, eventsData, certsData]) => {
        if (cancelled) return;
        setStats(statsData);
        const registered = eventsData?.registered ?? (Array.isArray(eventsData) ? eventsData : []);
        const completed = eventsData?.completed ?? [];
        setRegisteredEvents(Array.isArray(registered) ? registered : []);
        setCompletedEvents(Array.isArray(completed) ? completed : []);
        setCertificates(Array.isArray(certsData) ? certsData : (certsData?.certificates ?? []));
        setError(null);
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load dashboard data');
          setStats(null);
          setRegisteredEvents([]);
          setCompletedEvents([]);
          setCertificates([]);
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
    totalEvents: stats?.totalEventsJoined ?? 0,
    totalHours: stats?.totalHoursVolunteered ?? 0,
    upcoming: stats?.upcomingEvents ?? 0,
    completed: stats?.completedEvents ?? 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Volunteer Dashboard</h1>
          <p className="text-blue-100">Track your impact and manage your volunteering journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="flex flex-wrap border-b">
            {['dashboard', 'events', 'certificates', 'profile'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-semibold transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'events' ? 'My Events' : tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <DashboardTab
            stats={statValues}
            registeredEvents={registeredEvents}
          />
        )}
        {activeTab === 'events' && (
          <EventsTab
            registeredEvents={registeredEvents}
            completedEvents={completedEvents}
          />
        )}
        {activeTab === 'certificates' && <CertificatesTab certificates={certificates} />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>
    </div>
  );
}

function DashboardTab({ stats, registeredEvents }) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Total Events</span>
            <Calendar className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalEvents}</div>
          <div className="text-sm text-gray-500 mt-1">Joined events</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Hours Volunteered</span>
            <Clock className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalHours}</div>
          <div className="text-sm text-gray-500 mt-1">Total hours</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Upcoming</span>
            <TrendingUp className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.upcoming}</div>
          <div className="text-sm text-gray-500 mt-1">Scheduled events</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">Completed</span>
            <Award className="h-6 w-6 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
          <div className="text-sm text-gray-500 mt-1">Events completed</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Events</h2>
        {registeredEvents.length > 0 ? (
          <div className="space-y-4">
            {registeredEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
              >
                <img
                  src={event.bannerImage || 'https://placehold.co/80x80?text=Event'}
                  alt={event.title}
                  className="w-20 h-20 object-cover rounded-lg mr-4"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{event.ngoName || 'NGO'}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {event.date
                      ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : 'TBD'}
                    <MapPin className="h-4 w-4 ml-3 mr-1" />
                    {event.location || 'TBD'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No upcoming events. Browse and register for events to get started.</p>
            <Link to="/events" className="mt-4 inline-block text-blue-600 font-semibold hover:underline">
              Explore Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function EventsTab({ registeredEvents, completedEvents }) {
  const [eventTab, setEventTab] = useState('registered');

  return (
    <div>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setEventTab('registered')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            eventTab === 'registered'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Registered Events ({registeredEvents.length})
        </button>
        <button
          onClick={() => setEventTab('completed')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            eventTab === 'completed'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Completed Events ({completedEvents.length})
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eventTab === 'registered' &&
          (registeredEvents.length > 0 ? (
            registeredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <img
                  src={event.bannerImage || 'https://placehold.co/600x240?text=Event'}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="text-sm text-blue-600 font-semibold mb-2">{event.ngoName || 'NGO'}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date
                      ? new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'TBD'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location || 'TBD'}
                  </div>
                  <Link
                    to={`/events/${event.id}`}
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 bg-white rounded-xl text-gray-500">
              No registered events yet. <Link to="/events" className="text-blue-600 hover:underline">Browse events</Link>
            </div>
          ))}

        {eventTab === 'completed' &&
          (completedEvents.length > 0 ? (
            completedEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img
                  src={event.bannerImage || 'https://placehold.co/600x240?text=Event'}
                  alt={event.title}
                  className="w-full h-48 object-cover grayscale"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600 font-semibold">{event.ngoName || 'NGO'}</div>
                    <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
                      Completed
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date
                      ? new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'TBD'}
                  </div>
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                    View Certificate
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 bg-white rounded-xl text-gray-500">
              No completed events yet.
            </div>
          ))}
      </div>
    </div>
  );
}

function CertificatesTab({ certificates }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Certificates</h2>
        <p className="text-gray-600">Download and share your volunteer achievements</p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-600"
            >
              <div className="flex items-center justify-between mb-4">
                <Award className="h-12 w-12 text-blue-600" />
                <span className="text-sm text-gray-500">{cert.hours ?? 0} hours</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{cert.eventName || 'Event'}</h3>
              <p className="text-sm text-gray-600 mb-2">{cert.ngoName || 'NGO'}</p>
              <p className="text-sm text-gray-500 mb-4">
                {cert.date
                  ? new Date(cert.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : ''}
              </p>
              <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl text-gray-500">
          <p className="text-lg">No certificates yet. Complete events to earn certificates.</p>
        </div>
      )}
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              placeholder="City, Country"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Skills</label>
            <input
              type="text"
              placeholder="e.g., Teaching, Communication"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea
              rows={4}
              placeholder="Tell us about yourself"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="w-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold py-3 rounded-lg hover:shadow-lg transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
