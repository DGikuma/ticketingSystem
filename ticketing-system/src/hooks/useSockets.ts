import { useEffect, useRef } from 'react';

type UseSocketOptions = {
  onMessage: (data: any) => void;
  url?: string;
};

export function useSocket({ onMessage, url = 'ws://localhost:3001' }: UseSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log('[✅ Socket Connected]');
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.warn('Error parsing socket message:', err);
      }
    };

    socket.onerror = (err) => {
      console.error('[❌ Socket Error]', err);
    };

    socket.onclose = () => {
      console.warn('[⚠️ Socket Disconnected]');
      // Optional: Reconnect
      setTimeout(() => {
        console.log('[🔁 Reconnecting socket...]');
        useSocket({ onMessage, url }); // naive retry
      }, 3000);
    };

    return () => {
      socket.close();
    };
  }, [onMessage, url]);

  return socketRef;
}
