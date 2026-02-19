import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, QrCode, BarChart3, Award, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getPlatformStats } from '../../services/eventService';
import Loader from '../../components/ui/Loader';

export default function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getPlatformStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch(() => {
        if (!cancelled) setStats(null);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const formatStat = (value) => {
    if (value == null || value === undefined) return '—';
    if (typeof value === 'number' && value >= 1000) return `${Math.floor(value / 1000)}K+`;
    if (typeof value === 'number') return `${value}+`;
    return value;
  };

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

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {statsLoading ? (
                <Loader size="sm" />
              ) : (
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatStat(stats?.totalEvents)}
                </div>
              )}
              <div className="text-gray-600">Active Events</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {statsLoading ? (
                <Loader size="sm" />
              ) : (
                <div className="text-4xl font-bold text-green-500 mb-2">
                  {formatStat(stats?.totalVolunteers)}
                </div>
              )}
              <div className="text-gray-600">Volunteers</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              {statsLoading ? (
                <Loader size="sm" />
              ) : (
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {formatStat(stats?.totalNGOs)}
                </div>
              )}
              <div className="text-gray-600">NGO Partners</div>
            </div>
          </div>
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
              Join thousands of volunteers creating positive change in communities worldwide.
            </p>
            <Link
              to="/events"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all inline-flex items-center"
            >
              Start Volunteering Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
