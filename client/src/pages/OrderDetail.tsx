import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, Package, User, MapPin, Truck, Clock, 
  Edit, RotateCcw, X, AlertTriangle, CheckCircle,
  Calendar, Hash, Phone, Mail, CreditCard, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Order {
  id: number;
  saylogixNumber: string;
  sourceOrderNumber: string;
  sourceChannel: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderValue: number;
  currency: string;
  createdAt: string;
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  sourceChannelData?: {
    shopifyOrderId?: string;
  };
}

interface OrderItem {
  id: number;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderEvent {
  id: number;
  eventType: string;
  eventData: any;
  createdAt: string;
  description: string;
}

export default function OrderDetail() {
  const [, setLocation] = useLocation();
  const { id } = useParams();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["/api/orders", id],
    enabled: !!id
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["/api/order-items", id],
    enabled: !!id
  });

  const { data: orderEvents = [] } = useQuery({
    queryKey: ["/api/events", "order", id],
    enabled: !!id
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (updates: { status: string }) => {
      return apiRequest(`/api/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update order", variant: "destructive" });
    }
  });

  const handleStatusChange = (status: string) => {
    setNewStatus(status);
    updateOrderMutation.mutate({ status });
  };

  const handleCancelOrder = () => {
    updateOrderMutation.mutate({ status: "cancelled" });
    setShowCancelDialog(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      fetched: "bg-blue-100 text-blue-800",
      picked: "bg-purple-100 text-purple-800",
      packed: "bg-indigo-100 text-indigo-800",
      dispatched: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'SAR'
    }).format(amount);
  };

  const getTimelineEvents = () => {
    const events = [
      { status: "pending", label: "Order Placed", icon: Package },
      { status: "fetched", label: "Order Fetched", icon: CheckCircle },
      { status: "picked", label: "Items Picked", icon: Package },
      { status: "packed", label: "Order Packed", icon: Package },
      { status: "dispatched", label: "Dispatched", icon: Truck },
      { status: "delivered", label: "Delivered", icon: CheckCircle }
    ];

    return events.map(event => {
      const orderEvent = orderEvents.find(e => e.eventType.includes(event.status));
      return {
        ...event,
        completed: order?.status === event.status || (order?.status && events.findIndex(e => e.status === order.status) > events.findIndex(e => e.status === event.status)),
        timestamp: orderEvent?.createdAt || (event.status === "pending" ? order?.createdAt : null)
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/orders")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setLocation("/orders")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order {order.saylogixNumber}</h1>
            <p className="text-gray-600">#{order.sourceOrderNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
          <Select value={newStatus} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
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
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Item Details</TabsTrigger>
          <TabsTrigger value="timeline">Order Timeline</TabsTrigger>
          <TabsTrigger value="logs">Order Log</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Order Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Order Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 block">Order Source:</span>
                    <span className="font-medium capitalize">{order.sourceChannel}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Internal ID:</span>
                    <span className="font-medium">{order.saylogixNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Source Order #:</span>
                    <span className="font-medium">#{order.sourceOrderNumber}</span>
                  </div>
                  {order.sourceChannelData?.shopifyOrderId && (
                    <div>
                      <span className="text-gray-500 block">Shopify Order ID:</span>
                      <span className="font-medium">{order.sourceChannelData.shopifyOrderId}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 block">Created At:</span>
                    <span className="font-medium">{new Date(order.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Number of Items:</span>
                    <span className="font-medium">{orderItems.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Total Quantity:</span>
                    <span className="font-medium">{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Order Value:</span>
                    <span className="font-medium">{formatCurrency(order.orderValue, order.currency)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Payment Status:</span>
                    <span className="font-medium">Prepaid</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Hub Name:</span>
                    <span className="font-medium">SC01-KSA</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500 block">Name:</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Contact Number:</span>
                    <span className="font-medium">{order.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Email:</span>
                    <span className="font-medium">{order.customerEmail || 'Not provided'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {order.shippingAddress ? (
                  <div className="text-sm space-y-2">
                    <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.address1}</p>
                    {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                    <p>{order.shippingAddress.city}, {order.shippingAddress.province}</p>
                    <p>{order.shippingAddress.country} {order.shippingAddress.zip}</p>
                    {order.shippingAddress.phone && (
                      <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Address Missing</span>
                    </div>
                    <p className="text-yellow-700 mt-1">No delivery address provided</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Shipment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Shipment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div>
                  <span className="text-gray-500 block">AWB Number:</span>
                  <span className="font-medium">Not generated</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Suggested Courier:</span>
                  <span className="font-medium">Auto-assigned</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Number of Packages:</span>
                  <span className="font-medium">1</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Total Weight:</span>
                  <span className="font-medium">Not calculated</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Delivery Status:</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500 block">Insurance Status:</span>
                  <span className="font-medium">Not insured</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SKU Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>SKU Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Product Name</th>
                      <th className="text-left p-3">SKU</th>
                      <th className="text-left p-3">Barcode</th>
                      <th className="text-left p-3">Batch Number</th>
                      <th className="text-center p-3">Ordered Qty</th>
                      <th className="text-center p-3">Picked Qty</th>
                      <th className="text-left p-3">Expiry Date</th>
                      <th className="text-right p-3">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-3 font-medium">{item.productName}</td>
                        <td className="p-3">{item.sku}</td>
                        <td className="p-3">-</td>
                        <td className="p-3">-</td>
                        <td className="p-3 text-center">{item.quantity}</td>
                        <td className="p-3 text-center">-</td>
                        <td className="p-3">-</td>
                        <td className="p-3 text-right">{formatCurrency(item.totalPrice, order.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {getTimelineEvents().map((event, index) => (
                  <div key={event.status} className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      event.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <event.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${event.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                          {event.label}
                        </h4>
                        {event.timestamp && (
                          <span className="text-sm text-gray-500">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Order Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderEvents.length > 0 ? (
                  orderEvents.map((event) => (
                    <div key={event.id} className="border-l-2 border-gray-200 pl-4 pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{event.eventType}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{event.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No events recorded for this order yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Order Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order {order.saylogixNumber}? 
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
  );
}