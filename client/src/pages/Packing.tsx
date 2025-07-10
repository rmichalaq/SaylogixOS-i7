import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Package, 
  Printer, 
  QrCode, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Box, 
  Search,
  MoreHorizontal,
  ArrowUpDown,
  MoreVertical,
  ChevronDown,
  RefreshCw,
  Scan,
  Weight,
  PackageCheck,
  Truck,
  MapPin,
  Plus,
  Settings,
  User,
  Calendar,
  Hash,
  DollarSign,
  FileText,
  ClipboardList,
  Users,
  Archive
} from "lucide-react";

interface Order {
  id: number;
  saylogixNumber: string;
  sourceOrderNumber: string;
  customerName: string;
  priority: string;
  orderValue: string;
  currency: string;
  status: string;
  itemCount: number;
  createdAt: string;
}

interface PackTask {
  id: number;
  orderId: number;
  toteId?: string;
  status: string;
  awbNumber?: string;
  weight?: number;
  packagingType?: string;
  completedAt?: string;
  completedBy?: number;
  createdAt: string;
  order?: Order;
}

interface OrderItem {
  id: number;
  orderId: number;
  productName: string;
  sku: string;
  barcode?: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  scannedQuantity?: number;
}

export default function Packing() {
  const [activeTab, setActiveTab] = useState("queue");
  const [selectedTask, setSelectedTask] = useState<PackTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [scanInput, setScanInput] = useState("");
  const [scannedItems, setScannedItems] = useState<Record<string, number>>({});
  const [packagingType, setPackagingType] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const scanInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch packing queue (picked orders)
  const { data: packingQueue = [], isLoading: queueLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders", { status: "picked" }],
    queryFn: async () => {
      const response = await fetch("/api/orders?status=picked");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch in-progress pack tasks
  const { data: inProgressTasks = [], isLoading: inProgressLoading } = useQuery<PackTask[]>({
    queryKey: ["/api/pack-tasks", { status: "in_progress" }],
    queryFn: async () => {
      const response = await fetch("/api/pack-tasks?status=in_progress");
      if (!response.ok) throw new Error("Failed to fetch pack tasks");
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch completed pack tasks
  const { data: completedTasks = [], isLoading: completedLoading } = useQuery<PackTask[]>({
    queryKey: ["/api/pack-tasks", { status: "completed" }],
    queryFn: async () => {
      const response = await fetch("/api/pack-tasks?status=completed");
      if (!response.ok) throw new Error("Failed to fetch pack tasks");
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch order items for selected task
  const { data: orderItems = [] } = useQuery<OrderItem[]>({
    queryKey: ["/api/order-items", selectedTask?.orderId],
    enabled: !!selectedTask?.orderId,
  });

  // Handle table sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Start packing mutation
  const startPackingMutation = useMutation({
    mutationFn: async (orderId: number) => {
      return apiRequest('/api/pack-tasks', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pack-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Packing started",
        description: "Order added to packing queue",
      });
    },
  });

  // Complete packing mutation
  const completePackingMutation = useMutation({
    mutationFn: async (taskId: number) => {
      return apiRequest(`/api/pack-tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: 'completed',
          weight: parseFloat(weight) || undefined,
          packagingType,
          notes
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pack-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      setIsDrawerOpen(false);
      toast({
        title: "Packing completed",
        description: "Order ready for dispatch",
      });
    },
  });

  // Filter and sort function
  const filterAndSort = (items: any[], searchFields: string[]) => {
    let filtered = items;
    
    if (searchTerm) {
      filtered = items.filter(item =>
        searchFields.some(field => 
          item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const SortableHeader = ({ field, children, className = "" }: { field: string; children: React.ReactNode; className?: string }) => (
    <TableHead className={`cursor-pointer hover:bg-gray-50 ${className} ${sortField === field ? 'bg-blue-50' : ''}`}>
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-2" onClick={() => handleSort(field)}>
          <span className={sortField === field ? 'font-semibold text-blue-700' : ''}>{children}</span>
          <ArrowUpDown className={`h-4 w-4 ${sortField === field ? 'text-blue-700' : 'opacity-50 group-hover:opacity-100'}`} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-50 hover:opacity-100">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="p-2">
              <Input
                placeholder={`Filter ${children}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>
            <DropdownMenuItem onClick={() => handleSort(field)}>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort A → Z
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { handleSort(field); setSortDirection('desc'); }}>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Sort Z → A
            </DropdownMenuItem>
            {searchTerm && (
              <DropdownMenuItem onClick={() => setSearchTerm('')}>
                Clear Filter
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      {/* KPI Cards - Match Inventory exact layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Packed Orders</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <PackageCheck className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">3</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium">↗</span>
              Ready for dispatch
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg. Packing Time</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">1m 24s</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Per order
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Weight Packed Today</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">4.6kg</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium">↗</span>
              Today's total
            </p>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Staff Productivity</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              Orders by 1 Staff
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Tabs - Match Inventory exact styling */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('queue')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'queue' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <Package className="h-4 w-4" />
            <span>Queue ({packingQueue.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('in-progress')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'in-progress' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <Clock className="h-4 w-4" />
            <span>In Progress ({inProgressTasks.length})</span>
          </button>
          <button 
            onClick={() => setActiveTab('completed')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-sm font-medium ${activeTab === 'completed' ? 'text-blue-600 bg-white rounded-md shadow-sm' : 'text-gray-500'}`}
          >
            <PackageCheck className="h-4 w-4" />
            <span>Completed ({completedTasks.length})</span>
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
              <Printer className="h-4 w-4 mr-2" />
              Print Packing Lists
            </DropdownMenuItem>
            <DropdownMenuItem>
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Codes
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Users className="h-4 w-4 mr-2" />
              Assign Packer
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Packing Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content Area - Match Inventory styling */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'queue' && `Queue (${packingQueue.length})`}
              {activeTab === 'in-progress' && `In Progress (${inProgressTasks.length})`}
              {activeTab === 'completed' && `Completed (${completedTasks.length})`}
            </h2>
          </div>

          {/* Active Filters/Sorts */}
          {(searchTerm || sortField) && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm('')} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                    ×
                  </button>
                </Badge>
              )}
              {sortField && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Sort: {sortField} {sortDirection === 'desc' ? '↓' : '↑'}
                  <button onClick={() => { setSortField(''); setSortDirection('asc'); }} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Content based on active tab */}
          {activeTab === 'queue' && (
            <PackingQueueTable
              orders={filterAndSort(packingQueue, ['saylogixNumber', 'sourceOrderNumber', 'customerName'])}
              isLoading={queueLoading}
              onStartPacking={(orderId) => startPackingMutation.mutate(orderId)}
              onRowClick={(order) => {
                setSelectedTask({ 
                  id: 0, 
                  orderId: order.id, 
                  status: 'pending', 
                  createdAt: new Date().toISOString(),
                  order
                });
                setIsDrawerOpen(true);
              }}
              SortableHeader={SortableHeader}
            />
          )}

          {activeTab === 'in-progress' && (
            <InProgressTasksTable
              tasks={filterAndSort(inProgressTasks, ['orderId', 'toteId', 'status'])}
              isLoading={inProgressLoading}
              onRowClick={(task) => {
                setSelectedTask(task);
                setIsDrawerOpen(true);
              }}
              SortableHeader={SortableHeader}
            />
          )}

          {activeTab === 'completed' && (
            <CompletedTasksTable
              tasks={filterAndSort(completedTasks, ['orderId', 'awbNumber', 'completedAt'])}
              isLoading={completedLoading}
              onRowClick={(task) => {
                setSelectedTask(task);
                setIsDrawerOpen(true);
              }}
              SortableHeader={SortableHeader}
            />
          )}
        </div>
      </Card>

      {/* Packing Details Drawer */}
      <PackingDetailsDrawer
        task={selectedTask}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        orderItems={orderItems}
        weight={weight}
        setWeight={setWeight}
        packagingType={packagingType}
        setPackagingType={setPackagingType}
        notes={notes}
        setNotes={setNotes}
        onComplete={(taskId) => completePackingMutation.mutate(taskId)}
        isCompleting={completePackingMutation.isPending}
      />
    </div>
  );
}

// Packing Queue Table Component
function PackingQueueTable({ 
  orders, 
  isLoading, 
  onStartPacking, 
  onRowClick, 
  SortableHeader 
}: {
  orders: Order[];
  isLoading: boolean;
  onStartPacking: (orderId: number) => void;
  onRowClick: (order: Order) => void;
  SortableHeader: React.ComponentType<{ field: string; children: React.ReactNode; className?: string }>;
}) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-2">Loading packing queue...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No orders ready for packing</p>
        <p className="text-sm text-gray-400 mt-1">Orders will appear here when picking is completed</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="saylogixNumber">Order ID</SortableHeader>
            <SortableHeader field="sourceOrderNumber">Source</SortableHeader>
            <SortableHeader field="customerName">Customer</SortableHeader>
            <SortableHeader field="priority">Priority</SortableHeader>
            <SortableHeader field="orderValue">Value</SortableHeader>
            <SortableHeader field="itemCount">Items</SortableHeader>
            <SortableHeader field="createdAt">Created</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow 
              key={order.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onRowClick(order)}
            >
              <TableCell className="font-medium">{order.saylogixNumber}</TableCell>
              <TableCell>{order.sourceOrderNumber}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>
                <Badge className={getPriorityColor(order.priority)}>
                  {order.priority}
                </Badge>
              </TableCell>
              <TableCell>{order.currency} {order.orderValue}</TableCell>
              <TableCell>{order.itemCount}</TableCell>
              <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// In Progress Tasks Table Component
function InProgressTasksTable({ 
  tasks, 
  isLoading, 
  onRowClick, 
  SortableHeader 
}: {
  tasks: PackTask[];
  isLoading: boolean;
  onRowClick: (task: PackTask) => void;
  SortableHeader: React.ComponentType<{ field: string; children: React.ReactNode; className?: string }>;
}) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-2">Loading in-progress tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No tasks in progress</p>
        <p className="text-sm text-gray-400 mt-1">Started packing tasks will appear here</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="orderId">Order ID</SortableHeader>
            <SortableHeader field="toteId">Tote ID</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="packagingType">Packaging</SortableHeader>
            <SortableHeader field="weight">Weight</SortableHeader>
            <SortableHeader field="createdAt">Started</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onRowClick(task)}
            >
              <TableCell className="font-medium">Order #{task.orderId}</TableCell>
              <TableCell>{task.toteId || 'N/A'}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>{task.packagingType || 'TBD'}</TableCell>
              <TableCell>{task.weight ? `${task.weight}kg` : 'TBD'}</TableCell>
              <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Completed Tasks Table Component
function CompletedTasksTable({ 
  tasks, 
  isLoading, 
  onRowClick, 
  SortableHeader 
}: {
  tasks: PackTask[];
  isLoading: boolean;
  onRowClick: (task: PackTask) => void;
  SortableHeader: React.ComponentType<{ field: string; children: React.ReactNode; className?: string }>;
}) {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400" />
        <p className="text-gray-500 mt-2">Loading completed tasks...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <PackageCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No completed packing tasks</p>
        <p className="text-sm text-gray-400 mt-1">Completed tasks will appear here</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader field="orderId">Order ID</SortableHeader>
            <SortableHeader field="awbNumber">AWB</SortableHeader>
            <SortableHeader field="packagingType">Packaging</SortableHeader>
            <SortableHeader field="weight">Weight</SortableHeader>
            <SortableHeader field="completedBy">Packed By</SortableHeader>
            <SortableHeader field="completedAt">Completed</SortableHeader>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow 
              key={task.id} 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onRowClick(task)}
            >
              <TableCell className="font-medium">Order #{task.orderId}</TableCell>
              <TableCell>{task.awbNumber || 'Pending'}</TableCell>
              <TableCell>{task.packagingType || 'Standard'}</TableCell>
              <TableCell>{task.weight ? `${task.weight}kg` : 'N/A'}</TableCell>
              <TableCell>Staff #{task.completedBy || 'Unknown'}</TableCell>
              <TableCell>
                {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'N/A'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Packing Details Drawer Component
function PackingDetailsDrawer({
  task,
  open,
  onOpenChange,
  orderItems,
  weight,
  setWeight,
  packagingType,
  setPackagingType,
  notes,
  setNotes,
  onComplete,
  isCompleting
}: {
  task: PackTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderItems: OrderItem[];
  weight: string;
  setWeight: (weight: string) => void;
  packagingType: string;
  setPackagingType: (type: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onComplete: (taskId: number) => void;
  isCompleting: boolean;
}) {
  if (!task) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Packing Details</SheetTitle>
          <SheetDescription>
            Complete packing for Order #{task.orderId}
          </SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Order Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Order ID</Label>
              <Input value={`Order #${task.orderId}`} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Tote ID</Label>
              <Input value={task.toteId || 'Not assigned'} disabled className="bg-gray-50" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>Started</Label>
              <Input value={new Date(task.createdAt).toLocaleDateString()} disabled className="bg-gray-50" />
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            <Label>Items to Pack</Label>
            <div className="border rounded-lg p-4 space-y-2 max-h-32 overflow-y-auto">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1 border-b last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.productName}</p>
                    <p className="text-xs text-gray-500">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Qty: {item.quantity}</p>
                    <p className="text-xs text-gray-500">{item.currency} {item.unitPrice}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Packing Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Packing Information</h3>
            
            <div className="space-y-2">
              <Label>Packaging Type</Label>
              <Select value={packagingType} onValueChange={setPackagingType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select packaging type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard-box">Standard Box</SelectItem>
                  <SelectItem value="padded-envelope">Padded Envelope</SelectItem>
                  <SelectItem value="tube">Tube</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter package weight"
              />
            </div>

            <div className="space-y-2">
              <Label>Packing Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any special packing notes..."
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => onComplete(task.id)}
              disabled={isCompleting || !packagingType}
              className="flex-1"
            >
              {isCompleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <PackageCheck className="h-4 w-4 mr-2" />
                  Complete Packing
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCompleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper functions
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "normal":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "low":
      return "bg-gray-100 text-gray-800 border-gray-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "in_progress":
      return "bg-yellow-100 text-yellow-800";
    case "pending":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};