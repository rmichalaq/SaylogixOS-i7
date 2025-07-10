import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Download, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Package, 
  Truck, 
  Eye, 
  Edit, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Plus,
  Upload,
  Settings,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Zap
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

// Orders Actions Menu Component
function OrdersActionsMenu() {
  const [createOrderOpen, setCreateOrderOpen] = useState(false);

  const handleDownloadOrders = () => {
    console.log("Download orders as Excel");
  };

  const handleImportOrders = () => {
    console.log("Import orders via CSV");
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
          <DropdownMenuItem onClick={() => setCreateOrderOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Manual Order
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleImportOrders}>
            <Upload className="mr-2 h-4 w-4" />
            Import Orders via CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadOrders}>
            <Download className="mr-2 h-4 w-4" />
            Download Orders
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Order Drawer */}
      <CreateOrderDrawer 
        open={createOrderOpen}
        onOpenChange={setCreateOrderOpen}
      />
    </>
  );
}

// Create Order Drawer Component
function CreateOrderDrawer({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    sourceOrderNumber: "",
    sourceChannel: "manual",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    city: "",
    region: "",
    address: "",
    priority: "normal",
    courierService: "",
    totalAmount: "",
    currency: "SAR",
    notes: ""
  });

  const queryClient = useQueryClient();

  const createOrderMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/orders", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onOpenChange(false);
      // Reset form
      setFormData({
        sourceOrderNumber: "",
        sourceChannel: "manual",
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        city: "",
        region: "",
        address: "",
        priority: "normal",
        courierService: "",
        totalAmount: "",
        currency: "SAR",
        notes: ""
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      totalAmount: parseFloat(formData.totalAmount) || 0,
    };
    
    createOrderMutation.mutate(submitData);
  };

  const handleCancel = () => {
    setFormData({
      sourceOrderNumber: "",
      sourceChannel: "manual",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      city: "",
      region: "",
      address: "",
      priority: "normal",
      courierService: "",
      totalAmount: "",
      currency: "SAR",
      notes: ""
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Create Manual Order</SheetTitle>
          <SheetDescription>
            Create a new order manually for processing
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sourceOrderNumber">Order Number *</Label>
              <Input
                id="sourceOrderNumber"
                value={formData.sourceOrderNumber}
                onChange={(e) => setFormData({ ...formData, sourceOrderNumber: e.target.value })}
                placeholder="Enter order number..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceChannel">Source Channel</Label>
              <Select 
                value={formData.sourceChannel} 
                onValueChange={(value) => setFormData({ ...formData, sourceChannel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="phone">Phone Order</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Enter customer name..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="Enter phone number..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="Enter email address..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="Enter region..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courierService">Courier Service</Label>
              <Select 
                value={formData.courierService} 
                onValueChange={(value) => setFormData({ ...formData, courierService: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select courier..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aramex">Aramex</SelectItem>
                  <SelectItem value="smsa">SMSA</SelectItem>
                  <SelectItem value="naqel">Naqel</SelectItem>
                  <SelectItem value="ups">UPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter full delivery address..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any additional notes..."
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="saylogix-primary"
              disabled={createOrderMutation.isPending}
            >
              {createOrderMutation.isPending ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}



interface Order {
  id: number;
  saylogixNumber: string;
  sourceOrderNumber: string;
  sourceChannel: string;
  status: string;
  priority: string;
  customerName: string;
  customerPhone: string;
  city: string;
  region: string;
  courierService: string;
  totalAmount: string;
  currency: string;
  itemCount: number;
  createdAt: string;
  orderFetched: string;
  orderValidated: string;
  picked: string;
  packed: string;
  dispatched: string;
  delivered: string;
}

// Order Details Drawer Component
function OrderDetailsDrawer({ 
  order, 
  open, 
  onOpenChange 
}: {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    city: "",
    region: "",
    priority: "",
    status: "",
    courierService: "",
    totalAmount: "",
    currency: ""
  });

  const queryClient = useQueryClient();

  // Update form when order changes
  React.useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName || "",
        customerPhone: order.customerPhone || "",
        city: order.city || "",
        region: order.region || "",
        priority: order.priority || "",
        status: order.status || "",
        courierService: order.courierService || "",
        totalAmount: order.totalAmount || "",
        currency: order.currency || ""
      });
    }
  }, [order]);

  const updateOrderMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/orders/${order?.id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    
    const submitData = {
      ...formData,
      totalAmount: parseFloat(formData.totalAmount) || 0,
    };
    
    updateOrderMutation.mutate(submitData);
  };

  const handleCancel = () => {
    if (order) {
      setFormData({
        customerName: order.customerName || "",
        customerPhone: order.customerPhone || "",
        city: order.city || "",
        region: order.region || "",
        priority: order.priority || "",
        status: order.status || "",
        courierService: order.courierService || "",
        totalAmount: order.totalAmount || "",
        currency: order.currency || ""
      });
    }
    onOpenChange(false);
  };

  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Order Details - {order.saylogixNumber}</SheetTitle>
          <SheetDescription>
            Edit order information and update status
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="saylogixNumber">Saylogix Number</Label>
              <Input
                id="saylogixNumber"
                value={order.saylogixNumber}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceOrderNumber">Source Order</Label>
              <Input
                id="sourceOrderNumber"
                value={order.sourceOrderNumber}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Enter customer name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="Enter phone number..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Enter city..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="Enter region..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="picking">Picking</SelectItem>
                  <SelectItem value="picked">Picked</SelectItem>
                  <SelectItem value="packed">Packed</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="exception">Exception</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courierService">Courier Service</Label>
              <Select 
                value={formData.courierService} 
                onValueChange={(value) => setFormData({ ...formData, courierService: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select courier..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aramex">Aramex</SelectItem>
                  <SelectItem value="smsa">SMSA</SelectItem>
                  <SelectItem value="naqel">Naqel</SelectItem>
                  <SelectItem value="ups">UPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceChannel">Source Channel</Label>
              <Input
                id="sourceChannel"
                value={order.sourceChannel}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="saylogix-primary"
              disabled={updateOrderMutation.isPending}
            >
              {updateOrderMutation.isPending ? "Saving..." : "Save Changes"}
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

// Main Orders Table Component
function OrdersTable() {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: null });
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
  });

  // Helper function to get column values for sorting and filtering
  const getColumnValue = (order: any, column: string) => {
    switch (column) {
      case 'orderDetails':
        return order.saylogixNumber + ' ' + order.sourceOrderNumber;
      case 'customer':
        return order.customerName + ' ' + order.customerPhone;
      case 'status':
        return order.status || '';
      case 'value':
        return parseFloat(order.totalAmount) || 0;
      case 'courier':
        return order.courierService || '';
      case 'created':
        return new Date(order.createdAt).getTime();
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

  const sortedAndFilteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filteredOrders = orders.filter((order: Order) => {
      // Apply column filters
      const matchesColumnFilters = Object.entries(columnFilters).every(([column, filterValue]) => {
        if (!filterValue) return true;
        const orderValue = getColumnValue(order, column).toString().toLowerCase();
        return orderValue.includes(filterValue.toLowerCase());
      });
      
      return matchesColumnFilters;
    });

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      filteredOrders.sort((a: Order, b: Order) => {
        const aValue = getColumnValue(a, sortConfig.key);
        const bValue = getColumnValue(b, sortConfig.key);
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredOrders;
  }, [orders, sortConfig, columnFilters]);

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "dispatched":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "packed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "picked":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "picking":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "validated":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "received":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "exception":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const statusOptions = ["received", "validated", "picking", "picked", "packed", "dispatched", "delivered", "cancelled", "exception"];
  const priorityOptions = ["low", "normal", "high", "urgent"];
  const courierOptions = ["aramex", "smsa", "naqel", "ups"];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Orders ({sortedAndFilteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading orders...</p>
            </div>
          ) : sortedAndFilteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <SortableColumnHeader 
                      column="orderDetails" 
                      label="Order Details" 
                      sortConfig={sortConfig} 
                      columnFilters={columnFilters} 
                      onSort={handleSort} 
                      onFilter={handleColumnFilter} 
                      onClearFilter={handleClearFilter} 
                      className="text-left"
                    />
                    <SortableColumnHeader 
                      column="customer" 
                      label="Customer" 
                      sortConfig={sortConfig} 
                      columnFilters={columnFilters} 
                      onSort={handleSort} 
                      onFilter={handleColumnFilter} 
                      onClearFilter={handleClearFilter} 
                      className="text-left"
                    />
                    <SortableColumnHeader 
                      column="status" 
                      label="Status" 
                      sortConfig={sortConfig} 
                      columnFilters={columnFilters} 
                      onSort={handleSort} 
                      onFilter={handleColumnFilter} 
                      onClearFilter={handleClearFilter} 
                      className="text-left"
                    />
                    <SortableColumnHeader 
                      column="value" 
                      label="Value" 
                      sortConfig={sortConfig} 
                      columnFilters={columnFilters} 
                      onSort={handleSort} 
                      onFilter={handleColumnFilter} 
                      onClearFilter={handleClearFilter} 
                      className="text-right"
                    />
                    <SortableColumnHeader 
                      column="courier" 
                      label="Courier" 
                      sortConfig={sortConfig} 
                      columnFilters={columnFilters} 
                      onSort={handleSort} 
                      onFilter={handleColumnFilter} 
                      onClearFilter={handleClearFilter} 
                      className="text-left"
                    />
                    <SortableColumnHeader 
                      column="created" 
                      label="Created" 
                      sortConfig={sortConfig} 
                      columnFilters={columnFilters} 
                      onSort={handleSort} 
                      onFilter={handleColumnFilter} 
                      onClearFilter={handleClearFilter} 
                      className="text-left"
                    />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAndFilteredOrders.map((order: Order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleRowClick(order)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{order.saylogixNumber}</div>
                          <div className="text-sm text-gray-500">Shopify: #{order.sourceOrderNumber}</div>
                          <div className="text-xs text-gray-400">ID: {order.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.customerPhone}</div>
                          <div className="text-xs text-gray-400">{order.city}, {order.region}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getStatusColor(order.status)} border px-2 py-1`}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-medium text-gray-900">
                          {parseFloat(order.totalAmount).toFixed(2)} {order.currency}
                        </div>
                        <div className="text-sm text-gray-500">{order.itemCount} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{order.courierService || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {order.createdAt ? format(new Date(order.createdAt), 'MMM dd, yyyy') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailsDrawer 
        order={selectedOrder}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />
    </>
  );
}

export default function Orders() {
  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
  });

  const totalOrders = orders?.length || 0;
  const activeOrders = orders?.filter((order: Order) => 
    !["delivered", "cancelled"].includes(order.status)
  ).length || 0;
  const readyToShip = orders?.filter((order: Order) => 
    order.status === "packed"
  ).length || 0;
  const exceptions = orders?.filter((order: Order) => 
    order.status === "exception"
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
                <p className="text-sm text-blue-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  All Orders
                </p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Orders</p>
                <p className="text-3xl font-bold text-amber-600">{activeOrders}</p>
                <p className="text-sm text-amber-600">In Processing</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Ship</p>
                <p className="text-3xl font-bold text-green-600">{readyToShip}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Packed Orders
                </p>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exceptions</p>
                <p className="text-3xl font-bold text-red-600">{exceptions}</p>
                <p className="text-sm text-red-600">Need Attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger value="exceptions" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Exceptions</span>
          </TabsTrigger>
          <TabsTrigger value="returns" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Returns</span>
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Tabs defaultValue="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="picked">Picked</TabsTrigger>
                <TabsTrigger value="packed">Packed</TabsTrigger>
                <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              
              {/* Contextual Action Button */}
              <OrdersActionsMenu />
            </div>
            
            <TabsContent value="all">
              <OrdersTable />
            </TabsContent>
            
            <TabsContent value="new">
              <OrdersTable />
            </TabsContent>
            
            <TabsContent value="picked">
              <OrdersTable />
            </TabsContent>
            
            <TabsContent value="packed">
              <OrdersTable />
            </TabsContent>
            
            <TabsContent value="dispatched">
              <OrdersTable />
            </TabsContent>
            
            <TabsContent value="delivered">
              <OrdersTable />
            </TabsContent>
            
            <TabsContent value="cancelled">
              <OrdersTable />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Exceptions Tab */}
        <TabsContent value="exceptions">
          <Card>
            <CardHeader>
              <CardTitle>Order Exceptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No exceptions found</p>
                <p className="text-sm">Orders with processing issues will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Returns Tab */}
        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle>Returns Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p>No returns found</p>
                <p className="text-sm">Return requests will be managed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
