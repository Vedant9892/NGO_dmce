import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Heart } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../utils/constants';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, token, logout } = useAuth();

  const isActive = (path) => location.pathname === path;
  const role = user?.role;
  const dashboardPath = role ? getDashboardPath(role) : '/login';

  const roleBadgeClass = {
    volunteer: 'bg-blue-100 text-blue-700',
    coordinator: 'bg-purple-100 text-purple-700',
    ngo: 'bg-green-100 text-green-700',
  }[role] || 'bg-gray-100 text-gray-700';

  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-green-500 p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              ServeSync
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`transition-colors ${
                isActive('/') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/events"
              className={`transition-colors ${
                isActive('/events') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Explore Events
            </Link>
            {token && (
              <Link
                to={dashboardPath}
                className={`transition-colors ${
                  isActive(dashboardPath) ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Dashboard
              </Link>
            )}
            {token && role === 'ngo' && (
              <Link
                to="/create-event"
                className={`transition-colors ${
                  isActive('/create-event') ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Create Event
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {token ? (
              <>
                <NotificationDropdown />
                {roleLabel && (
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadgeClass}`}>
                    {roleLabel}
                  </span>
                )}
                {user?.name && (
                  <span className="text-gray-600 text-sm truncate max-w-[120px]" title={user.name}>
                    {user.name}
                  </span>
                )}
                <button
                  onClick={logout}
                  className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white font-medium rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/"
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/events"
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => setIsOpen(false)}
            >
              Explore Events
            </Link>
            {token && (
              <Link
                to={dashboardPath}
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {token && role === 'ngo' && (
              <Link
                to="/create-event"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                Create Event
              </Link>
            )}
            <div className="pt-4 space-y-2">
              {token ? (
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-blue-600 font-medium border border-blue-600 rounded-lg"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full px-4 py-2 text-blue-600 font-medium border border-blue-600 rounded-lg text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white font-medium rounded-lg text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
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
