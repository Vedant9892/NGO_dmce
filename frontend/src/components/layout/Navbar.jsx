import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart, ChevronDown, LogOut } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../utils/constants';

export default function Navbar() {
  const location = useLocation();
  const { user, token, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const role = user?.role;
  const dashboardPath = role ? getDashboardPath(role) : "/login";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinkClass = (path) =>
    `relative text-sm font-semibold transition-all duration-300
     ${
       location.pathname === path
         ? "text-emerald-800"
         : "text-slate-700 hover:text-emerald-700"
     }`;

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "theme-glass-nav shadow-md py-3"
          : "theme-glass-nav py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-r from-emerald-700 to-teal-600 p-2 rounded-xl shadow-md group-hover:scale-110 transition">
            <Heart className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-gray-800 group-hover:text-emerald-700 transition">
            ServeSync
          </span>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className={navLinkClass("/")}>
            Home
          </Link>

          <Link to="/events" className={navLinkClass("/events")}>
            Explore Events
          </Link>

          <Link to="/stories" className={navLinkClass("/stories")}>
            Impact Stories
          </Link>

          <Link to="/about" className={navLinkClass("/about")}>
            About
          </Link>
          
          {token && (
            <Link to={dashboardPath} className={navLinkClass(dashboardPath)}>
              Dashboard
            </Link>
          )}

          {token && role === "ngo" && (
            <Link
              to="/create-event"
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium hover:bg-emerald-800 transition"
            >
              Create Event
            </Link>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center gap-4">

          {token ? (
            <>
              {/* Notifications */}
              <NotificationDropdown />

              {/* PROFILE */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/90 border border-emerald-100 shadow-sm rounded-xl hover:shadow-md transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white flex items-center justify-center font-semibold">
                    {user?.name?.charAt(0)}
                  </div>
                  <ChevronDown size={16} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-xl border border-emerald-100 p-4 space-y-3">
                    <div className="text-sm font-semibold text-gray-700">
                      {user?.name}
                    </div>

                    <Link
                      to={dashboardPath}
                      className="block text-sm hover:text-emerald-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setProfileOpen(false);
                      }}
                      className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-emerald-700 transition"
              >
                Sign In
              </Link>

              <Link
                to="/register"
                className="px-6 py-2 bg-gradient-to-r from-emerald-700 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition"
              >
                Get Started
              </Link>
            </>
          )}
          </div>

          <button
            className="md:hidden text-gray-700 p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-emerald-100 shadow-lg">
          <div className="px-6 py-4 space-y-4">

            <Link to="/" className="block text-slate-700 hover:text-emerald-700" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/events" className="block text-slate-700 hover:text-emerald-700" onClick={() => setIsOpen(false)}>Explore Events</Link>
            <Link to="/stories" className="block text-slate-700 hover:text-emerald-700" onClick={() => setIsOpen(false)}>Impact Stories</Link>
            <Link to="/about" className="block text-slate-700 hover:text-emerald-700" onClick={() => setIsOpen(false)}>About</Link>

            {token && (
              <Link to={dashboardPath} className="block text-slate-700 hover:text-emerald-700" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
            )}

            <div className="pt-4 border-t">
              {token ? (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="w-full py-2 bg-red-50 text-red-600 rounded-lg"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block py-2 text-center border rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block mt-2 py-2 text-center bg-gradient-to-r from-emerald-700 to-teal-600 text-white rounded-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
