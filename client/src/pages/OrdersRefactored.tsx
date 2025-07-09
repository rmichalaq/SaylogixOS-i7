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
import { Download, Filter, MapPin, Phone, Mail, Package, Truck, Edit, X, RotateCcw, AlertTriangle, Eye } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [, setLocation] = useLocation();

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders"],
    refetchInterval: 30000,
  });

  // Filter orders based on active tab
  const filteredOrders = orders.filter((order: Order) => {
    const matchesStatus = activeTab === "all" || order.status === activeTab;
    const matchesSearch = !searchQuery || 
      order.saylogixNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.sourceOrderNumber.includes(searchQuery);
    
    return matchesStatus && matchesSearch;
  });

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
  };

  const handleViewDetails = (order: Order) => {
    setLocation(`/orders/${order.id}`);
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
      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Input
          placeholder="Search orders by number, customer, or source..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-80"
        />
        
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

      {/* Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all" className="text-xs">
            All ({statusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="fetched" className="text-xs">
            Fetched ({statusCounts.fetched})
          </TabsTrigger>
          <TabsTrigger value="picked" className="text-xs">
            Picked ({statusCounts.picked})
          </TabsTrigger>
          <TabsTrigger value="packed" className="text-xs">
            Packed ({statusCounts.packed})
          </TabsTrigger>
          <TabsTrigger value="dispatched" className="text-xs">
            Dispatched ({statusCounts.dispatched})
          </TabsTrigger>
          <TabsTrigger value="delivered" className="text-xs">
            Delivered ({statusCounts.delivered})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="text-xs">
            Cancelled ({statusCounts.cancelled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
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
                      <TableHead>Actions</TableHead>
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
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(order);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOrderClick(order);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
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
        </TabsContent>
      </Tabs>

      {/* Order Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>Order Details</span>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </SheetTitle>
                <SheetDescription>
                  {selectedOrder.saylogixNumber} • #{selectedOrder.sourceOrderNumber}
                  {selectedOrder.sourceChannelData?.shopifyOrderId && 
                    ` • Order ${selectedOrder.sourceChannelData.shopifyOrderId}`
                  }
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Order Summary
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 block">Internal ID:</span>
                        <p className="font-medium">{selectedOrder.saylogixNumber}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Shopify Order #:</span>
                        <p className="font-medium">#{selectedOrder.sourceOrderNumber}</p>
                      </div>
                    </div>
                    {selectedOrder.sourceChannelData?.shopifyOrderId && (
                      <div>
                        <span className="text-gray-500 block">Shopify Order ID:</span>
                        <p className="font-medium">{selectedOrder.sourceChannelData.shopifyOrderId}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 block">Order Value:</span>
                        <p className="font-medium">{formatCurrency(selectedOrder.orderValue, selectedOrder.currency)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Created Time:</span>
                        <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Phone className="h-5 w-5 mr-2" />
                    Customer Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-500 block">Name:</span>
                      <span className="font-medium">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Phone:</span>
                      <span className="font-medium">{selectedOrder.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Email:</span>
                      <span className="font-medium">{selectedOrder.customerEmail || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Delivery Address */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Delivery Address
                  </h3>
                  {selectedOrder.shippingAddress ? (
                    <div className="text-sm bg-gray-50 p-3 rounded-md">
                      <p className="font-medium">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                      <p>{selectedOrder.shippingAddress.address1}</p>
                      {selectedOrder.shippingAddress.address2 && <p>{selectedOrder.shippingAddress.address2}</p>}
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.province}</p>
                      <p>{selectedOrder.shippingAddress.country} {selectedOrder.shippingAddress.zip}</p>
                      {selectedOrder.shippingAddress.phone && (
                        <p className="text-gray-600">Phone: {selectedOrder.shippingAddress.phone}</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm bg-yellow-50 p-3 rounded-md border border-yellow-200">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">⚠️ Address Missing</span>
                      </div>
                      <p className="text-yellow-700 mt-1">No delivery address provided with this order</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Fulfillment & Courier */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Truck className="h-5 w-5 mr-2" />
                    Fulfillment & Courier
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 block">Courier:</span>
                      <span className="font-medium">Not assigned</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">AWB:</span>
                      <span className="font-medium">Not generated</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Current Status:</span>
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {selectedOrder.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditMode(!isEditMode)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Order
                    </Button>
                    
                    <Select value={newStatus} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-[140px] h-8">
                        <RotateCcw className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fetched">Fetched</SelectItem>
                        <SelectItem value="picked">Picked</SelectItem>
                        <SelectItem value="packed">Packed</SelectItem>
                        <SelectItem value="dispatched">Dispatched</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <X className="h-4 w-4 mr-2" />
                          Cancel Order
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cancel Order</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to cancel order {selectedOrder.saylogixNumber}? 
                            This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                            No, Keep Order
                          </Button>
                          <Button variant="destructive" onClick={handleCancelOrder}>
                            Yes, Cancel Order
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}