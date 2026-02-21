import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getDashboardPath } from '../utils/constants';
import Loader from '../components/ui/Loader';

import LandingPage from '../pages/Landing/LandingPage';
import EventListingPage from '../pages/EventListing/EventListingPage';
import EventDetailsPage from '../pages/EventDetails/EventDetailsPage';
import CreateEventPage from '../pages/CreateEvent/CreateEventPage';
import VolunteerDashboard from '../pages/VolunteerDashboard/VolunteerDashboard';
import CoordinatorDashboard from '../pages/CoordinatorDashboard/CoordinatorDashboard';
import NGODashboard from '../pages/NGODashboard/NGODashboard';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import AboutPage from '../pages/About/AboutPage'; 
import ImpactStoriesPage from '../pages/ImpactStories/ImpactStoriesPage';

function RoleProtectedRoute({ children, allowedRole }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role;

  if (userRole !== allowedRole) {
    return <Navigate to={getDashboardPath(userRole)} replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/events" element={<EventListingPage />} />
      <Route path="/events/explore" element={<Navigate to="/events" replace />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/about" element={<AboutPage />} /> {/* ✅ Working Now */}
      <Route path="/stories" element={<ImpactStoriesPage />} />

      <Route
        path="/dashboard/volunteer"
        element={
          <RoleProtectedRoute allowedRole="volunteer">
            <VolunteerDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/coordinator"
        element={
          <RoleProtectedRoute allowedRole="coordinator">
            <CoordinatorDashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/dashboard/ngo"
        element={
          <RoleProtectedRoute allowedRole="ngo">
            <NGODashboard />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/create-event"
        element={
          <RoleProtectedRoute allowedRole="ngo">
            <CreateEventPage />
          </RoleProtectedRoute>
        }
      />

      <Route path="/volunteer-dashboard" element={<Navigate to="/dashboard/volunteer" replace />} />
      <Route path="/coordinator-dashboard" element={<Navigate to="/dashboard/coordinator" replace />} />
      <Route path="/ngo-dashboard" element={<Navigate to="/dashboard/ngo" replace />} />
    </Routes>
  );
}