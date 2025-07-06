import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  activeOrders: number;
  inPicking: number;
  readyToShip: number;
  deliveredToday: number;
}

interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  status: "success" | "warning" | "error";
  orderId?: string;
}

interface RecentOrder {
  id: number;
  saylogixNumber: string;
  sourceNumber: string;
  status: string;
  itemCount: number;
  courierService: string;
  createdAt: string;
}

export default function Dashboard() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: activity = [] } = useQuery<ActivityEvent[]>({
    queryKey: ["/api/dashboard/activity"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: recentOrders = [] } = useQuery<RecentOrder[]>({
    queryKey: ["/api/orders", { limit: 10 }],
    refetchInterval: 30000,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success-100 text-success-800";
      case "dispatched":
        return "bg-primary-100 text-primary-800";
      case "packed":
        return "bg-success-100 text-success-800";
      case "picking":
        return "bg-warning-100 text-warning-800";
      case "exception":
        return "bg-error-100 text-error-800";
      default:
        return "bg-secondary-100 text-secondary-800";
    }
  };

  const getActivityIcon = (type: string, status: string) => {
    let icon = "fas fa-info-circle";
    switch (type) {
      case "order_picked":
        icon = "fas fa-hand-paper";
        break;
      case "order_received":
        icon = "fas fa-shopping-cart";
        break;
      case "manifest_generated":
        icon = "fas fa-file-alt";
        break;
      case "picking_exception":
        icon = "fas fa-exclamation-triangle";
        break;
      case "address_verification":
        icon = "fas fa-map-marker-alt";
        break;
    }

    let colorClass = "text-primary-500";
    switch (status) {
      case "success":
        colorClass = "text-success-500";
        break;
      case "warning":
        colorClass = "text-warning-500";
        break;
      case "error":
        colorClass = "text-error-500";
        break;
    }

    return `${icon} ${colorClass}`;
  };

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // TODO: Implement quick action handlers
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Active Orders</p>
                <p className="text-3xl font-bold text-secondary-900">
                  {stats?.activeOrders || 0}
                </p>
                <p className="text-sm text-success-600">↗ +12% from yesterday</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-shopping-cart text-primary-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">In Picking</p>
                <p className="text-3xl font-bold text-secondary-900">
                  {stats?.inPicking || 0}
                </p>
                <p className="text-sm text-warning-600">→ 2 priority orders</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-hand-paper text-warning-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Ready to Ship</p>
                <p className="text-3xl font-bold text-secondary-900">
                  {stats?.readyToShip || 0}
                </p>
                <p className="text-sm text-success-600">↗ +8% efficiency</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-shipping-fast text-success-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Delivered Today</p>
                <p className="text-3xl font-bold text-secondary-900">
                  {stats?.deliveredToday || 0}
                </p>
                <p className="text-sm text-success-600">↗ 98.2% success rate</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-success-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Activity and Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-pulse mr-2 text-primary-500"></i>
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {activity.length === 0 ? (
                <div className="text-center text-secondary-500 py-8">
                  <i className="fas fa-stream text-2xl mb-2"></i>
                  <p>No recent activity</p>
                </div>
              ) : (
                activity.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="mt-1">
                      <i className={getActivityIcon(event.type, event.status)}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-secondary-900">{event.message}</p>
                      <p className="text-xs text-secondary-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                        {event.orderId && ` • Order: ${event.orderId}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-line mr-2 text-primary-500"></i>
              Order Processing Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-chart-area text-4xl text-secondary-300 mb-4"></i>
                <p className="text-secondary-500">Chart visualization</p>
                <p className="text-sm text-secondary-400">Shows order processing trends over time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-primary-50 hover:bg-primary-100 border-primary-200"
                onClick={() => handleQuickAction("manual_order")}
              >
                <i className="fas fa-plus text-primary-600 text-xl mb-2"></i>
                <span className="text-sm font-medium text-primary-700">Manual Order</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-success-50 hover:bg-success-100 border-success-200"
                onClick={() => handleQuickAction("inventory_adjust")}
              >
                <i className="fas fa-edit text-success-600 text-xl mb-2"></i>
                <span className="text-sm font-medium text-success-700">Adjust Inventory</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-warning-50 hover:bg-warning-100 border-warning-200"
                onClick={() => handleQuickAction("cycle_count")}
              >
                <i className="fas fa-clipboard-check text-warning-600 text-xl mb-2"></i>
                <span className="text-sm font-medium text-warning-700">Cycle Count</span>
              </Button>
              
              <Button
                variant="outline"
                className="flex flex-col items-center p-4 h-auto bg-error-50 hover:bg-error-100 border-error-200"
                onClick={() => handleQuickAction("emergency_ship")}
              >
                <i className="fas fa-exclamation text-error-600 text-xl mb-2"></i>
                <span className="text-sm font-medium text-error-700">Emergency Ship</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Courier
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-secondary-500">
                        No recent orders
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-secondary-900">
                              {order.saylogixNumber}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {order.sourceNumber}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge className={`${getStatusColor(order.status)} border-0`}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary-900">
                          {order.itemCount} items
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary-900">
                          {order.courierService || "-"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-secondary-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
