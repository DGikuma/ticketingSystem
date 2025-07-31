import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils'; // Optional utility if you have className merge
import { toast } from 'react-toastify';

interface Notification {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    message: 'New ticket assigned to you',
    createdAt: new Date().toISOString(),
    read: false,
  },
  {
    id: 2,
    message: 'A ticket was updated',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    read: true,
  },
];

export default function SupportNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success('Marked as read');
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Notifications</h2>
        <Bell className="w-6 h-6 text-primary" />
      </div>

      {loading ? (
        <div className="text-gray-500 dark:text-gray-300">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-300">No notifications yet.</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                'p-4 rounded-xl border shadow-sm transition-all',
                n.read
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : 'bg-blue-50 dark:bg-blue-900 border-blue-400'
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{n.message}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
