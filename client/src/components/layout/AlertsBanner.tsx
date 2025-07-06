import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  count?: number;
  action?: string;
}

export default function AlertsBanner() {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const { data: alerts = [] } = useQuery({
    queryKey: ["/api/dashboard/alerts"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const activeAlerts = alerts.filter((alert: SystemAlert) => 
    !dismissedAlerts.includes(alert.id)
  );

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  if (activeAlerts.length === 0) {
    return null;
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-error-100 border-error-500 text-error-700";
      case "warning":
        return "bg-warning-100 border-warning-500 text-warning-700";
      case "info":
        return "bg-primary-100 border-primary-500 text-primary-700";
      default:
        return "bg-warning-100 border-warning-500 text-warning-700";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return "fas fa-times-circle";
      case "warning":
        return "fas fa-exclamation-triangle";
      case "info":
        return "fas fa-info-circle";
      default:
        return "fas fa-exclamation-triangle";
    }
  };

  return (
    <div className="space-y-2">
      {activeAlerts.map((alert: SystemAlert) => (
        <Alert
          key={alert.id}
          className={`border-l-4 ${getAlertColor(alert.type)}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className={`${getAlertIcon(alert.type)} mr-3`}></i>
              <AlertDescription>
                <strong>System Alert:</strong> {alert.message}
                {alert.count && ` (${alert.count})`}
              </AlertDescription>
            </div>
            <div className="flex items-center space-x-2">
              {alert.action && (
                <Button variant="outline" size="sm">
                  {alert.action}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissAlert(alert.id)}
                className="text-current hover:bg-transparent"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
