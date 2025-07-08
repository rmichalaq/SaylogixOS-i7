import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Route, Search, MapPin, Truck, Clock, CheckCircle, AlertTriangle, Navigation } from "lucide-react";

export default function LastMilePage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: routes, isLoading } = useQuery({
    queryKey: ["/api/routes"],
    refetchInterval: 30000
  });

  const getRouteStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-amber-100 text-amber-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'exception': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRoutes = routes?.filter((route: any) =>
    route.routeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const plannedRoutes = routes?.filter((r: any) => r.status === 'planned').length || 0;
  const activeRoutes = routes?.filter((r: any) => r.status === 'in_progress').length || 0;
  const completedToday = routes?.filter((r: any) => 
    r.status === 'completed' && 
    new Date(r.completedAt).toDateString() === new Date().toDateString()
  ).length || 0;
  const totalStops = routes?.reduce((sum: number, r: any) => sum + (r.totalStops || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            Route Optimization
          </Button>
          <Button className="saylogix-primary">
            <Route className="h-4 w-4 mr-2" />
            Create Route
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Planned Routes</p>
                <p className="text-3xl font-bold text-blue-600">{plannedRoutes}</p>
                <p className="text-sm text-blue-600">Ready to start</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Routes</p>
                <p className="text-3xl font-bold text-amber-600">{activeRoutes}</p>
                <p className="text-sm text-amber-600">Out for delivery</p>
              </div>
              <Truck className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Today</p>
                <p className="text-3xl font-bold text-green-600">{completedToday}</p>
                <p className="text-sm text-green-600">Routes finished</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stops</p>
                <p className="text-3xl font-bold text-purple-600">{totalStops}</p>
                <p className="text-sm text-purple-600">Across all routes</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by route number, driver, or vehicle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Routes ({filteredRoutes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading routes...</p>
            </div>
          ) : filteredRoutes.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No routes found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRoutes.map((route: any) => (
                <div key={route.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge className={getRouteStatusColor(route.status)}>
                        {route.status}
                      </Badge>
                      <h3 className="text-lg font-medium text-gray-900">
                        {route.routeNumber}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <MapPin className="h-4 w-4 mr-2" />
                        View Map
                      </Button>
                      {route.status === 'planned' && (
                        <Button size="sm" className="saylogix-primary">
                          <Navigation className="h-4 w-4 mr-2" />
                          Start Route
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Driver</p>
                      <p className="text-sm font-bold text-gray-900">
                        {route.driverName || 'Not assigned'}
                      </p>
                      <p className="text-sm text-gray-600">
                        ID: {route.driverId || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Vehicle</p>
                      <p className="text-sm text-gray-900">
                        {route.vehicleNumber || 'Not assigned'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Stops</p>
                      <p className="text-sm text-gray-900">
                        {route.totalStops} deliveries
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Timeline</p>
                      <p className="text-sm text-gray-900">
                        {route.startedAt 
                          ? `Started ${new Date(route.startedAt).toLocaleTimeString()}`
                          : 'Not started'
                        }
                      </p>
                      {route.completedAt && (
                        <p className="text-sm text-green-600">
                          Completed {new Date(route.completedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {route.status === 'in_progress' && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Delivery Progress</span>
                        <span className="text-sm text-gray-600">
                          5 / {route.totalStops} completed
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(5 / route.totalStops) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {route.status === 'completed' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                          <p className="text-sm text-green-800 font-medium">
                            Route completed successfully
                          </p>
                        </div>
                        <div className="text-sm text-green-700">
                          {route.totalStops} deliveries • 98% success rate
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
