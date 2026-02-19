import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Eye } from 'lucide-react';
import { getCoordinatorEvents } from '../../services/eventService';
import Loader from '../../components/ui/Loader';

export default function CoordinatorDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCoordinatorEvents()
      .then((data) => {
        if (!cancelled) {
          setEvents(Array.isArray(data) ? data : []);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Failed to load events');
          setEvents([]);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Coordinator Dashboard</h1>
          <p className="text-blue-100">Manage events assigned to you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Assigned Events</h2>
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
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/events/${event.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/events/${event.id}?markAttendance=true`}
                          className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Attendance
                        </Link>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4">{event.description || ''}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {event.date
                          ? new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'TBD'}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {event.volunteersRegistered ?? 0} / {event.volunteersRequired ?? 0}{' '}
                        volunteers
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.ngoName || 'NGO'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl text-gray-500">
            <p className="text-lg">No events assigned to you yet.</p>
            <p className="mt-2 text-sm">Events will appear here when an NGO assigns you as coordinator.</p>
          </div>
        )}
      </div>
    </div>
  );
}
