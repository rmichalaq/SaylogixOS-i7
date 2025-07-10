import { useState, useRef, useEffect } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Clock, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Settings, 
  ChevronDown, 
  MoreVertical,
  ArrowUpDown,
  Route,
  Navigation,
  Users,
  Package,
  AlertTriangle,
  Target,
  Calendar,
  Search,
  Map,
  List
} from "lucide-react";

interface DeliveryRoute {
  id: number;
  routeNumber: string;
  driverName: string;
  vehicleNumber: string;
  totalStops: number;
  completedStops: number;
  status: string;
  zone: string;
  lastScan?: string;
  completedAt?: string;
  createdAt: string;
  estimatedDuration: number;
  actualDuration?: number;
}

interface PickupLocation {
  id: number;
  fcName: string;
  packagesReady: number;
  courierAssigned: string;
  pickupWindow: string;
  status: string;
  address: string;
}

// Types for sorting and filtering
type SortConfig = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

type ColumnFilters = {
  [key: string]: string;
};

export default function LastMile() {
  const [activeTab, setActiveTab] = useState("pickup");
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'map'>('table');

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ["/api/routes"],
    refetchInterval: 30000
  });

  const { data: pickupLocations = [] } = useQuery({
    queryKey: ["/api/pickup-locations"],
    refetchInterval: 30000
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "planned":
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
      case "in_progress":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "completed":
        return "bg-success-100 text-success-800 border-success-200";
      case "exception":
        return "bg-error-100 text-error-800 border-error-200";
      default:
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-500">Loading delivery routes...</p>
        </div>
      </div>
    );
  }

  const plannedRoutes = routes.filter((r: DeliveryRoute) => r.status === 'planned').length;
  const activeRoutes = routes.filter((r: DeliveryRoute) => r.status === 'in_progress').length;
  const completedToday = routes.filter((r: DeliveryRoute) => 
    r.status === 'completed' && 
    new Date(r.completedAt || '').toDateString() === new Date().toDateString()
  ).length;
  const totalStops = routes.reduce((sum: number, r: DeliveryRoute) => sum + r.totalStops, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards - Match Inventory exact layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Planned Routes</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {plannedRoutes}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Ready to start
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Routes</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {activeRoutes}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Out for delivery
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Today</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedToday}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium">↗</span>
              Routes finished
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Stops</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalStops}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Across all routes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Tabs - Match Inventory exact styling */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('pickup')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'pickup' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <Package className="h-4 w-4" />
            <span>Pickup Overview ({pickupLocations.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'active' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <Truck className="h-4 w-4" />
            <span>Active Routes ({activeRoutes})</span>
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'completed' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Completed ({completedToday})</span>
          </button>
          <button 
            onClick={() => setActiveTab('exceptions')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'exceptions' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Exceptions ({routes.filter((r: DeliveryRoute) => r.status === 'exception').length})</span>
          </button>
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('table')}
              className={`flex items-center space-x-1 px-2 py-1 text-sm font-medium ${viewMode === 'table' ? 'text-blue-600 bg-white rounded shadow-sm' : 'text-gray-500'}`}
            >
              <List className="h-4 w-4" />
              <span>Table</span>
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex items-center space-x-1 px-2 py-1 text-sm font-medium ${viewMode === 'map' ? 'text-blue-600 bg-white rounded shadow-sm' : 'text-gray-500'}`}
            >
              <Map className="h-4 w-4" />
              <span>Map</span>
            </button>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Actions</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <Route className="h-4 w-4 mr-2" />
              Create Route
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="h-4 w-4 mr-2" />
              Assign Driver
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reassign Failed Stops
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Target className="h-4 w-4 mr-2" />
              Route Optimization
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="h-4 w-4 mr-2" />
              Export Route Plan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Area - Match Inventory styling */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'pickup' && `Pickup Overview (${pickupLocations.length})`}
              {activeTab === 'active' && `Active Routes (${activeRoutes})`}
              {activeTab === 'completed' && `Completed Routes (${completedToday})`}
              {activeTab === 'exceptions' && `Exceptions (${routes.filter((r: DeliveryRoute) => r.status === 'exception').length})`}
            </h2>
          </div>

          {/* Content based on active tab and view mode */}
          {viewMode === 'table' ? (
            <>
              {activeTab === 'pickup' && <PickupOverviewTable pickupLocations={pickupLocations} />}
              {activeTab === 'active' && <ActiveRoutesTable routes={routes.filter((r: DeliveryRoute) => r.status === 'in_progress')} onSelectRoute={setSelectedRoute} />}
              {activeTab === 'completed' && <CompletedRoutesTable routes={routes.filter((r: DeliveryRoute) => r.status === 'completed' && new Date(r.completedAt || '').toDateString() === new Date().toDateString())} onSelectRoute={setSelectedRoute} />}
              {activeTab === 'exceptions' && <ExceptionsTable routes={routes.filter((r: DeliveryRoute) => r.status === 'exception')} onSelectRoute={setSelectedRoute} />}
            </>
          ) : (
            <MapView 
              activeTab={activeTab}
              pickupLocations={pickupLocations}
              routes={routes}
              onSelectRoute={setSelectedRoute}
            />
          )}
        </div>
      </Card>

      {/* Route Details Drawer */}
      {selectedRoute && (
        <Sheet open={!!selectedRoute} onOpenChange={() => setSelectedRoute(null)}>
          <SheetContent className="w-[600px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Route Details</SheetTitle>
              <SheetDescription>
                Route {selectedRoute.routeNumber} - {selectedRoute.driverName}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusColor(selectedRoute.status)}>
                    {selectedRoute.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Progress</p>
                  <p className="text-lg font-semibold">{selectedRoute.completedStops} / {selectedRoute.totalStops}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Vehicle</p>
                  <p className="text-sm">{selectedRoute.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Zone</p>
                  <p className="text-sm">{selectedRoute.zone}</p>
                </div>
              </div>
              {selectedRoute.lastScan && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Last Scan</p>
                  <p className="text-sm">{new Date(selectedRoute.lastScan).toLocaleString()}</p>
                </div>
              )}
              <div className="pt-4 space-y-2">
                <Button className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
                <Button variant="outline" className="w-full">
                  <Package className="h-4 w-4 mr-2" />
                  View Packages
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

// Map View Component
function MapView({ activeTab, pickupLocations, routes, onSelectRoute }: { 
  activeTab: string; 
  pickupLocations: PickupLocation[]; 
  routes: DeliveryRoute[];
  onSelectRoute: (route: DeliveryRoute) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const { isLoaded, apiKey } = useGoogleMaps();

  useEffect(() => {
    if (!mapRef.current || !isLoaded || !window.google) return;

    // Initialize map
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 24.7136, lng: 46.6753 }, // Riyadh center
      zoom: 11,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    googleMapRef.current = map;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    // Add pickup location markers
    pickupLocations.forEach((location) => {
      const position = getLocationCoordinates(location.fcName);
      
      const marker = new google.maps.Marker({
        position,
        map,
        title: location.fcName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: location.fcName.includes('Hub') ? '#f59e0b' : '#3b82f6',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${location.fcName}</h3>
            <p class="text-sm">Packages Ready: ${location.packagesReady}</p>
            <p class="text-sm">Courier: ${location.courierAssigned}</p>
            <p class="text-sm">Status: ${location.status}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Add route markers based on active tab
    const filteredRoutes = activeTab === 'active' 
      ? routes.filter(r => r.status === 'in_progress')
      : activeTab === 'completed'
      ? routes.filter(r => r.status === 'completed')
      : activeTab === 'exceptions'
      ? routes.filter(r => r.status === 'exception')
      : routes;

    filteredRoutes.forEach((route) => {
      const position = getRoutePosition(route.zone);
      
      const marker = new google.maps.Marker({
        position,
        map,
        title: `Route ${route.routeNumber}`,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: route.status === 'in_progress' ? '#10b981' : 
                     route.status === 'completed' ? '#6b7280' : 
                     route.status === 'exception' ? '#ef4444' : '#3b82f6',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 45
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">Route ${route.routeNumber}</h3>
            <p class="text-sm">Driver: ${route.driverName}</p>
            <p class="text-sm">Vehicle: ${route.vehicleNumber}</p>
            <p class="text-sm">Progress: ${route.completedStops}/${route.totalStops} stops</p>
            <p class="text-sm">Zone: ${route.zone}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onSelectRoute(route);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      map.fitBounds(bounds);
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
    };
  }, [activeTab, pickupLocations, routes, onSelectRoute]);

  // Helper function to get coordinates for pickup locations
  const getLocationCoordinates = (fcName: string): google.maps.LatLngLiteral => {
    const locations: Record<string, google.maps.LatLngLiteral> = {
      'MOCK_FC_Riyadh_Central': { lat: 24.7136, lng: 46.6753 },
      'MOCK_FC_Riyadh_East': { lat: 24.7500, lng: 46.7700 },
      'MOCK_Sortation_Hub_Main': { lat: 24.6800, lng: 46.7200 }
    };
    return locations[fcName] || { lat: 24.7136, lng: 46.6753 };
  };

  // Helper function to get route positions based on zone
  const getRoutePosition = (zone: string): google.maps.LatLngLiteral => {
    const zones: Record<string, google.maps.LatLngLiteral> = {
      'Riyadh Central': { lat: 24.7136, lng: 46.6753 },
      'Riyadh East': { lat: 24.7500, lng: 46.7700 },
      'Riyadh North': { lat: 24.7800, lng: 46.6900 },
      'Riyadh West': { lat: 24.7000, lng: 46.6200 },
      'Riyadh South': { lat: 24.6500, lng: 46.7100 }
    };
    return zones[zone] || { lat: 24.7136, lng: 46.6753 };
  };

  if (!isLoaded) {
    return (
      <div className="relative bg-gray-100 rounded-lg h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Google Maps Not Configured</h3>
          <p className="text-gray-600 mb-4">
            To enable the map view, please configure Google Maps:
          </p>
          <ol className="text-sm text-gray-500 space-y-2 text-left max-w-md mx-auto">
            <li>1. Go to Settings → Integrations</li>
            <li>2. Find Google Maps in the marketplace</li>
            <li>3. Click Configure and add your API key</li>
            <li>4. Return here to see the map view</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden h-[600px]">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <h4 className="font-medium text-sm mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Fulfillment Centers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            <span>Sortation Hubs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Active Routes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Exception Routes</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pickup Overview Table Component
function PickupOverviewTable({ pickupLocations }: { pickupLocations: PickupLocation[] }) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: null });
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});

  const handleSort = (column: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === column && sortConfig.direction === 'desc') {
      direction = null;
    }
    
    setSortConfig({ key: column, direction });
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer group">
      <div className="flex items-center space-x-2">
        <span onClick={() => handleSort(field)} className="select-none">
          {children}
        </span>
        <div className="flex flex-col items-center">
          <button
            onClick={() => handleSort(field)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowUpDown className="h-3 w-3" />
          </button>
          {sortConfig.key === field && (
            <span className="text-xs text-blue-600 font-medium">
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Filter {children}</p>
              <input
                type="text"
                placeholder={`Filter by ${children}...`}
                className="w-full px-2 py-1 text-sm border rounded"
                onChange={(e) => {
                  if (e.target.value) {
                    setColumnFilters(prev => ({ ...prev, [field]: e.target.value }));
                  } else {
                    setColumnFilters(prev => {
                      const newFilters = { ...prev };
                      delete newFilters[field];
                      return newFilters;
                    });
                  }
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* Active Filters */}
      {Object.keys(columnFilters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(columnFilters).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="flex items-center gap-1">
              {key}: {value}
              <button
                onClick={() => {
                  setColumnFilters(prev => {
                    const newFilters = { ...prev };
                    delete newFilters[key];
                    return newFilters;
                  });
                }}
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="fcName">FC Name</SortableHeader>
            <SortableHeader field="packagesReady">Packages Ready</SortableHeader>
            <SortableHeader field="courierAssigned">Courier Assigned</SortableHeader>
            <SortableHeader field="pickupWindow">Pickup Window</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pickupLocations.map((location: PickupLocation) => (
            <TableRow key={location.id}>
              <TableCell>
                <div className="font-medium">{location.fcName}</div>
                <div className="text-sm text-gray-500">{location.address}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                  {location.packagesReady}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-gray-400 mr-2" />
                  {location.courierAssigned}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  {location.pickupWindow}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={location.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                  {location.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {pickupLocations.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No pickup locations found</p>
        </div>
      )}
    </div>
  );
}

// Active Routes Table Component
function ActiveRoutesTable({ routes, onSelectRoute }: { routes: DeliveryRoute[], onSelectRoute: (route: DeliveryRoute) => void }) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Route ID</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Packages</TableHead>
            <TableHead>Last Scan</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead>Progress</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route: DeliveryRoute) => (
            <TableRow 
              key={route.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectRoute(route)}
            >
              <TableCell>
                <div className="font-medium">{route.routeNumber}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  {route.driverName}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-gray-400 mr-2" />
                  {route.vehicleNumber}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                  {route.totalStops}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  {route.lastScan ? new Date(route.lastScan).toLocaleTimeString() : 'No scan'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  {route.zone}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mr-2" />
                  {route.completedStops} / {route.totalStops}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {routes.length === 0 && (
        <div className="text-center py-12">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No active routes found</p>
        </div>
      )}
    </div>
  );
}

// Completed Routes Table Component
function CompletedRoutesTable({ routes, onSelectRoute }: { routes: DeliveryRoute[], onSelectRoute: (route: DeliveryRoute) => void }) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Route ID</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Delivery Count</TableHead>
            <TableHead>Completion Time</TableHead>
            <TableHead>Success Rate</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route: DeliveryRoute) => (
            <TableRow 
              key={route.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectRoute(route)}
            >
              <TableCell>
                <div className="font-medium">{route.routeNumber}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  {route.driverName}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mr-2" />
                  {route.completedStops}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  {route.completedAt ? new Date(route.completedAt).toLocaleString() : 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Target className="h-4 w-4 text-green-400 mr-2" />
                  {Math.round((route.completedStops / route.totalStops) * 100)}%
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {route.actualDuration ? `${route.actualDuration}h` : 'N/A'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {routes.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No completed routes today</p>
        </div>
      )}
    </div>
  );
}

// Exceptions Table Component
function ExceptionsTable({ routes, onSelectRoute }: { routes: DeliveryRoute[], onSelectRoute: (route: DeliveryRoute) => void }) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Route ID</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Failed Stops</TableHead>
            <TableHead>Last Update</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {routes.map((route: DeliveryRoute) => (
            <TableRow 
              key={route.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectRoute(route)}
            >
              <TableCell>
                <div className="font-medium">{route.routeNumber}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  {route.driverName}
                </div>
              </TableCell>
              <TableCell>
                <Badge className="bg-red-100 text-red-800">
                  Exception
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                  {route.totalStops - route.completedStops}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  {route.lastScan ? new Date(route.lastScan).toLocaleString() : 'No update'}
                </div>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline">
                  Reassign
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {routes.length === 0 && (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No exceptions found</p>
        </div>
      )}
    </div>
  );
}