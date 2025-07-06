import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, ClipboardCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QuickActions() {
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    toast({
      title: "Quick Action",
      description: `${action} functionality coming soon!`,
    });
  };

  const actions = [
    {
      id: "manual-order",
      label: "Manual Order",
      icon: Plus,
      bgColor: "bg-blue-50 hover:bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      id: "adjust-inventory",
      label: "Adjust Inventory",
      icon: Edit,
      bgColor: "bg-green-50 hover:bg-green-100",
      iconColor: "text-green-600"
    },
    {
      id: "cycle-count",
      label: "Cycle Count",
      icon: ClipboardCheck,
      bgColor: "bg-amber-50 hover:bg-amber-100",
      iconColor: "text-amber-600"
    },
    {
      id: "emergency-ship",
      label: "Emergency Ship",
      icon: AlertTriangle,
      bgColor: "bg-red-50 hover:bg-red-100",
      iconColor: "text-red-600"
    }
  ];

  return (
    <Card className="saylogix-card">
      <CardHeader className="border-b border-gray-200">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant="ghost"
                className={`flex flex-col items-center p-4 h-auto ${action.bgColor} transition-colors`}
                onClick={() => handleQuickAction(action.label)}
              >
                <Icon className={`h-6 w-6 ${action.iconColor} mb-2`} />
                <span className={`text-sm font-medium ${action.iconColor}`}>
                  {action.label}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
