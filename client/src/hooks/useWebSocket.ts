import { useState, useEffect, useRef } from 'react';

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
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    try {
      ws.current = new WebSocket(wsUrl);
      setConnectionStatus('Connecting');

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('Open');
      };

      ws.current.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        setLastMessage(event.data);
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus('Closed');
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (ws.current?.readyState === WebSocket.CLOSED) {
            console.log('Attempting to reconnect...');
            // Re-run the effect by triggering state change
            setConnectionStatus('Connecting');
          }
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Closed');
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionStatus('Closed');
    }

    return () => {
      if (ws.current) {
        console.log('Closing WebSocket connection');
        setConnectionStatus('Closing');
        ws.current.close();
      }
    };
  }, [connectionStatus === 'Closed']); // Dependency to trigger reconnection

  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  };

  return {
    lastMessage,
    connectionStatus,
    sendMessage
  };
}
