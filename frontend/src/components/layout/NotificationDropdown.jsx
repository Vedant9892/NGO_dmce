import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function NotificationItem({ n, onMarkAsRead }) {
  const id = n.id ?? n._id;
  const senderName = n.senderName ?? n.sender?.name ?? 'Unknown';
  const eventTitle = n.eventTitle ?? n.eventId?.title ?? 'Unknown';

  const handleClick = () => {
    if (!n.isRead) onMarkAsRead(id);
  };

  const baseClasses = `w-full text-left px-3 py-2.5 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
    !n.isRead ? 'bg-blue-50/50' : ''
  }`;

  const badgeStyles = {
    DIRECT_MESSAGE: 'bg-blue-100 text-blue-700',
    EVENT_BROADCAST: 'bg-green-100 text-green-700',
    EMERGENCY_ALERT: 'bg-red-100 text-red-700',
  };
  const badgeClass = badgeStyles[n.type] ?? 'bg-gray-100 text-gray-700';

  if (n.type === 'EMERGENCY_ALERT') {
    return (
      <button
        onClick={handleClick}
        className={`${baseClasses} border-l-2 border-l-red-500`}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base" role="img" aria-hidden>🔴</span>
          <span className="font-semibold text-red-700 text-sm">
            EMERGENCY – {eventTitle}
          </span>
        </div>
        <div className="text-xs text-red-600 mb-0.5">From {senderName}</div>
        <div className="text-gray-700 text-sm">{n.message}</div>
        <div className="flex items-center justify-between mt-1">
          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${badgeClass}`}>
            Alert
          </span>
          <span className="text-gray-400 text-xs">{formatTime(n.createdAt)}</span>
        </div>
      </button>
    );
  }

  if (n.type === 'DIRECT_MESSAGE') {
    return (
      <button onClick={handleClick} className={baseClasses}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base" role="img" aria-hidden>📩</span>
          <span className="font-medium text-gray-900 text-sm">
            Message from {senderName}
          </span>
        </div>
        <div className="text-gray-600 text-sm truncate pl-6">{n.message}</div>
        <div className="flex items-center justify-between mt-1 pl-6">
          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${badgeClass}`}>
            Direct
          </span>
          <span className="text-gray-400 text-xs">{formatTime(n.createdAt)}</span>
        </div>
      </button>
    );
  }

  if (n.type === 'EVENT_BROADCAST') {
    return (
      <button onClick={handleClick} className={baseClasses}>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base" role="img" aria-hidden>📢</span>
          <span className="font-medium text-gray-900 text-sm">{eventTitle}</span>
        </div>
        <div className="text-gray-600 text-sm truncate pl-6">{n.message}</div>
        <div className="flex items-center justify-between mt-1 pl-6">
          <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${badgeClass}`}>
            Broadcast
          </span>
          <span className="text-gray-400 text-xs">{formatTime(n.createdAt)}</span>
        </div>
      </button>
    );
  }

  return (
    <button onClick={handleClick} className={baseClasses}>
      <div className="font-medium text-gray-900 text-sm">{n.title}</div>
      <div className="text-gray-600 text-sm truncate">{n.message}</div>
      <div className="text-gray-400 text-xs mt-0.5">{formatTime(n.createdAt)}</div>
    </button>
  );
}

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead } = useNotifications(true);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border z-50">
          <div className="p-2 border-b text-sm font-medium text-gray-700">Notifications</div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-gray-500 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n.id ?? n._id}
                  n={n}
                  onMarkAsRead={markAsRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
