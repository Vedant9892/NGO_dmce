import { useState, useEffect, useCallback } from 'react';
import { getNotifications, markNotificationAsRead } from '../services/notificationService';

const POLL_INTERVAL_MS = 20 * 1000;

export function useNotifications(enabled = true) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const { data } = await getNotifications();
      const list = data?.data ?? [];
      setNotifications(Array.isArray(list) ? list : []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const markAsRead = useCallback(async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id || n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    if (!enabled) return;
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchNotifications, enabled]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, loading, unreadCount, markAsRead, refresh: fetchNotifications };
}
