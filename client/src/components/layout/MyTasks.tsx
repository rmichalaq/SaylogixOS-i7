import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Task {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: "low" | "normal" | "high" | "urgent";
  orderId?: number;
  createdAt: string;
}

export default function MyTasks() {
  const [isMinimized, setIsMinimized] = useState(false);

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/dashboard/tasks"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-error-500";
      case "high":
        return "bg-warning-500";
      case "normal":
        return "bg-primary-500";
      case "low":
        return "bg-secondary-400";
      default:
        return "bg-secondary-400";
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case "address_verification":
        return "fas fa-map-marker-alt";
      case "picking_exception":
        return "fas fa-hand-paper";
      case "courier_assignment":
        return "fas fa-truck";
      case "inventory_adjustment":
        return "fas fa-boxes";
      case "quality_check":
        return "fas fa-clipboard-check";
      default:
        return "fas fa-tasks";
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-primary-500 hover:bg-primary-600 text-white rounded-full w-12 h-12"
        >
          <i className="fas fa-tasks"></i>
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <Card className="w-80 shadow-lg">
        <CardHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold text-secondary-900 flex items-center">
            <i className="fas fa-tasks mr-2 text-primary-500"></i>
            My Tasks
            {tasks.length > 0 && (
              <Badge className="ml-2 bg-primary-500 text-white">
                {tasks.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <i className="fas fa-minus"></i>
          </Button>
        </CardHeader>
        <CardContent className="p-4 max-h-60 overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="text-center text-secondary-500 py-4">
              <i className="fas fa-check-circle text-2xl mb-2"></i>
              <p className="text-sm">No tasks at the moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task: Task) => (
                <div key={task.id} className="flex items-start space-x-3">
                  <div 
                    className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(task.priority)}`}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <i className={`${getPriorityIcon(task.type)} text-sm text-secondary-600`}></i>
                      <p className="text-sm text-secondary-900 font-medium">
                        {task.title}
                      </p>
                    </div>
                    <p className="text-xs text-secondary-500 mt-1">
                      {task.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-secondary-400">
                        {new Date(task.createdAt).toLocaleTimeString()}
                      </span>
                      {task.priority === "urgent" && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
