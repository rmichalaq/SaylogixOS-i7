import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Download, Filter, MapPin, Phone, Mail, Package, Truck, Eye, Edit, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["/api/orders", { status: statusFilter, limit: 100 }],
    refetchInterval: 30000,
  });

  const orders = ordersData || [];
  const totalOrders = ordersData?.total || 0;

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
