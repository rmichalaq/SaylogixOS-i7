import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, Minus, AlertTriangle, Clock, MapPin } from "lucide-react";

export function MyTasks() {
  const [isMinimized, setIsMinimized] = useState(false);

  const tasks = [
    {
      id: 1,
      title: "Address verification needed",
      description: "Order SLYY-2024-001248 • High Priority",
      priority: "high",
      type: "verification",
      icon: MapPin
    },
    {
      id: 2,
      title: "Pick exception review",
      description: "Bin A-12-03 • SKU: ELEC-001",
      priority: "medium",
      type: "exception",
      icon: AlertTriangle
    },
    {
      id: 3,
      title: "Courier assignment",
      description: "2 orders awaiting assignment",
      priority: "medium",
      type: "assignment",
      icon: Clock
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <Button
          onClick={() => setIsMinimized(false)}
          className="saylogix-primary rounded-full w-12 h-12 p-0"
        >
          <CheckSquare className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <Card className="saylogix-floating-panel w-80">
        <CardHeader className="border-b border-gray-200 flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center">
            <CheckSquare className="h-5 w-5 mr-2 text-blue-600" />
            My Tasks
            <Badge className="ml-2 saylogix-primary text-white">
              {tasks.length}
            </Badge>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMinimized(true)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 max-h-60 overflow-y-auto">
          <div className="space-y-3">
            {tasks.map((task) => {
              const Icon = task.icon;
              return (
                <div key={task.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <div className={`w-2 h-2 ${getPriorityColor(task.priority)} rounded-full mt-2`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.description}</p>
                  </div>
                  <Icon className="h-4 w-4 text-gray-400 mt-1" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
