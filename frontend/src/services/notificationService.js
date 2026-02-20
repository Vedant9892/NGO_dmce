import api from './api';

export const getNotifications = () => api.get('/notifications');

export const markNotificationAsRead = (id) => api.patch(`/notifications/${id}/read`);

export const sendDirectNotification = (payload) =>
  api.post('/notifications/direct', payload);

export const sendBroadcastNotification = (payload) =>
  api.post('/notifications/broadcast', payload);

export const sendEmergencyNotification = (payload) =>
  api.post('/notifications/emergency', payload);
