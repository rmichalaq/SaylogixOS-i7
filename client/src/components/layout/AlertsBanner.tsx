import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";

interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  count?: number;
  action?: string;
  actionLink?: string;
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
    <div className="space-y-2 px-4 lg:px-6">
      {activeAlerts.map((alert: SystemAlert) => (
        <Alert
          key={alert.id}
          className={`border-l-4 ${getAlertColor(alert.type)}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-start sm:items-center">
              <i className={`${getAlertIcon(alert.type)} mr-3 mt-0.5 sm:mt-0 flex-shrink-0`}></i>
              <AlertDescription className="flex-1">
                {alert.actionLink ? (
                  <Link href={alert.actionLink}>
                    <span className="hover:underline cursor-pointer">
                      <strong>System Alert:</strong> {alert.message}
                      {alert.count && ` (${alert.count})`}
                    </span>
                  </Link>
                ) : (
                  <>
                    <strong>System Alert:</strong> {alert.message}
                    {alert.count && ` (${alert.count})`}
                  </>
                )}
              </AlertDescription>
            </div>
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              {alert.action && alert.actionLink && (
                <Link href={alert.actionLink}>
                  <Button variant="outline" size="sm">
                    {alert.action}
                  </Button>
                </Link>
              )}
              {alert.action && !alert.actionLink && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Handle action without link
                    console.log(`Action: ${alert.action}`);
                  }}
                >
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
