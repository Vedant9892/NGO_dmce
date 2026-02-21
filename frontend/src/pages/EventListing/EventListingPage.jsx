import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, TrendingUp, ChevronDown } from 'lucide-react';
import { getEvents } from '../../services/eventService';
import Loader from '../../components/ui/Loader';

function EventCard({ event }) {
  const volunteersRequired = event.volunteersRequired ?? 0;
  const volunteersRegistered = event.volunteersRegistered ?? 0;
  const spotsLeft = Math.max(0, volunteersRequired - volunteersRegistered);
  const isAlmostFull = spotsLeft <= 10 && spotsLeft > 0;
  const skills = event.skills ?? [];
  const trending = event.trending ?? false;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.bannerImage || 'https://placehold.co/600x400?text=Event'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        {trending && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            Trending
          </div>
        )}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
          {event.mode || 'Offline'}
        </div>
      </div>

      <div className="p-6">
        <div className="text-sm text-emerald-700 font-semibold mb-2">{event.ngoName || 'NGO'}</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description || ''}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            {event.location || 'TBD'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            {event.date
              ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : 'TBD'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 text-gray-400" />
            {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
            {isAlmostFull && <span className="ml-2 text-orange-600 font-semibold">Almost Full!</span>}
          </div>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full"
              >
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                +{skills.length - 3}
              </span>
            )}
          </div>
        )}

        <Link
          to={`/events/${event.id ?? event._id}`}
          className="block w-full text-center px-4 py-2 bg-gradient-to-r from-emerald-700 to-emerald-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default function EventListingPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getEvents()
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : (data?.events ?? []);
          setEvents(list);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load events');
          setEvents([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      !searchQuery ||
      (event.title && event.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLocation = locationFilter === 'all' || (event.location && event.location.includes(locationFilter));
    const matchesMode = modeFilter === 'all' || event.mode === modeFilter;
    const matchesSkill =
      skillFilter === 'all' ||
      (event.skills && Array.isArray(event.skills) && event.skills.includes(skillFilter));

    return matchesSearch && matchesLocation && matchesMode && matchesSkill;
  });

  const trendingEvents = events.filter((event) => event.trending);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover Opportunities</h1>
          <p className="text-lg text-gray-600">Find volunteer events that match your passion and skills</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="all">All Locations</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Pune">Pune</option>
                  <option value="Online">Online</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="all">All Skills</option>
                  <option value="Teaching">Teaching</option>
                  <option value="Programming">Programming</option>
                  <option value="Teamwork">Teamwork</option>
                  <option value="Communication">Communication</option>
                  <option value="Organization">Organization</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white cursor-pointer"
                >
                  <option value="all">All Modes</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {trendingEvents.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <TrendingUp className="h-6 w-6 text-orange-500 mr-2" />
              <h2 className="text-2xl font-bold text-gray-900">Trending Opportunities</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingEvents.map((event) => (
                <EventCard key={event.id ?? event._id} event={event} />
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Events</h2>
          <p className="text-gray-600">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'opportunity' : 'opportunities'} found
          </p>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id ?? event._id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500 text-lg">No events found. Check back later for new opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
}

