import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../utils/constants';
import { ROLES } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ROLE_OPTIONS = [
  { value: ROLES.VOLUNTEER, label: 'Volunteer', desc: 'Find and join events', icon: Users },
  { value: ROLES.NGO, label: 'NGO', desc: 'Post events and manage volunteers', icon: Heart },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, user, token } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.VOLUNTEER);
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const needsOrganization = role === ROLES.NGO;

  useEffect(() => {
    if (token && user) {
      navigate(getDashboardPath(user.role || 'volunteer'), { replace: true });
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (needsOrganization && !organization.trim()) {
      setError('Organization is required for NGO accounts');
      return;
    }
    setLoading(true);
    try {
      const data = await register(email, password, name, role, organization.trim());
      const userData = data?.user ?? data;
      navigate(getDashboardPath(userData?.role || role));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
          <p className="mt-2 text-gray-600">Create your SevaSetu account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">I want to join as</label>
            <div className="grid grid-cols-1 gap-3">
              {ROLE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = role === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-colors ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-emerald-700' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{opt.label}</div>
                      <div className="text-sm text-gray-600">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4"
          />
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mb-4"
          />
          {needsOrganization && (
            <Input
              label="Organization"
              type="text"
              required={needsOrganization}
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g., Green Earth NGO"
              className="mb-6"
            />
          )}
          {!needsOrganization && <div className="mb-6" />}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-700 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

