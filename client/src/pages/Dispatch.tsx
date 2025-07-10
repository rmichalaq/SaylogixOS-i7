import { useState } from "react";
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
  Package, 
  CheckCircle2, 
  Truck, 
  Settings, 
  ChevronDown, 
  MoreVertical,
  ArrowUpDown,
  FileText,
  CalendarClock,
  Users,
  Download,
  Plus
} from "lucide-react";

interface Manifest {
  id: number;
  manifestNumber: string;
  courierName: string;
  totalPackages: number;
  scheduledPickup?: string;
  status: string;
  handoverMethod: string;
  createdBy: string;
  createdAt: string;
  handedOverAt?: string;
}

// Types for sorting and filtering
type SortConfig = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

type ColumnFilters = {
  [key: string]: string;
};

export default function Dispatch() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedManifest, setSelectedManifest] = useState<Manifest | null>(null);

  const { data: manifests = [], isLoading } = useQuery({
    queryKey: ["/api/manifests"],
    refetchInterval: 30000
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
      case "ready":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "dispatched":
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
          <p className="text-secondary-500">Loading dispatch manifests...</p>
        </div>
      </div>
    );
  }

  const pendingManifests = manifests.filter((m: Manifest) => m.status === 'pending').length;
  const readyManifests = manifests.filter((m: Manifest) => m.status === 'ready').length;
  const dispatchedToday = manifests.filter((m: Manifest) => 
    m.status === 'dispatched' && 
    new Date(m.handedOverAt || '').toDateString() === new Date().toDateString()
  ).length;
  const totalPackages = manifests.reduce((sum: number, m: Manifest) => sum + m.totalPackages, 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards - Match Inventory exact layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Manifests</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {pendingManifests}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Awaiting pickup
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready for Pickup</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {readyManifests}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Staged packages
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Dispatched Today</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dispatchedToday}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium">↗</span>
              Manifests completed
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Packages</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {totalPackages}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              In all manifests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Tabs - Match Inventory exact styling */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'all' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <FileText className="h-4 w-4" />
            <span>All Manifests ({manifests.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('ready')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'ready' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <Package className="h-4 w-4" />
            <span>Ready for Pickup ({readyManifests})</span>
          </button>
          <button 
            onClick={() => setActiveTab('dispatched')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'dispatched' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Dispatched Today ({dispatchedToday})</span>
          </button>
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
              <Plus className="h-4 w-4 mr-2" />
              Generate New Manifest
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CalendarClock className="h-4 w-4 mr-2" />
              Schedule Courier Pickup
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Package className="h-4 w-4 mr-2" />
              Assign Packages to Manifest
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="h-4 w-4 mr-2" />
              Export Dispatch Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Area - Match Inventory styling */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'all' && `All Manifests (${manifests.length})`}
              {activeTab === 'ready' && `Ready for Pickup (${readyManifests})`}
              {activeTab === 'dispatched' && `Dispatched Today (${dispatchedToday})`}
            </h2>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'all' && <AllManifestsTable manifests={manifests} onSelectManifest={setSelectedManifest} />}
          {activeTab === 'ready' && <ReadyManifestsTable manifests={manifests.filter((m: Manifest) => m.status === 'ready')} onSelectManifest={setSelectedManifest} />}
          {activeTab === 'dispatched' && <DispatchedManifestsTable manifests={manifests.filter((m: Manifest) => m.status === 'dispatched' && new Date(m.handedOverAt || '').toDateString() === new Date().toDateString())} onSelectManifest={setSelectedManifest} />}
        </div>
      </Card>

      {/* Manifest Details Drawer */}
      {selectedManifest && (
        <Sheet open={!!selectedManifest} onOpenChange={() => setSelectedManifest(null)}>
          <SheetContent className="w-[600px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Manifest Details</SheetTitle>
              <SheetDescription>
                Manifest {selectedManifest.manifestNumber} - {selectedManifest.courierName}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <Badge className={getStatusColor(selectedManifest.status)}>
                    {selectedManifest.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Packages</p>
                  <p className="text-lg font-semibold">{selectedManifest.totalPackages}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Handover Method</p>
                  <p className="text-sm">{selectedManifest.handoverMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Created By</p>
                  <p className="text-sm">{selectedManifest.createdBy}</p>
                </div>
              </div>
              {selectedManifest.scheduledPickup && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Scheduled Pickup</p>
                  <p className="text-sm">{new Date(selectedManifest.scheduledPickup).toLocaleString()}</p>
                </div>
              )}
              <div className="pt-4">
                <Button className="w-full">
                  View Package Details
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

// All Manifests Table Component
function AllManifestsTable({ manifests, onSelectManifest }: { manifests: Manifest[], onSelectManifest: (manifest: Manifest) => void }) {
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
      case "ready":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "dispatched":
        return "bg-success-100 text-success-800 border-success-200";
      default:
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
    }
  };

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
            <SortableHeader field="manifestNumber">Manifest ID</SortableHeader>
            <SortableHeader field="courierName">Courier Name</SortableHeader>
            <SortableHeader field="totalPackages"># of Packages</SortableHeader>
            <SortableHeader field="scheduledPickup">ETA / Scheduled Pickup</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="handoverMethod">Handover Method</SortableHeader>
            <SortableHeader field="createdBy">Created By</SortableHeader>
            <SortableHeader field="createdAt">Last Updated</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {manifests.map((manifest: Manifest) => (
            <TableRow 
              key={manifest.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectManifest(manifest)}
            >
              <TableCell>
                <div className="font-medium">{manifest.manifestNumber}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-gray-400 mr-2" />
                  {manifest.courierName}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                  {manifest.totalPackages}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  {manifest.scheduledPickup ? new Date(manifest.scheduledPickup).toLocaleString() : 'Not scheduled'}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusBadge(manifest.status)}>
                  {manifest.status}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">{manifest.handoverMethod}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  {manifest.createdBy}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">
                  {new Date(manifest.createdAt).toLocaleDateString()}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {manifests.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No manifests found</p>
        </div>
      )}
    </div>
  );
}

// Ready Manifests Table Component
function ReadyManifestsTable({ manifests, onSelectManifest }: { manifests: Manifest[], onSelectManifest: (manifest: Manifest) => void }) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Manifest ID</TableHead>
            <TableHead>Courier Name</TableHead>
            <TableHead># of Packages</TableHead>
            <TableHead>Scheduled Pickup</TableHead>
            <TableHead>Created By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {manifests.map((manifest: Manifest) => (
            <TableRow 
              key={manifest.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectManifest(manifest)}
            >
              <TableCell>
                <div className="font-medium">{manifest.manifestNumber}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-gray-400 mr-2" />
                  {manifest.courierName}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-green-400 mr-2" />
                  {manifest.totalPackages}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  {manifest.scheduledPickup ? new Date(manifest.scheduledPickup).toLocaleString() : 'Not scheduled'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  {manifest.createdBy}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {manifests.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No manifests ready for pickup</p>
        </div>
      )}
    </div>
  );
}

// Dispatched Manifests Table Component  
function DispatchedManifestsTable({ manifests, onSelectManifest }: { manifests: Manifest[], onSelectManifest: (manifest: Manifest) => void }) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Manifest ID</TableHead>
            <TableHead>Courier Name</TableHead>
            <TableHead># of Packages</TableHead>
            <TableHead>Handed Over At</TableHead>
            <TableHead>Handover Method</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {manifests.map((manifest: Manifest) => (
            <TableRow 
              key={manifest.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onSelectManifest(manifest)}
            >
              <TableCell>
                <div className="font-medium">{manifest.manifestNumber}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-gray-400 mr-2" />
                  {manifest.courierName}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mr-2" />
                  {manifest.totalPackages}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  {manifest.handedOverAt ? new Date(manifest.handedOverAt).toLocaleString() : 'Not dispatched'}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">{manifest.handoverMethod}</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {manifests.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No manifests dispatched today</p>
        </div>
      )}
    </div>
  );
}