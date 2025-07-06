import { useState, useEffect, useRef } from "react";

interface UseWebSocketReturn {
  lastMessage: string | null;
  connectionStatus: 'Connecting' | 'Open' | 'Closing' | 'Closed';
  sendMessage: (message: string) => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Open' | 'Closing' | 'Closed'>('Closed');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // WebSocket temporarily disabled to prevent connection loops
    setConnectionStatus('Closed');
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  return {
    lastMessage,
    connectionStatus,
    sendMessage
  };
}