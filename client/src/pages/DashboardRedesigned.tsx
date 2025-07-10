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

  // Mock activity data if none exists
  const mockActivity: ActivityEvent[] = [
    {
      id: "1",
      type: "user_scan",
      message: "User Ali scanned SKU-001 for Order SL25-030",
      timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
      status: "success",
      userId: "ali",
      userName: "Ali",
      sku: "SKU-001",
      orderId: "SL25-030"
    },
    {
      id: "2",
      type: "tote_dispatched",
      message: "Tote T-045 dispatched from Jeddah FC to Riyadh Hub",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      status: "success",
      toteId: "T-045",
      location: "Jeddah FC"
    },
    {
      id: "3",
      type: "manifest_generated",
      message: "Manifest M-001 generated for Aramex pickup",
      timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
      status: "success"
    },
    {
      id: "4",
      type: "order_received",
      message: "New order SL25-031 received from Shopify",
      timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
      status: "success",
      orderId: "SL25-031"
    },
    {
      id: "5",
      type: "address_verification",
      message: "Address verified for order SL25-029",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      status: "success",
      orderId: "SL25-029"
    }
  ];

  const displayActivity = activity.length > 0 ? activity : mockActivity;

  return (
    <div className="flex-1 p-6 bg-gray-50 space-y-6">
      {/* Critical Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <Timer className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Orders Not Picked</p>
                    <p className="text-sm text-red-600">Past SLA cutoff</p>
                  </div>
                </div>
                <Badge variant="destructive">{stats?.ordersNotPicked || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <TruckIcon className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Courier Failures</p>
                    <p className="text-sm text-yellow-600">API not responsive</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-yellow-200">{stats?.courierFailures || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">NAS Failures</p>
                    <p className="text-sm text-yellow-600">Address verification</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-yellow-200">{stats?.nasFailures || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <PackageX className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Out of Stock</p>
                    <p className="text-sm text-red-600">SKUs with no inventory</p>
                  </div>
                </div>
                <Badge variant="destructive">{stats?.outOfStock || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Load Summary */}
        <div className="lg:col-span-2">
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
        </div>
      </div>

      {/* Live Activity Feed */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {displayActivity.map((event) => (
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
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm font-medium">Aramex</span>
                <Badge variant="outline">2:30 PM</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm font-medium">SMSA</span>
                <Badge variant="outline">3:00 PM</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm font-medium">Fastlo</span>
                <Badge variant="outline">4:15 PM</Badge>
              </div>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm font-medium">Manifest M-003</span>
                <Badge variant="outline">12 orders</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                <span className="text-sm font-medium">Manifest M-004</span>
                <Badge variant="outline">8 orders</Badge>
              </div>
              <div className="text-center py-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate All
                </Button>
              </div>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm font-medium">Route R-005</span>
                <Badge variant="destructive">No Driver</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                <span className="text-sm font-medium">Route R-006</span>
                <Badge variant="destructive">No Driver</Badge>
              </div>
              <div className="text-center py-2">
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Assign Drivers
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}