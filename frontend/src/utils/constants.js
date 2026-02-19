export const API_BASE_URL = 'http://localhost:5000/api';

export const ROLES = {
  VOLUNTEER: 'volunteer',
  COORDINATOR: 'coordinator',
  NGO: 'ngo',
};

export const getDashboardPath = (role) => {
  const map = {
    volunteer: '/dashboard/volunteer',
    coordinator: '/dashboard/coordinator',
    ngo: '/dashboard/ngo',
  };
  return map[role] || '/dashboard/volunteer';
};
