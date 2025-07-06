import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  source?: string;
}

function LiveActivityContent() {
  const [realtimeEvents, setRealtimeEvents] = useState<ActivityEvent[]>([]);
  
  // Use WebSocket but handle errors gracefully
  let lastMessage = null;
  try {
    const websocket = useWebSocket();
    lastMessage = websocket.lastMessage;
  } catch (error) {
    console.warn('WebSocket hook failed:', error);
  }

  const { data: events, error } = useQuery({
    queryKey: ["/api/events"],
    refetchInterval: 10000, // Refresh every 10 seconds
    retry: false
  });

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        if (data.type === 'event') {
          const newEvent: ActivityEvent = {
            id: Date.now().toString(),
            type: data.data.eventType || 'system',
            message: data.data.description || 'System event occurred',
            timestamp: new Date().toISOString(),
            source: data.data.source
          };
          
          setRealtimeEvents(prev => [newEvent, ...prev.slice(0, 9)]); // Keep only 10 most recent
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  const getEventStatusColor = (type: string) => {
    if (type.includes('success') || type.includes('completed')) return 'bg-green-500';
    if (type.includes('error') || type.includes('exception')) return 'bg-red-500';
    if (type.includes('warning') || type.includes('verification')) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
  };

  // Show error state if API fails
  if (error) {
    return (
      <Card className="saylogix-card border-red-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-red-600" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>Unable to load activity feed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combine real-time events with recent API events
  const allEvents = [
    ...realtimeEvents,
    ...(events?.slice(0, 5).map((event: any) => ({
      id: event.id,
      type: event.eventType,
      message: event.description || `${event.eventType} for ${event.entityType}:${event.entityId}`,
      timestamp: event.createdAt,
      source: event.sourceSystem
    })) || [])
  ].slice(0, 10);

  return (
    <Card className="saylogix-card">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          Live Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {allEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No recent activity</p>
            </div>
          ) : (
            allEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 ${getEventStatusColor(event.type)} saylogix-activity-dot mt-2`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{event.message}</p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(event.timestamp)}
                    {event.source && ` • ${event.source}`}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function LiveActivity() {
  return (
    <ErrorBoundary>
      <LiveActivityContent />
    </ErrorBoundary>
  );
}
