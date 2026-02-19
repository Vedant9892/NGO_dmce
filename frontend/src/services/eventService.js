import api from './api';

export const getEvents = async (params = {}) => {
  const { data } = await api.get('/events', { params });
  const list = data?.events ?? data?.data ?? (Array.isArray(data) ? data : []);
  return list;
};

export const getEventById = async (id) => {
  const { data } = await api.get(`/events/${id}`);
  return data?.data ?? data;
};

export const createEvent = async (eventData) => {
  const { data } = await api.post('/events', eventData);
  return data;
};

export const registerForEvent = async (eventId) => {
  const { data } = await api.post(`/events/${eventId}/register`);
  return data;
};

export const getPlatformStats = async () => {
  try {
    const { data } = await api.get('/stats');
    return data;
  } catch {
    return null;
  }
};

export const getVolunteerStats = async () => {
  try {
    const { data } = await api.get('/volunteer/stats');
    return data;
  } catch {
    return null;
  }
};

export const getVolunteerEvents = async () => {
  try {
    const { data } = await api.get('/volunteer/events');
    if (data?.registered && data?.completed) {
      return data;
    }
    const list = Array.isArray(data) ? data : (data?.events ?? []);
    return { registered: list, completed: [] };
  } catch {
    return { registered: [], completed: [] };
  }
};

export const getVolunteerCertificates = async () => {
  try {
    const { data } = await api.get('/volunteer/certificates');
    return data?.certificates ?? (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
};

export const getNGOStats = async () => {
  try {
    const { data } = await api.get('/ngo/stats');
    return data;
  } catch {
    return null;
  }
};

export const getNGOEvents = async () => {
  try {
    const { data } = await api.get('/ngo/events');
    return data?.events ?? data?.data ?? (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
};

export const getNGORegistrations = async () => {
  try {
    const { data } = await api.get('/ngo/registrations');
    return data?.registrations ?? data?.data ?? (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
};
