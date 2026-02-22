import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../utils/constants';

export default function Footer() {
  const { user } = useAuth();
  const dashboardPath = user ? getDashboardPath(user.role) : '/dashboard/volunteer';
  return (
    <footer className="mt-16 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-emerald-700 to-emerald-500 p-2 rounded-lg">
                <Heart className="h-5 w-5 text-white" fill="white" />
              </div>
              <span className="text-xl font-bold text-white">SevaSetu</span>
            </div>
            <p className="text-sm text-emerald-100/80">
              Connecting volunteers with meaningful opportunities to create lasting impact in communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-emerald-400 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-emerald-400 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Volunteers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events" className="hover:text-emerald-400 transition-colors">
                  Browse Opportunities
                </Link>
              </li>
              <li>
                <Link to={dashboardPath} className="hover:text-emerald-400 transition-colors">
                  My Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Coordinators</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events" className="hover:text-emerald-400 transition-colors">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link to="/dashboard/coordinator" className="hover:text-emerald-400 transition-colors">
                  Coordinator Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For NGOs</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard/ngo" className="hover:text-emerald-400 transition-colors">
                  NGO Portal
                </Link>
              </li>
              <li>
                <Link to="/create-event" className="hover:text-emerald-400 transition-colors">
                  Post an Event
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Resources
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-emerald-400" />
                <span>contact@sevasetu.org</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>Bangalore, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-900/70 mt-8 pt-8 text-sm text-center text-emerald-100/75">
          <p>&copy; 2024 SevaSetu. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

