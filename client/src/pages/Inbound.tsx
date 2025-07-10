import { useState } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Package, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Edit, 
  ClipboardCheck, 
  CalendarX,
  Plus,
  Check,
  X,
  Download,
  RefreshCw,
  MapPin,
  BarChart3,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Timer,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  MoreVertical,
  ArrowUpDown,
  Upload,
  FileSpreadsheet,
  Settings,
  Truck,
  FileText,
  Building,
  ClipboardList
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

// Types for sorting and filtering
type SortConfig = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

type ColumnFilters = {
  [key: string]: string;
};

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplier: string;
  eta: string;
  status: 'pending' | 'asn_received' | 'gate_entry' | 'unloaded';
  asnReceived: boolean;
  gateEntry: boolean;
  unloaded: boolean;
  dockAssignment?: string;
  items: POItem[];
}

interface POItem {
  id: number;
  sku: string;
  description: string;
  expectedQuantity: number;
  receivedQuantity?: number;
}

interface GRN {
  id: number;
  grnNumber: string;
  poNumber: string;
  supplier: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
  items: GRNItem[];
}

interface GRNItem {
  id: number;
  sku: string;
  description: string;
  expectedQuantity: number;
  receivedQuantity: number;
  discrepancy?: string;
}

interface PutawayTask {
  id: number;
  grnNumber: string;
  status: 'staged' | 'in_process' | 'completed';
  assignedTo?: string;
  items: PutawayItem[];
  createdAt: string;
}

interface PutawayItem {
  id: number;
  sku: string;
  description: string;
  quantity: number;
  binLocation?: string;
  scanStatus: 'pending' | 'scanned' | 'placed';
}

// Inbound Actions Menu Component
function InboundActionsMenu() {
  const [createASNOpen, setCreateASNOpen] = useState(false);

  const handleDownloadReport = () => {
    // TODO: Implement report download functionality
    console.log("Download inbound report as Excel");
  };

  const handleUploadASN = () => {
    // TODO: Implement ASN upload functionality
    console.log("Upload ASN CSV");
  };

  const handleViewDockSchedule = () => {
    // TODO: Implement dock schedule view
    console.log("View dock schedule");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Actions</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setCreateASNOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create New ASN
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleUploadASN}>
            <Upload className="mr-2 h-4 w-4" />
            Upload ASN CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewDockSchedule}>
            <CalendarX className="mr-2 h-4 w-4" />
            View Dock Schedule
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadReport}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create ASN Drawer */}
      <CreateASNDrawer 
        open={createASNOpen}
        onOpenChange={setCreateASNOpen}
      />
    </>
  );
}

// Create ASN Drawer Component
function CreateASNDrawer({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    asnNumber: "",
    supplier: "",
    poNumber: "",
    eta: "",
    items: [] as any[],
    notes: ""
  });

  const queryClient = useQueryClient();

  const createASNMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/inbound/asn", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inbound/purchase-orders"] });
      onOpenChange(false);
      // Reset form
      setFormData({
        asnNumber: "",
        supplier: "",
        poNumber: "",
        eta: "",
        items: [],
        notes: ""
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createASNMutation.mutate(formData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create New ASN</SheetTitle>
          <SheetDescription>
            Create a new Advance Shipment Notice for incoming goods
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asnNumber">ASN Number</Label>
              <Input
                id="asnNumber"
                required
                value={formData.asnNumber}
                onChange={(e) => setFormData({ ...formData, asnNumber: e.target.value })}
                placeholder="ASN-2025-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poNumber">PO Number</Label>
              <Input
                id="poNumber"
                required
                value={formData.poNumber}
                onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })}
                placeholder="PO-2025-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eta">Expected Arrival</Label>
              <Input
                id="eta"
                type="datetime-local"
                required
                value={formData.eta}
                onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this ASN..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="saylogix-primary"
              disabled={createASNMutation.isPending}
            >
              {createASNMutation.isPending ? "Creating..." : "Create ASN"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// Sortable Column Header Component
function SortableColumnHeader({ 
  column, 
  label, 
  className = "",
  sortConfig,
  columnFilters,
  onSort,
  onFilter,
  onClearFilter
}: { 
  column: string; 
  label: string; 
  className?: string;
  sortConfig: SortConfig;
  columnFilters: ColumnFilters;
  onSort: (column: string) => void;
  onFilter: (column: string, value: string) => void;
  onClearFilter: (column: string) => void;
}) {
  const getSortIcon = () => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const hasActiveFilter = columnFilters[column] && columnFilters[column].length > 0;

  return (
    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      <div className="flex items-center justify-between group">
        <button
          onClick={() => onSort(column)}
          className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
        >
          <span>{label}</span>
          {getSortIcon()}
        </button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                hasActiveFilter ? 'opacity-100 text-blue-600' : ''
              }`}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-3">
              <div>
                <Label htmlFor={`filter-${column}`} className="text-sm font-medium">
                  Filter {label}
                </Label>
                <Input
                  id={`filter-${column}`}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={columnFilters[column] || ''}
                  onChange={(e) => onFilter(column, e.target.value)}
                  className="mt-1"
                />
              </div>
              {hasActiveFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClearFilter(column)}
                  className="w-full"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </th>
  );
}

export default function Inbound() {
  const [activeTab, setActiveTab] = useState('purchase-orders');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isPODrawerOpen, setIsPODrawerOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);
  const [selectedPutaway, setSelectedPutaway] = useState<PutawayTask | null>(null);
  const [asnNumbers, setAsnNumbers] = useState<string[]>(['']);
  const [dockAssignment, setDockAssignment] = useState('');
  const [unloadingComments, setUnloadingComments] = useState('');
  const [grnFilter, setGrnFilter] = useState('pending');
  const [putawayFilter, setPutawayFilter] = useState('staged');
  
  const queryClient = useQueryClient();

  // Fetch Purchase Orders
  const { data: purchaseOrders, isLoading: poLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['/api/inbound/purchase-orders'],
    refetchInterval: 5000,
  });

  // Fetch GRNs
  const { data: grns, isLoading: grnLoading } = useQuery<GRN[]>({
    queryKey: ['/api/inbound/grns'],
    refetchInterval: 5000,
  });

  // Fetch Putaway Tasks
  const { data: putawayTasks, isLoading: putawayLoading } = useQuery<PutawayTask[]>({
    queryKey: ['/api/inbound/putaway'],
    refetchInterval: 5000,
  });

  // Mutations
  const updatePOMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<PurchaseOrder> }) =>
      apiRequest(`/api/inbound/purchase-orders/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/grns'] });
    },
  });

  const updateGRNMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<GRN> }) =>
      apiRequest(`/api/inbound/grns/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/grns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/putaway'] });
    },
  });

  const updatePutawayMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<PutawayTask> }) =>
      apiRequest(`/api/inbound/putaway/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/putaway'] });
    },
  });

  // Handle PO Actions
  const handleASNSave = () => {
    if (!selectedPO) return;
    const validASNs = asnNumbers.filter(asn => asn.trim());
    updatePOMutation.mutate({
      id: selectedPO.id,
      updates: { asnReceived: true, asnNumbers: validASNs }
    });
  };

  const handleGateEntry = (checked: boolean) => {
    if (!selectedPO) return;
    updatePOMutation.mutate({
      id: selectedPO.id,
      updates: { gateEntry: checked }
    });
  };

  const handleDockAssignment = () => {
    if (!selectedPO) return;
    updatePOMutation.mutate({
      id: selectedPO.id,
      updates: { dockAssignment }
    });
  };

  const handleUnloadingConfirmation = (checked: boolean) => {
    if (!selectedPO) return;
    updatePOMutation.mutate({
      id: selectedPO.id,
      updates: { 
        unloaded: checked,
        unloadingComments: checked ? unloadingComments : undefined
      }
    });
  };

  const addASNField = () => {
    setAsnNumbers([...asnNumbers, '']);
  };

  const updateASNField = (index: number, value: string) => {
    const newASNs = [...asnNumbers];
    newASNs[index] = value;
    setAsnNumbers(newASNs);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards - Match Inventory exact layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Purchase Orders</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{purchaseOrders?.length || 0}</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium">↗</span>
              Active POs
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Receipts</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{grns?.length || 0}</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Awaiting processing
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Putaway Tasks</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{putawayTasks?.length || 0}</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium">↗</span>
              Ready to locate
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Receipts</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{grns?.filter(grn => {
              const today = new Date().toDateString();
              const grnDate = new Date(grn.createdAt).toDateString();
              return today === grnDate;
            }).length || 0}</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Items received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Tabs - Match Inventory exact styling */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('purchase-orders')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'purchase-orders' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <Package className="h-4 w-4" />
            <span>Purchase Orders ({purchaseOrders?.length || 0})</span>
          </button>
          <button 
            onClick={() => setActiveTab('grns')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'grns' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <Truck className="h-4 w-4" />
            <span>GRNs ({grns?.length || 0})</span>
          </button>
          <button 
            onClick={() => setActiveTab('putaway')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'putaway' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <MapPin className="h-4 w-4" />
            <span>Putaway Tasks ({putawayTasks?.length || 0})</span>
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
              Create Purchase Order
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Upload className="h-4 w-4 mr-2" />
              Upload ASN
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export Data
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Area - Match Inventory styling */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'purchase-orders' && `Purchase Orders (${purchaseOrders?.length || 0})`}
              {activeTab === 'grns' && `GRNs (${grns?.length || 0})`}
              {activeTab === 'putaway' && `Putaway Tasks (${putawayTasks?.length || 0})`}
            </h2>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'purchase-orders' && <PurchaseOrdersTable />}
          {activeTab === 'grns' && <GRNsTable />}
          {activeTab === 'putaway' && <PutawayTasksTable />}
        </div>
      </Card>
    </div>
  );
}

// Purchase Orders Table Component
function PurchaseOrdersTable() {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: null });
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: purchaseOrders, isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['/api/inbound/purchase-orders'],
    refetchInterval: 5000,
  });

  // Helper function to get column values for sorting and filtering
  const getColumnValue = (po: PurchaseOrder, column: string) => {
    switch (column) {
      case 'poNumber':
        return po.poNumber;
      case 'supplier':
        return po.supplier;
      case 'eta':
        return new Date(po.eta).getTime();
      case 'status':
        return po.status;
      case 'itemCount':
        return po.items?.length || 0;
      default:
        return '';
    }
  };

  const handleSort = (column: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === column && sortConfig.direction === 'desc') {
      direction = null;
    }
    
    setSortConfig({ key: column, direction });
  };

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleClearFilter = (column: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  };

  const handleRowClick = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsDrawerOpen(true);
  };

  // Filter and sort data
  let filteredPOs = purchaseOrders || [];
  
  // Apply search filter
  if (searchTerm) {
    filteredPOs = filteredPOs.filter(po => 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Apply column filters
  Object.entries(columnFilters).forEach(([column, filterValue]) => {
    if (filterValue) {
      filteredPOs = filteredPOs.filter(po => {
        const value = getColumnValue(po, column);
        return String(value).toLowerCase().includes(filterValue.toLowerCase());
      });
    }
  });

  // Apply sorting
  if (sortConfig.key && sortConfig.direction) {
    filteredPOs.sort((a, b) => {
      const aValue = getColumnValue(a, sortConfig.key);
      const bValue = getColumnValue(b, sortConfig.key);
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      'asn_received': { label: 'ASN Received', className: 'bg-blue-100 text-blue-800' },
      'gate_entry': { label: 'Gate Entry', className: 'bg-purple-100 text-purple-800' },
      'unloaded': { label: 'Unloaded', className: 'bg-green-100 text-green-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
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
              <Label htmlFor={`filter-${field}`} className="text-sm font-medium">
                Filter {children}
              </Label>
              <Input
                id={`filter-${field}`}
                placeholder={`Search ${children}...`}
                value={columnFilters[field] || ''}
                onChange={(e) => handleColumnFilter(field, e.target.value)}
                className="h-8"
              />
              {columnFilters[field] && (
                <Button
                  onClick={() => handleClearFilter(field)}
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                >
                  Clear filter
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TableHead>
  );

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-2">Loading purchase orders...</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="poNumber">PO Number</SortableHeader>
            <SortableHeader field="supplier">Supplier</SortableHeader>
            <SortableHeader field="eta">ETA</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="itemCount">Items</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPOs.map((po) => (
            <TableRow 
              key={po.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleRowClick(po)}
            >
              <TableCell className="font-medium">{po.poNumber}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Building className="h-4 w-4 text-gray-400 mr-2" />
                  {po.supplier}
                </div>
              </TableCell>
              <TableCell>{format(new Date(po.eta), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{getStatusBadge(po.status)}</TableCell>
              <TableCell>{po.items?.length || 0} items</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {filteredPOs.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No purchase orders found</p>
        </div>
      )}

      {/* Purchase Order Details Drawer */}
      <PODetailsDrawer
        po={selectedPO}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </div>
  );
}

// Purchase Order Details Drawer Component
function PODetailsDrawer({ 
  po, 
  open, 
  onOpenChange 
}: {
  po: PurchaseOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [asnNumbers, setAsnNumbers] = useState<string[]>(['']);
  const [dockAssignment, setDockAssignment] = useState('');
  const [unloadingComments, setUnloadingComments] = useState('');

  const queryClient = useQueryClient();

  // Update form when PO changes
  React.useEffect(() => {
    if (po) {
      setDockAssignment(po.dockAssignment || '');
      // Reset form state when new PO is selected
      setAsnNumbers(['']);
      setUnloadingComments('');
    }
  }, [po]);

  const updatePOMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<PurchaseOrder> }) =>
      apiRequest(`/api/inbound/purchase-orders/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/grns'] });
    },
  });

  const handleASNSave = () => {
    if (!po) return;
    const validASNs = asnNumbers.filter(asn => asn.trim());
    updatePOMutation.mutate({
      id: po.id,
      updates: { asnReceived: true, asnNumbers: validASNs }
    });
  };

  const handleGateEntry = (checked: boolean) => {
    if (!po) return;
    updatePOMutation.mutate({
      id: po.id,
      updates: { gateEntry: checked }
    });
  };

  const handleDockAssignment = () => {
    if (!po) return;
    updatePOMutation.mutate({
      id: po.id,
      updates: { dockAssignment }
    });
  };

  const handleUnloadingConfirmation = (checked: boolean) => {
    if (!po) return;
    updatePOMutation.mutate({
      id: po.id,
      updates: { 
        unloaded: checked,
        unloadingComments: checked ? unloadingComments : undefined
      }
    });
  };

  const addASNField = () => {
    setAsnNumbers([...asnNumbers, '']);
  };

  const updateASNField = (index: number, value: string) => {
    const newASNs = [...asnNumbers];
    newASNs[index] = value;
    setAsnNumbers(newASNs);
  };

  const moveToGRN = () => {
    if (!po) return;
    updatePOMutation.mutate({
      id: po.id,
      updates: { status: 'moved_to_grn' }
    });
  };

  if (!po) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Purchase Order Details</SheetTitle>
          <SheetDescription>
            Manage receiving workflow for {po.poNumber}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* PO Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>PO Number</Label>
              <Input value={po.poNumber} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Input value={po.supplier} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Expected Arrival</Label>
              <Input value={format(new Date(po.eta), 'MMM dd, yyyy HH:mm')} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Input value={po.status} disabled className="bg-gray-50" />
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Receiving Workflow</h3>
            
            {/* ASN Received */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  ASN Received
                  {po.asnReceived && <CheckCircle2 className="h-4 w-4 ml-auto text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!po.asnReceived ? (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>ASN Numbers</Label>
                      {asnNumbers.map((asn, index) => (
                        <Input
                          key={index}
                          value={asn}
                          onChange={(e) => updateASNField(index, e.target.value)}
                          placeholder={`ASN ${index + 1}`}
                        />
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addASNField}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another ASN
                      </Button>
                    </div>
                    <Button onClick={handleASNSave} className="w-full">
                      Save ASN Information
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-green-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    ASN information received
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gate Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Gate Entry
                  {po.gateEntry && <CheckCircle2 className="h-4 w-4 ml-auto text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={po.gateEntry}
                    onChange={(e) => handleGateEntry(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label>Mark as entered through gate</Label>
                </div>
              </CardContent>
            </Card>

            {/* Dock Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Dock Assignment
                  {po.dockAssignment && <CheckCircle2 className="h-4 w-4 ml-auto text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Dock Number</Label>
                    <Select value={dockAssignment} onValueChange={setDockAssignment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dock" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dock-1">Dock 1</SelectItem>
                        <SelectItem value="dock-2">Dock 2</SelectItem>
                        <SelectItem value="dock-3">Dock 3</SelectItem>
                        <SelectItem value="dock-4">Dock 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleDockAssignment} className="w-full">
                    Assign Dock
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Unloading */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Unloading
                  {po.unloaded && <CheckCircle2 className="h-4 w-4 ml-auto text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={po.unloaded}
                      onChange={(e) => handleUnloadingConfirmation(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label>Mark as unloaded</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Unloading Comments</Label>
                    <Textarea
                      value={unloadingComments}
                      onChange={(e) => setUnloadingComments(e.target.value)}
                      placeholder="Enter any comments about the unloading process..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Move to GRN */}
          {po.unloaded && (
            <div className="pt-4 border-t">
              <Button onClick={moveToGRN} className="w-full saylogix-primary">
                <ClipboardList className="h-4 w-4 mr-2" />
                Move to GRN
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// GRNs Table Component (Simplified)
function GRNsTable() {
  const { data: grns, isLoading } = useQuery<GRN[]>({
    queryKey: ['/api/inbound/grns'],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-2">Loading GRNs...</p>
      </div>
    );
  }

  if (!grns || grns.length === 0) {
    return (
      <div className="text-center py-12">
        <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No GRNs found</p>
        <p className="text-sm text-gray-400 mt-1">GRNs will appear here when purchase orders are moved from receiving</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              GRN Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              PO Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Supplier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {grns.map((grn) => (
            <tr key={grn.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {grn.grnNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {grn.poNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {grn.supplier}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className="bg-blue-100 text-blue-800">{grn.status}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(grn.createdAt), 'MMM dd, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Putaway Tasks Table Component (Simplified)
function PutawayTasksTable() {
  const { data: putawayTasks, isLoading } = useQuery<PutawayTask[]>({
    queryKey: ['/api/inbound/putaway'],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-2">Loading putaway tasks...</p>
      </div>
    );
  }

  if (!putawayTasks || putawayTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No putaway tasks found</p>
        <p className="text-sm text-gray-400 mt-1">Putaway tasks will appear here when GRNs are processed</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Task ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              GRN Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {putawayTasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                PUT-{task.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {task.grnNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className="bg-yellow-100 text-yellow-800">{task.status}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {task.assignedTo || 'Unassigned'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(task.createdAt), 'MMM dd, yyyy')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
