import { useEffect, useState } from 'react';

export default function useUnreadNotifications(token: string | null) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    const fetchUnread = async () => {
      const res = await fetch('http://localhost:4000/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCount(data.unread);
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [token]);

  return count;
}
