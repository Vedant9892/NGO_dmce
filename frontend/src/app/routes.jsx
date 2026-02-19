import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/ui/Loader';
import LandingPage from '../pages/Landing/LandingPage';
import EventListingPage from '../pages/EventListing/EventListingPage';
import EventDetailsPage from '../pages/EventDetails/EventDetailsPage';
import CreateEventPage from '../pages/CreateEvent/CreateEventPage';
import VolunteerDashboard from '../pages/VolunteerDashboard/VolunteerDashboard';
import NGODashboard from '../pages/NGODashboard/NGODashboard';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';

function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/events" element={<EventListingPage />} />
      <Route path="/events/:id" element={<EventDetailsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/volunteer-dashboard"
        element={
          <ProtectedRoute>
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ngo-dashboard"
        element={
          <ProtectedRoute>
            <NGODashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-event"
        element={
          <ProtectedRoute>
            <CreateEventPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
