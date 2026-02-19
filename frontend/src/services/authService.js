import api from './api';

export const register = async (email, password, name = '', role = 'volunteer', organization = '') => {
  const payload = { email, password, name, role };
  if (['ngo', 'coordinator'].includes(role)) payload.organization = organization;
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};
