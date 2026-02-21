import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  QrCode,
  BarChart3,
  Award,
  Heart,
  ArrowRight,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getPlatformStats, getEvents } from "../../services/eventService";
import AnimatedCounter from "../../components/ui/AnimatedCounter";
import StatSkeleton from "../../components/ui/StatSkeleton";

export default function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac",
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d",
  ];

  // Slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === heroImages.length - 1 ? 0 : prev + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Stats
  useEffect(() => {
    let cancelled = false;
    getPlatformStats()
      .then((data) => {
        if (!cancelled && data) setStats(data);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Trending
  useEffect(() => {
    let cancelled = false;
    getEvents()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) {
          const trending = list.filter((e) => e.trending).slice(0, 3);
          setTrendingEvents(trending);
        }
      })
      .finally(() => {
        if (!cancelled) setTrendingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-[#F8FAFC]">

      {/* ================= HERO SECTION WITH SLIDER ================= */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">

        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={img}
              alt="Volunteer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
        ))}

        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Your Volunteer Work <br />
            <span className="text-[#16A34A]">Can Change a Life</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-200 mb-10">
            Join NGOs, participate in meaningful events, track your impact,
            and build your social contribution portfolio with ServeSync.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/events"
              className="px-8 py-4 bg-[#16A34A] hover:bg-[#14532D] transition text-white font-semibold rounded-lg shadow-lg flex items-center"
            >
              Explore Opportunities <ArrowRight className="ml-2 h-5 w-5" />
            </Link>

            {!user && (
              <>
                <Link
                  to="/login"
                  className="px-8 py-4 border border-white text-white rounded-lg hover:bg-white hover:text-black transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Sign Up
                </Link>
              </>
            )}

            {user?.role === "ngo" && (
              <Link
                to="/create-event"
                className="px-8 py-4 bg-[#0F172A] text-white rounded-lg hover:bg-black transition"
              >
                Post an Event
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ================= GLOBAL IMPACT (IMPROVED DESIGN ONLY) ================= */}
      <section className="py-24 px-4 bg-gradient-to-br from-[#F8FAFC] via-white to-[#ECFDF5]">
        <div className="max-w-7xl mx-auto text-center">

          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
            Global Impact
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto mb-16">
            Real-time statistics showcasing the collective efforts of NGOs,
            volunteers, and coordinators creating meaningful impact.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsLoading ? (
              [1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)
            ) : stats ? (
              <>
                <StatCard icon={<Calendar />} value={stats.totalEvents ?? 0} label="Total Events" gradient="from-emerald-600 to-cyan-500" />
                <StatCard icon={<Users />} value={stats.totalVolunteers ?? 0} label="Total Volunteers" gradient="from-emerald-500 to-emerald-500" />
                <StatCard icon={<Award />} value={stats.totalAttendanceMarked ?? 0} label="Total Attendance" gradient="from-purple-500 to-indigo-500" />
                <StatCard icon={<MapPin />} value={stats.citiesCovered ?? 0} label="Cities Covered" gradient="from-orange-500 to-pink-500" />
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* ================= TRENDING EVENTS ================= */}
      <section className="py-20 px-4 bg-[#F1F5F9]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-10">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <h2 className="text-3xl font-bold text-[#0F172A]">
              Trending Events
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id ?? event._id}`}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition overflow-hidden"
              >
                <img
                  src={event.bannerImage || "https://placehold.co/600x300?text=Event"}
                  alt={event.title}
                  className="h-48 w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {event.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

/* ===== Improved Stat Card Design Only ===== */
function StatCard({ icon, value, label, gradient }) {
  return (
    <div className="group relative bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border border-gray-100">

      <div className={`w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-r ${gradient} text-white mx-auto mb-6 shadow-lg`}>
        {icon}
      </div>

      <div className="text-4xl font-bold text-[#0F172A]">
        <AnimatedCounter value={value} />
      </div>

      <div className="text-gray-500 mt-3 font-medium">
        {label}
      </div>

      <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-emerald-100 transition"></div>
    </div>
  );
}
