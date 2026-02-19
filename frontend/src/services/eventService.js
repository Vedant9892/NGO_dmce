import api from './api';

export const getEvents = async (params = {}) => {
  try {
    const sanitized = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== '')
    );
    const { data } = await api.get('/events', { params: sanitized });
    const list = data?.events ?? data?.data ?? (Array.isArray(data) ? data : []);
    return list;
  } catch (err) {
    if (err.response?.status === 400) {
      throw new Error(err.response?.data?.message || 'Invalid request. Please try again.');
    }
    throw err;
  }
};

export const getEventById = async (id) => {
  const { data } = await api.get(`/events/${id}`);
  return data?.data ?? data;
};

export const createEvent = async (dataOrFormData) => {
  const { data } = await api.post('/events', dataOrFormData);
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

export const getCoordinatorEvents = async () => {
  try {
    const { data } = await api.get('/coordinator/events');
    return data?.data ?? data?.events ?? (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
};

export const getCoordinatorEventVolunteers = async (eventId) => {
  try {
    const { data } = await api.get(`/coordinator/events/${eventId}/volunteers`);
    return data?.data ?? [];
  } catch {
    return [];
  }
};

export const markAttendance = async (eventId, volunteerIds) => {
  const { data } = await api.put(`/events/${eventId}/attendance`, { volunteerIds });
  return data;
};

export const getNGORegistrations = async () => {
  try {
    const { data } = await api.get('/ngo/registrations');
    return data?.registrations ?? data?.data ?? (Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
};
