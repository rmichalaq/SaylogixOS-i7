import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Settings, 
  ChevronDown, 
  Plus, 
  Users, 
  FileText, 
  MoreVertical,
  ArrowUpDown,
  Search,
  PlayCircle,
  MapPin,
  User
} from "lucide-react";

interface PickingTask {
  id: number;
  orderId: number;
  orderNumber: string;
  sku: string;
  productName: string;
  quantity: number;
  pickedQuantity: number;
  binLocation: string;
  assignedPicker?: string;
  pickPath: number;
  status: string;
  priority: string;
  exceptionReason?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface PickingBatch {
  id: number;
  batchNumber: string;
  assignedPicker: string;
  status: string;
  taskCount: number;
  completedTasks: number;
  estimatedTime: number;
  createdAt: string;
}

// Types for sorting and filtering
type SortConfig = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

type ColumnFilters = {
  [key: string]: string;
};

export default function Picking() {
  const [activeTab, setActiveTab] = useState("available");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pickerFilter, setPickerFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<PickingTask | null>(null);

  const { data: pickingTasks = [], isLoading } = useQuery({
    queryKey: ["/api/pick-tasks", { status: statusFilter, picker: pickerFilter }],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const { data: pickingBatches = [] } = useQuery({
    queryKey: ["/api/pick-batches"],
    refetchInterval: 5000,
  });

  const { data: pickers = [] } = useQuery({
    queryKey: ["/api/pickers"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
      case "assigned":
        return "bg-primary-100 text-primary-800 border-primary-200";
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-error-100 text-error-800 border-error-200";
      case "high":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "normal":
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
      case "low":
        return "bg-secondary-100 text-secondary-600 border-secondary-200";
      default:
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
    }
  };

  const handleStartPicking = async (taskId: number) => {
    try {
      // TODO: Implement start picking API call
      console.log("Starting picking for task:", taskId);
    } catch (error) {
      console.error("Start picking error:", error);
    }
  };

  const handleCompletePicking = async (taskId: number, pickedQuantity: number) => {
    try {
      // TODO: Implement complete picking API call
      console.log("Completing picking for task:", taskId, "quantity:", pickedQuantity);
    } catch (error) {
      console.error("Complete picking error:", error);
    }
  };

  const handleReportException = async (taskId: number, reason: string) => {
    try {
      // TODO: Implement report exception API call
      console.log("Reporting exception for task:", taskId, "reason:", reason);
    } catch (error) {
      console.error("Report exception error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-secondary-500">Loading picking tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards - Match Inventory exact layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Tasks</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {pickingTasks.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Ready to pick
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <PlayCircle className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {pickingTasks.filter(t => t.status === 'in_progress').length}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Being picked
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
              {pickingTasks.filter(t => t.status === 'completed').length}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium">↗</span>
              Successfully picked
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Exceptions</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pickingTasks.filter(t => t.status === 'exception').length}
            </div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Tabs - Match Inventory exact styling */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('available')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'available' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <Package className="h-4 w-4" />
            <span>Available to Pick ({pickingTasks.filter(t => t.status === 'pending').length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('in-progress')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'in-progress' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <PlayCircle className="h-4 w-4" />
            <span>In Progress ({pickingTasks.filter(t => t.status === 'in_progress').length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'completed' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Completed ({pickingTasks.filter(t => t.status === 'completed').length})</span>
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
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Manual Pick
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Package className="h-4 w-4 mr-2" />
              Auto-generate Wave
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="h-4 w-4 mr-2" />
              Assign to Picker
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="h-4 w-4 mr-2" />
              Export Pick Plan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Area - Match Inventory styling */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'available' && `Available to Pick (${pickingTasks.filter(t => t.status === 'pending').length})`}
              {activeTab === 'in-progress' && `In Progress (${pickingTasks.filter(t => t.status === 'in_progress').length})`}
              {activeTab === 'completed' && `Completed (${pickingTasks.filter(t => t.status === 'completed').length})`}
            </h2>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'available' && <AvailablePicksTable pickingTasks={pickingTasks.filter(t => t.status === 'pending')} />}
          {activeTab === 'in-progress' && <InProgressTable pickingTasks={pickingTasks.filter(t => t.status === 'in_progress')} />}
          {activeTab === 'completed' && <CompletedTable pickingTasks={pickingTasks.filter(t => t.status === 'completed')} />}
        </div>
      </Card>
    </div>
  );
}

// Available Picks Table Component
function AvailablePicksTable({ pickingTasks }: { pickingTasks: PickingTask[] }) {
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

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="orderNumber">Order ID</SortableHeader>
            <SortableHeader field="sku">SKU</SortableHeader>
            <SortableHeader field="binLocation">Bin Location</SortableHeader>
            <SortableHeader field="quantity">Quantity</SortableHeader>
            <SortableHeader field="priority">Priority</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pickingTasks.map((task) => (
            <TableRow key={task.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell className="font-medium">{task.orderNumber}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="font-medium">{task.sku}</div>
                    <div className="text-sm text-gray-500">{task.productName}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  {task.binLocation}
                </div>
              </TableCell>
              <TableCell>{task.quantity}</TableCell>
              <TableCell>
                <Badge className={getPriorityBadge(task.priority)}>
                  {task.priority}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {pickingTasks.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tasks available to pick</p>
        </div>
      )}
    </div>
  );
}

// In Progress Table Component
function InProgressTable({ pickingTasks }: { pickingTasks: PickingTask[] }) {
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

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="orderNumber">Order ID</SortableHeader>
            <SortableHeader field="assignedPicker">Assigned Picker</SortableHeader>
            <SortableHeader field="sku">SKU</SortableHeader>
            <SortableHeader field="binLocation">Bin Location</SortableHeader>
            <SortableHeader field="startedAt">Started At</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pickingTasks.map((task) => (
            <TableRow key={task.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell className="font-medium">{task.orderNumber}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  {task.assignedPicker || 'Unassigned'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="font-medium">{task.sku}</div>
                    <div className="text-sm text-gray-500">{task.productName}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                  {task.binLocation}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  {task.startedAt ? new Date(task.startedAt).toLocaleTimeString() : 'Not started'}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {pickingTasks.length === 0 && (
        <div className="text-center py-12">
          <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No picks in progress</p>
        </div>
      )}
    </div>
  );
}

// Completed Table Component
function CompletedTable({ pickingTasks }: { pickingTasks: PickingTask[] }) {
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

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="orderNumber">Order ID</SortableHeader>
            <SortableHeader field="assignedPicker">Picker</SortableHeader>
            <SortableHeader field="sku">SKU</SortableHeader>
            <SortableHeader field="completedAt">Completed At</SortableHeader>
            <SortableHeader field="pickedQuantity">Picked Qty</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pickingTasks.map((task) => (
            <TableRow key={task.id} className="cursor-pointer hover:bg-gray-50">
              <TableCell className="font-medium">{task.orderNumber}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  {task.assignedPicker || 'Unassigned'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                  <div>
                    <div className="font-medium">{task.sku}</div>
                    <div className="text-sm text-gray-500">{task.productName}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  {task.completedAt ? new Date(task.completedAt).toLocaleTimeString() : 'Not completed'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-400 mr-2" />
                  {task.pickedQuantity} / {task.quantity}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {pickingTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No completed picks today</p>
        </div>
      )}
    </div>
  );
}

// Helper function for priority badge styling
function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'normal':
      return 'bg-blue-100 text-blue-800';
    case 'low':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
