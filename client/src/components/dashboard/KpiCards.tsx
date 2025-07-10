import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Hand, Truck, CheckCircle } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function KpiCardsContent() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: false // Don't retry failed requests to avoid noise
  });

  // Show error state if needed
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-red-200">
            <CardContent className="p-6">
              <div className="text-center text-gray-500">
                <p className="text-sm">Unable to load stats</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Active Orders",
      value: stats?.activeOrders || 0,
      icon: ShoppingCart,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "In Picking",
      value: stats?.inPicking || 0,
      icon: Hand,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600"
    },
    {
      title: "Ready to Ship",
      value: stats?.readyToShip || 0,
      icon: Truck,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Delivered Today",
      value: stats?.deliveredToday || 0,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="saylogix-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function KpiCards() {
  return (
    <ErrorBoundary>
      <KpiCardsContent />
    </ErrorBoundary>
  );
}
