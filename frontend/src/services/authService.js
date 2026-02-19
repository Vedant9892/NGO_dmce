import api from './api';

export const register = async (email, password, name = '', role = 'volunteer') => {
  const { data } = await api.post('/auth/register', { email, password, name, role });
  return data;
};

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};
