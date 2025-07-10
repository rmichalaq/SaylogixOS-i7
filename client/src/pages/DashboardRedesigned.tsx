import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  TruckIcon, 
  MapPin, 
  Package, 
  Clock, 
  Activity, 
  CheckCircle, 
  XCircle, 
  ShoppingCart,
  Route,
  FileText,
  Users,
  AlertCircle,
  Timer,
  PackageX,
  Navigation
} from "lucide-react";

interface DashboardStats {
  activeOrders: number;
  inPicking: number;
  readyToShip: number;
  deliveredToday: number;
  ordersNotPicked: number;
  courierFailures: number;
  nasFailures: number;
  outOfStock: number;
  ordersToFulfillToday: number;
  pickupsScheduled: number;
  routesCreated: number;
  manifestsGenerated: number;
  nextPickups: any[];
  pendingManifests: any[];
  unassignedRoutes: any[];
}

interface ActivityEvent {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  status: "success" | "warning" | "error";
  orderId?: string;
  userId?: string;
  userName?: string;
  sku?: string;
  toteId?: string;
  location?: string;
}

interface CriticalAlert {
  id: string;
  type: "error" | "warning";
  title: string;
  message: string;
  count: number;
  action: string;
  actionLink: string;
}

export default function DashboardRedesigned() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: activity = [] } = useQuery<ActivityEvent[]>({
    queryKey: ["/api/dashboard/activity"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: alerts = [] } = useQuery<CriticalAlert[]>({
    queryKey: ["/api/dashboard/alerts"],
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const getActivityIcon = (type: string, status: string) => {
    let IconComponent = Activity;
    switch (type) {
      case "order_picked":
        IconComponent = Package;
        break;
      case "order_received":
        IconComponent = ShoppingCart;
        break;
      case "manifest_generated":
        IconComponent = TruckIcon;
        break;
      case "picking_exception":
        IconComponent = AlertTriangle;
        break;
      case "address_verification":
        IconComponent = CheckCircle;
        break;
      case "tote_dispatched":
        IconComponent = Navigation;
        break;
      case "user_scan":
        IconComponent = Users;
        break;
      default:
        IconComponent = Activity;
    }

    let colorClass = "text-blue-500";
    switch (status) {
      case "success":
        colorClass = "text-green-500";
        break;
      case "warning":
        colorClass = "text-yellow-500";
        break;
      case "error":
        colorClass = "text-red-500";
        break;
    }

    return <IconComponent className={`h-4 w-4 ${colorClass}`} />;
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return time.toLocaleDateString();
  };

  const displayActivity = activity;

  return (
    <div className="flex-1 p-6 bg-gray-50 space-y-6">
      {/* Critical Alerts Panel - Moved to top */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            Critical Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">Orders Not Picked</p>
                  <p className="text-sm text-red-600">Past SLA cutoff</p>
                </div>
              </div>
              <Badge variant="destructive" className="text-lg font-bold px-3 py-1">
                {stats?.ordersNotPicked || 0}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <TruckIcon className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800">Courier Failures</p>
                  <p className="text-sm text-yellow-600">API not responsive</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-yellow-200 text-yellow-800 text-lg font-bold px-3 py-1">
                {stats?.courierFailures || 0}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-semibold text-yellow-800">NAS Failures</p>
                  <p className="text-sm text-yellow-600">Address verification</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-yellow-200 text-yellow-800 text-lg font-bold px-3 py-1">
                {stats?.nasFailures || 0}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <PackageX className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">Out of Stock</p>
                  <p className="text-sm text-red-600">SKUs with no inventory</p>
                </div>
              </div>
              <Badge variant="destructive" className="text-lg font-bold px-3 py-1">
                {stats?.outOfStock || 0}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Load Summary - Moved below Critical Alerts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Today's Load Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats?.ordersToFulfillToday || 0}</div>
              <div className="text-sm text-blue-600 font-medium">Orders to Fulfill</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats?.pickupsScheduled || 0}</div>
              <div className="text-sm text-green-600 font-medium">Pickups Scheduled</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats?.routesCreated || 0}</div>
              <div className="text-sm text-purple-600 font-medium">Routes Created</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{stats?.manifestsGenerated || 0}</div>
              <div className="text-sm text-amber-600 font-medium">Manifests Generated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Feed - Only show if there's real-time data */}
      {activity.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activity.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="mt-0.5">
                    {getActivityIcon(event.type, event.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.message}</p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(event.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TruckIcon className="h-4 w-4" />
              Next Pickups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-500">
              <TruckIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm">No scheduled pickups</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              Pending Manifests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-500">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm">No pending manifests</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Route className="h-4 w-4" />
              Unassigned Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-gray-500">
              <Route className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm">No unassigned routes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}