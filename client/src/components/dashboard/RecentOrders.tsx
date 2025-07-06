import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function RecentOrdersContent() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
    retry: false
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'picking': return 'bg-amber-100 text-amber-800';
      case 'packed': return 'bg-green-100 text-green-800';
      case 'exception': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ago`;
  };

  if (error) {
    return (
      <Card className="saylogix-card border-red-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8 text-gray-500">
            <p>Unable to load recent orders</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="saylogix-card">
        <CardHeader className="border-b border-gray-200">
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="saylogix-card">
      <CardHeader className="border-b border-gray-200 flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent Orders</CardTitle>
        <Link href="/orders">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
            View All <ExternalLink className="h-3 w-3 ml-1" />
          </button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders?.slice(0, 5).map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.saylogixNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.sourceChannel}: #{order.sourceOrderNumber}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Loading...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.courierAssigned || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimeAgo(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecentOrders() {
  return (
    <ErrorBoundary>
      <RecentOrdersContent />
    </ErrorBoundary>
  );
}
