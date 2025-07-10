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

// Sortable Column Header Component
function SortableColumnHeader({ 
  children, 
  sortKey, 
  sortConfig, 
  onSort 
}: {
  children: React.ReactNode;
  sortKey: string;
  sortConfig: SortConfig;
  onSort: (key: string) => void;
}) {
  const getSortIcon = () => {
    if (sortConfig.key !== sortKey) {
      return <ChevronDown className="h-4 w-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-blue-600" /> : 
      <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  return (
    <Button
      variant="ghost"
      onClick={() => onSort(sortKey)}
      className="h-auto p-2 font-medium text-gray-500 hover:text-gray-900 justify-start w-full"
    >
      <span className="flex items-center justify-between w-full">
        {children}
        {getSortIcon()}
      </span>
    </Button>
  );
}

// Filterable Column Header Component  
function FilterableColumnHeader({
  children,
  filterKey,
  columnFilters,
  onFilterChange,
  options = []
}: {
  children: React.ReactNode;
  filterKey: string;
  columnFilters: ColumnFilters;
  onFilterChange: (key: string, value: string) => void;
  options?: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilter = columnFilters[filterKey] && columnFilters[filterKey] !== "";

  return (
    <div className="flex items-center justify-between w-full">
      <span>{children}</span>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className={`h-6 w-6 p-0 ml-1 ${hasActiveFilter ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Filter className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          <div className="space-y-2">
            <Input
              placeholder="Filter..."
              value={columnFilters[filterKey] || ""}
              onChange={(e) => onFilterChange(filterKey, e.target.value)}
              className="h-8"
            />
            {options.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 px-1">Quick filters:</div>
                {options.map((option) => (
                  <Button
                    key={option}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onFilterChange(filterKey, option);
                      setIsOpen(false);
                    }}
                    className="w-full justify-start h-6 px-2 text-xs"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            )}
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onFilterChange(filterKey, "");
                  setIsOpen(false);
                }}
                className="w-full justify-start h-6 px-2 text-xs text-red-600"
              >
                Clear filter
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
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

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }
    
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const sortedAndFilteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filteredOrders = orders.filter((order: Order) => {
      return Object.entries(columnFilters).every(([key, value]) => {
        if (!value) return true;
        const orderValue = String(order[key as keyof Order] || '').toLowerCase();
        return orderValue.includes(value.toLowerCase());
      });
    });

    if (sortConfig.direction && sortConfig.key) {
      filteredOrders.sort((a: Order, b: Order) => {
        const aValue = a[sortConfig.key as keyof Order] || '';
        const bValue = b[sortConfig.key as keyof Order] || '';
        
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortableColumnHeader sortKey="saylogixNumber" sortConfig={sortConfig} onSort={handleSort}>
                        Saylogix #
                      </SortableColumnHeader>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FilterableColumnHeader 
                        filterKey="customerName" 
                        columnFilters={columnFilters} 
                        onFilterChange={handleFilterChange}
                      >
                        Customer
                      </FilterableColumnHeader>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FilterableColumnHeader 
                        filterKey="status" 
                        columnFilters={columnFilters} 
                        onFilterChange={handleFilterChange}
                        options={statusOptions}
                      >
                        Status
                      </FilterableColumnHeader>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FilterableColumnHeader 
                        filterKey="priority" 
                        columnFilters={columnFilters} 
                        onFilterChange={handleFilterChange}
                        options={priorityOptions}
                      >
                        Priority
                      </FilterableColumnHeader>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FilterableColumnHeader 
                        filterKey="city" 
                        columnFilters={columnFilters} 
                        onFilterChange={handleFilterChange}
                      >
                        City
                      </FilterableColumnHeader>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <FilterableColumnHeader 
                        filterKey="courierService" 
                        columnFilters={columnFilters} 
                        onFilterChange={handleFilterChange}
                        options={courierOptions}
                      >
                        Courier
                      </FilterableColumnHeader>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortableColumnHeader sortKey="totalAmount" sortConfig={sortConfig} onSort={handleSort}>
                        Amount
                      </SortableColumnHeader>
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortableColumnHeader sortKey="createdAt" sortConfig={sortConfig} onSort={handleSort}>
                        Created
                      </SortableColumnHeader>
                    </th>
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
                        <div className="font-medium text-gray-900">{order.saylogixNumber}</div>
                        <div className="text-sm text-gray-500">{order.sourceOrderNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getStatusColor(order.status)} border px-2 py-1`}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={`${getPriorityColor(order.priority)} border px-2 py-1`}>
                          {order.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{order.city}</div>
                        <div className="text-sm text-gray-500">{order.region}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{order.courierService || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="font-medium text-gray-900">
                          {parseFloat(order.totalAmount).toFixed(2)} {order.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success-100 text-success-800 border-success-200";
      case "dispatched":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "packed":
        return "bg-success-100 text-success-800 border-success-200";
      case "picked":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "picking":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "validated":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "received":
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
      case "exception":
        return "bg-error-100 text-error-800 border-error-200";
      case "cancelled":
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

  const formatCurrency = (amount: string, currency: string) => {
    return `${parseFloat(amount).toFixed(2)} ${currency}`;
  };

  const getOrderProgress = (order: Order) => {
    const milestones = [
      { key: "orderFetched", label: "Received", completed: !!order.orderFetched },
      { key: "orderValidated", label: "Validated", completed: !!order.orderValidated },
      { key: "picked", label: "Picked", completed: !!order.picked },
      { key: "packed", label: "Packed", completed: !!order.packed },
      { key: "dispatched", label: "Dispatched", completed: !!order.dispatched },
      { key: "delivered", label: "Delivered", completed: !!order.delivered },
    ];

    const completedCount = milestones.filter(m => m.completed).length;
    const progressPercentage = (completedCount / milestones.length) * 100;

    return { milestones, progressPercentage };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="h-12 w-12 text-primary-500 mb-4 mx-auto animate-pulse" />
          <p className="text-secondary-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All', count: orders.length },
              { key: 'received', label: 'Fetched', count: orders.filter(o => o.status === 'received').length },
              { key: 'picking', label: 'Picked', count: orders.filter(o => o.status === 'picking').length },
              { key: 'packed', label: 'Packed', count: orders.filter(o => o.status === 'packed').length },
              { key: 'dispatched', label: 'Dispatched', count: orders.filter(o => o.status === 'dispatched').length },
              { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
              { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  statusFilter === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-1 py-0.5 px-2 rounded-full text-xs ${
                    statusFilter === tab.key
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {orders.length > 0 && (
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-secondary-300 mb-4 mx-auto" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No Orders Found</h3>
              <p className="text-secondary-500">
                {statusFilter !== 'all' 
                  ? `No orders found with status "${statusFilter}". Try switching to a different tab.`
                  : "Connect your Shopify store and sync orders to get started."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Details</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status & Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Courier</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: Order) => {
                  const { progressPercentage } = getOrderProgress(order);
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-secondary-900">
                            {order.saylogixNumber}
                          </div>
                          <div className="text-sm text-secondary-500">
                            {order.sourceChannel}: {order.sourceOrderNumber}
                          </div>
                          <div className="text-xs text-secondary-400">
                            {order.itemCount} items • {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <div className="font-medium text-secondary-900">
                            {order.customerName}
                          </div>
                          <div className="text-sm text-secondary-500">
                            {order.customerPhone}
                          </div>
                          <div className="text-xs text-secondary-400">
                            {order.city}, {order.region}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-2">
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="w-24">
                          <div className="flex items-center justify-between text-xs text-secondary-500 mb-1">
                            <span>Progress</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary-500 h-2 rounded-full transition-all"
                              style={{ width: `${progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-medium text-secondary-900">
                          {formatCurrency(order.totalAmount, order.currency)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-secondary-600">
                          {order.courierService || "Not assigned"}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDrawerOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Truck className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalOrders > 50 && (
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <span className="text-sm text-secondary-500">
            Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, totalOrders)} of {totalOrders} orders
          </span>
          
          <Button 
            variant="outline" 
            disabled={page * 50 >= totalOrders}
            onClick={() => setPage(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Order Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[500px] sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>
              Complete order information and fulfillment status
            </SheetDescription>
          </SheetHeader>
          
          {selectedOrder && (
            <div className="mt-6 space-y-6">
              {/* Order Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Saylogix Number</p>
                    <p className="font-medium">{selectedOrder.saylogixNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Source Order</p>
                    <p className="font-medium">{selectedOrder.sourceOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Channel</p>
                    <p className="font-medium">{selectedOrder.sourceChannel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{selectedOrder.customerName}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.customerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-sm text-gray-500">{selectedOrder.city}, {selectedOrder.region}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fulfillment & Courier */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Fulfillment & Courier</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Courier Service</p>
                    <p className="font-medium">{selectedOrder.courierService || "Not assigned"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Priority</p>
                    <Badge className={getPriorityColor(selectedOrder.priority)}>
                      {selectedOrder.priority}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Order Amount */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Order Amount</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(selectedOrder.totalAmount, selectedOrder.currency)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Order
                </Button>
                <Button variant="outline" className="flex-1">
                  Change Status
                </Button>
                <Button variant="destructive" className="flex-1">
                  Cancel Order
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
