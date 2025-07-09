import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Download, Filter, MapPin, Phone, Mail, Package, Truck, Edit, X, RotateCcw, AlertTriangle, Eye, Printer, MoreHorizontal, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle, FileText, RotateCw, Search, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Order {
  id: number;
  saylogixNumber: string;
  sourceOrderNumber: string;
  sourceChannel: string;
  sourceChannelData?: {
    shopifyOrderId?: string;
  };
  status: string;
  priority: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: any;
  billingAddress: any;
  orderValue: string;
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

export default function Orders() {
  const [mainTab, setMainTab] = useState("orders"); // Main tabs: orders, exceptions, returns
  const [orderFilterTab, setOrderFilterTab] = useState("all"); // Order sub-tabs
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [drawerTab, setDrawerTab] = useState("details");
  const [returnReason, setReturnReason] = useState("");
  const [returnNotes, setReturnNotes] = useState("");
  const [, setLocation] = useLocation();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["/api/order-items", selectedOrder?.id],
    enabled: !!selectedOrder,
  });

  const { data: orderEvents = [] } = useQuery({
    queryKey: ["/api/events/order", selectedOrder?.id],
    enabled: !!selectedOrder,
  });

  // Filter orders based on active tabs
  const getFilteredOrders = () => {
    if (mainTab === "orders") {
      return orders.filter((order: Order) => {
        const statusMap: { [key: string]: string } = {
          new: "fetched",
          picked: "picked",
          packed: "packed",
          "ready-to-ship": "packed", // Packed orders are ready to ship
          dispatched: "dispatched",
          delivered: "delivered",
          cancelled: "cancelled",
          all: "all"
        };
        
        const targetStatus = statusMap[orderFilterTab] || orderFilterTab;
        const matchesStatus = orderFilterTab === "all" || order.status === targetStatus;
        const matchesSearch = !searchQuery || 
          order.saylogixNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.sourceOrderNumber.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      });
    } else if (mainTab === "exceptions") {
      // Filter orders with exceptions (for now, show orders with missing addresses)
      return orders.filter((order: Order) => {
        const hasException = !order.shippingAddress || order.status === "failed";
        const matchesSearch = !searchQuery || 
          order.saylogixNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
        return hasException && matchesSearch;
      });
    } else if (mainTab === "returns") {
      // For now, returns will be empty until we implement returns functionality
      return [];
    }
    return [];
  };

  const filteredOrders = getFilteredOrders();

  // Calculate status counts
  const statusCounts = {
    all: orders.length,
    fetched: orders.filter((o: Order) => o.status === 'fetched').length,
    picked: orders.filter((o: Order) => o.status === 'picked').length,
    packed: orders.filter((o: Order) => o.status === 'packed').length,
    dispatched: orders.filter((o: Order) => o.status === 'dispatched').length,
    delivered: orders.filter((o: Order) => o.status === 'delivered').length,
    cancelled: orders.filter((o: Order) => o.status === 'cancelled').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "dispatched":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "packed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "picked":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "fetched":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
    setDrawerTab("details"); // Reset to details tab when opening drawer
  };

  const formatCurrency = (amount: string, currency: string) => {
    return `${parseFloat(amount).toFixed(2)} ${currency}`;
  };

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: number; updates: any }) => {
      return apiRequest(`/api/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order updated successfully" });
      setIsDrawerOpen(false);
      setIsEditMode(false);
      setShowCancelDialog(false);
    },
    onError: () => {
      toast({ title: "Failed to update order", variant: "destructive" });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    if (selectedOrder) {
      updateOrderMutation.mutate({
        orderId: selectedOrder.id,
        updates: { status: newStatus }
      });
    }
  };

  const handleCancelOrder = () => {
    if (selectedOrder) {
      updateOrderMutation.mutate({
        orderId: selectedOrder.id,
        updates: { status: 'cancelled' }
      });
    }
  };

  const hasValidAddress = (order: Order) => {
    return order.shippingAddress && 
           order.shippingAddress.address1 && 
           order.shippingAddress.city;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
          <TabsTrigger value="returns">Returns</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="mt-6 space-y-4">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders by number, customer, or source..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Order Status Sub-tabs */}
          <Tabs value={orderFilterTab} onValueChange={setOrderFilterTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="picked">Picked</TabsTrigger>
              <TabsTrigger value="packed">Packed</TabsTrigger>
              <TabsTrigger value="ready-to-ship">Ready to Ship</TabsTrigger>
              <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
              <TabsTrigger value="delivered">Delivered</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <Card className="mt-4">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Details</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Courier</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order: Order) => (
                        <TableRow 
                          key={order.id} 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleOrderClick(order)}
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-blue-600">
                                  {order.saylogixNumber}
                                </div>
                                {!hasValidAddress(order) && (
                                  <AlertTriangle className="h-4 w-4 text-yellow-500" title="Address Missing" />
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                shopify: #{order.sourceOrderNumber}
                              </div>
                              {order.sourceChannelData?.shopifyOrderId && (
                                <div className="text-xs text-gray-400">
                                  Order: {order.sourceChannelData.shopifyOrderId}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-gray-500">{order.customerPhone}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(order.orderValue, order.currency)}
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-400">-</span>
                          </TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {filteredOrders.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-500">
                      {searchQuery ? "Try adjusting your search criteria" : "No orders match the current filter"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Tabs>
        </TabsContent>

        {/* Exceptions Tab */}
        <TabsContent value="exceptions" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search exceptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Exception Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order: Order) => (
                      <TableRow 
                        key={order.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleOrderClick(order)}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-blue-600">
                              {order.saylogixNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              shopify: #{order.sourceOrderNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customerPhone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">
                              {!order.shippingAddress ? "Missing Address" : "Processing Error"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(order.orderValue, order.currency)}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exceptions found</h3>
                  <p className="text-gray-500">All orders are processing normally</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Returns Tab */}
        <TabsContent value="returns" className="mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search returns by order ID, customer, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Return ID</TableHead>
                      <TableHead>Original Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Return Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Returns will be empty for now */}
                  </TableBody>
                </Table>
              </div>
              
              <div className="text-center py-12">
                <RotateCcw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No returns found</h3>
                <p className="text-gray-500">There are no return orders to display</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[800px] sm:max-w-[800px] overflow-hidden flex flex-col">
          {selectedOrder && (
            <>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="text-xl font-semibold">
                      Order {selectedOrder.saylogixNumber}
                    </SheetTitle>
                    <SheetDescription className="mt-1">
                      Shopify #{selectedOrder.sourceOrderNumber}
                      {selectedOrder.sourceChannelData?.shopifyOrderId && 
                        ` • ID: ${selectedOrder.sourceChannelData.shopifyOrderId}`
                      }
                    </SheetDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-2" />
                      Print AWB
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditMode(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Order
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowReturnModal(true)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Trigger Return
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-red-600">
                          <X className="h-4 w-4 mr-2" />
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </SheetHeader>

              <div className="flex-1 overflow-hidden flex flex-col">
                <Tabs value={drawerTab} onValueChange={setDrawerTab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="details">Item Details</TabsTrigger>
                    <TabsTrigger value="timeline">Order Timeline</TabsTrigger>
                    <TabsTrigger value="incidents">Returns & Incidents</TabsTrigger>
                  </TabsList>

                  <div className="flex-1 overflow-y-auto px-1">
                    {/* Item Details Tab */}
                    <TabsContent value="details" className="mt-0 space-y-6 data-[state=active]:mt-0">
                      {/* Order Details Card */}
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Order Details</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Saylogix Number</span>
                              <p className="font-medium">{selectedOrder.saylogixNumber}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Source Order</span>
                              <p className="font-medium">#{selectedOrder.sourceOrderNumber}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Order Date</span>
                              <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Total Value</span>
                              <p className="font-medium">{formatCurrency(selectedOrder.orderValue, selectedOrder.currency)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Status</span>
                              <Badge className={`${getStatusColor(selectedOrder.status)} mt-1`}>
                                {selectedOrder.status}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-gray-500">Priority</span>
                              <p className="font-medium capitalize">{selectedOrder.priority}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Customer Info Card */}
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Name</span>
                              <p className="font-medium">{selectedOrder.customerName}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Phone</span>
                              <p className="font-medium">{selectedOrder.customerPhone}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500">Email</span>
                              <p className="font-medium">{selectedOrder.customerEmail || 'Not provided'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Shipping Address Card */}
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                          {selectedOrder.shippingAddress ? (
                            <div className="text-sm space-y-1">
                              <p className="font-medium">
                                {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                              </p>
                              <p>{selectedOrder.shippingAddress.address1}</p>
                              {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                              <p>
                                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province} {selectedOrder.shippingAddress.zip}
                              </p>
                              <p>{selectedOrder.shippingAddress.country}</p>
                              {selectedOrder.shippingAddress.phone && (
                                <p className="text-gray-600 mt-2">Phone: {selectedOrder.shippingAddress.phone}</p>
                              )}
                            </div>
                          ) : (
                            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                              <div className="flex items-center gap-2 text-yellow-800">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">Address Missing</span>
                              </div>
                              <p className="text-yellow-700 mt-1 text-sm">No delivery address provided with this order</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Shipment Details Card */}
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Shipment Details</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">AWB Number</span>
                              <p className="font-medium">Not Generated</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Courier</span>
                              <p className="font-medium">Not Assigned</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Weight (kg)</span>
                              <p className="font-medium">-</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Dimensions</span>
                              <p className="font-medium">-</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* SKU Details Table */}
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">SKU Details</h3>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Product Name</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead>Barcode</TableHead>
                                  <TableHead>Batch No.</TableHead>
                                  <TableHead>Qty</TableHead>
                                  <TableHead>Unit Price</TableHead>
                                  <TableHead>Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {orderItems.length > 0 ? (
                                  orderItems.map((item: any) => (
                                    <TableRow key={item.id}>
                                      <TableCell className="font-medium">{item.productName}</TableCell>
                                      <TableCell>{item.sku}</TableCell>
                                      <TableCell>{item.barcode || '-'}</TableCell>
                                      <TableCell>{item.batchNumber || '-'}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{formatCurrency(item.unitPrice, selectedOrder.currency)}</TableCell>
                                      <TableCell>{formatCurrency(item.totalPrice, selectedOrder.currency)}</TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={7} className="text-center text-gray-500">
                                      No items found
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Order Timeline Tab */}
                    <TabsContent value="timeline" className="mt-0 data-[state=active]:mt-0">
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
                          {orderEvents.length > 0 ? (
                            <div className="space-y-4">
                              {orderEvents
                                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((event: any, index: number) => {
                                  const getEventIcon = () => {
                                    if (event.eventType.includes('placed')) return <Package className="h-5 w-5" />;
                                    if (event.eventType.includes('paid')) return <CheckCircle className="h-5 w-5 text-green-600" />;
                                    if (event.eventType.includes('picked')) return <Package className="h-5 w-5 text-blue-600" />;
                                    if (event.eventType.includes('packed')) return <Package className="h-5 w-5 text-indigo-600" />;
                                    if (event.eventType.includes('dispatched')) return <Truck className="h-5 w-5 text-purple-600" />;
                                    if (event.eventType.includes('delivered')) return <CheckCircle className="h-5 w-5 text-green-700" />;
                                    if (event.eventType.includes('cancelled')) return <XCircle className="h-5 w-5 text-red-600" />;
                                    if (event.eventType.includes('failed')) return <AlertCircle className="h-5 w-5 text-red-600" />;
                                    return <Clock className="h-5 w-5 text-gray-600" />;
                                  };

                                  return (
                                    <div key={event.id} className="flex gap-4">
                                      <div className="flex flex-col items-center">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                          {getEventIcon()}
                                        </div>
                                        {index < orderEvents.length - 1 && (
                                          <div className="h-full w-0.5 bg-gray-200 mt-2" />
                                        )}
                                      </div>
                                      <div className="flex-1 pb-4">
                                        <div className="flex items-center justify-between">
                                          <h4 className="font-medium">{event.description || event.eventType}</h4>
                                          <span className="text-sm text-gray-500">
                                            {new Date(event.createdAt).toLocaleString()}
                                          </span>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-600">
                                          <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {event.actor || 'System'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                              <p>No timeline events recorded yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Returns & Incidents Tab */}
                    <TabsContent value="incidents" className="mt-0 data-[state=active]:mt-0">
                      <Card>
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-4">Returns & Incidents</h3>
                          <div className="text-center py-12 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                            <p>No returns or incidents recorded</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Return Modal */}
      <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Trigger Return</DialogTitle>
            <DialogDescription>
              Initiate a return for order {selectedOrder?.saylogixNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="return-reason">Return Reason</Label>
              <Select value={returnReason} onValueChange={setReturnReason}>
                <SelectTrigger id="return-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="damaged">Damaged Product</SelectItem>
                  <SelectItem value="wrong-item">Wrong Item Sent</SelectItem>
                  <SelectItem value="not-as-described">Not as Described</SelectItem>
                  <SelectItem value="quality-issue">Quality Issue</SelectItem>
                  <SelectItem value="customer-changed-mind">Customer Changed Mind</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="return-notes">Additional Notes</Label>
              <Textarea
                id="return-notes"
                placeholder="Enter any additional details about the return..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                toast({
                  title: "Return initiated",
                  description: `Return request for order ${selectedOrder?.saylogixNumber} has been created.`,
                });
                setShowReturnModal(false);
                setReturnReason("");
                setReturnNotes("");
              }}
              disabled={!returnReason}
            >
              Initiate Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}