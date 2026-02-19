import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, QrCode, BarChart3, Award, Heart, ArrowRight, Calendar, Users, MapPin, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getPlatformStats, getEvents } from '../../services/eventService';
import AnimatedCounter from '../../components/ui/AnimatedCounter';
import StatSkeleton from '../../components/ui/StatSkeleton';

export default function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPlatformStats()
      .then((data) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getEvents()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) {
          const trending = list.filter((e) => e.trending).slice(0, 3);
          setTrendingEvents(trending);
        }
      })
      .catch(() => {
        if (!cancelled) setTrendingEvents([]);
      })
      .finally(() => {
        if (!cancelled) setTrendingLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-white">
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Connecting Volunteers with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                Meaningful Impact
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              ServeSync bridges the gap between passionate volunteers and NGOs creating change.
              Discover opportunities, track your impact, and be part of something bigger.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/events"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all inline-flex items-center justify-center"
              >
                Explore Opportunities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              {!user && (
                <>
                  <Link
                    to="/login"
                    className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors inline-flex items-center justify-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
              {user?.role === 'ngo' && (
                <Link
                  to="/create-event"
                  className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                >
                  Post an Event
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Global Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsLoading ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <StatSkeleton key={i} />
                ))}
              </>
            ) : stats ? (
              <>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                    <AnimatedCounter value={stats.totalEvents ?? 0} />
                  </div>
                  <div className="text-gray-600 flex items-center justify-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Total Events
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-500 mb-1">
                    <AnimatedCounter value={stats.totalVolunteers ?? 0} />
                  </div>
                  <div className="text-gray-600 flex items-center justify-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    Total Volunteers
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                    <AnimatedCounter value={stats.totalAttendanceMarked ?? 0} />
                  </div>
                  <div className="text-gray-600 flex items-center justify-center gap-1">
                    <Award className="h-4 w-4 text-gray-400" />
                    Total Attendance
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-500 mb-1">
                    <AnimatedCounter value={stats.citiesCovered ?? 0} />
                  </div>
                  <div className="text-gray-600 flex items-center justify-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Cities Covered
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-2 md:col-span-4 text-center py-8 text-gray-500">
                Stats unavailable. Please try again later.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Trending Events</h2>
          </div>
          {trendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-40 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : trendingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {trendingEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/events/${event.id ?? event._id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden block"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={event.bannerImage || 'https://placehold.co/600x300?text=Event'}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{event.description || ''}</p>
                    <p className="text-sm text-blue-600 font-medium mt-2">View details →</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No trending events right now. Check back soon!</p>
          )}
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ServeSync?
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to make volunteering seamless and rewarding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border border-gray-100">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Event Discovery
              </h3>
              <p className="text-gray-600">
                Find opportunities that match your skills, interests, and availability with our intelligent matching system.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border border-gray-100">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                QR Attendance Tracking
              </h3>
              <p className="text-gray-600">
                Seamless check-in and check-out with QR codes. Track your volunteer hours automatically.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border border-gray-100">
              <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Impact Analytics
              </h3>
              <p className="text-gray-600">
                Visualize your contribution with detailed analytics and impact reports. See the difference you make.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow border border-gray-100">
              <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Volunteer Recognition
              </h3>
              <p className="text-gray-600">
                Earn certificates, badges, and build a portfolio of your volunteer work to showcase your impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-600 to-green-500 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-blue-100">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-4 text-blue-600 font-bold text-xl">
                1
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                Browse Events
              </h3>
              <p className="text-blue-100">
                Explore hundreds of volunteer opportunities from verified NGOs. Filter by location, skills, and interests.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-4 text-green-600 font-bold text-xl">
                2
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                Register & Join
              </h3>
              <p className="text-blue-100">
                Sign up for events with one click. Receive confirmation and event details instantly via email.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-4 text-blue-600 font-bold text-xl">
                3
              </div>
              <h3 className="text-2xl font-semibold text-white mb-3">
                Make Impact
              </h3>
              <p className="text-blue-100">
                Participate in events, track your hours, and earn certificates. Build your volunteer portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white p-12 rounded-2xl shadow-xl">
            <Heart className="h-16 w-16 text-red-500 mx-auto mb-6" fill="currentColor" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join as a volunteer, coordinator, or NGO. Create your account and get started.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all inline-flex items-center justify-center"
              >
                Sign Up
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
              >
                Sign In
              </Link>
              <Link
                to="/events"
                className="px-8 py-4 text-gray-600 font-semibold rounded-lg hover:text-gray-900 hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
