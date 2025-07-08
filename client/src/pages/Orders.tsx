import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["/api/orders", { status: statusFilter, page, limit: 50, search: searchQuery }],
    refetchInterval: 30000,
  });

  const orders = ordersData?.orders || [];
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
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-secondary-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search by order ID, customer, or AWB..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80"
              />
            </div>
            
            <div className="flex gap-2">
              {orders.length > 0 && (
                <Button variant="outline" size="sm">
                  <i className="fas fa-download mr-2"></i>
                  Export
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/shopify/sync', { method: 'POST' });
                    if (response.ok) {
                      // Refresh orders list
                      window.location.reload();
                    }
                  } catch (error) {
                    console.error('Failed to sync Shopify orders:', error);
                  }
                }}
              >
                <i className="fas fa-sync mr-2"></i>
                Sync Shopify
              </Button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All', count: orders.length },
                { key: 'received', label: 'New', count: orders.filter(o => o.status === 'received').length },
                { key: 'picking', label: 'Picking', count: orders.filter(o => o.status === 'picking').length },
                { key: 'packed', label: 'Packed', count: orders.filter(o => o.status === 'packed').length },
                { key: 'dispatched', label: 'Dispatched', count: orders.filter(o => o.status === 'dispatched').length },
                { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
                { key: 'returned', label: 'Returned', count: orders.filter(o => o.status === 'returned').length },
                { key: 'exception', label: 'Issues', count: orders.filter(o => o.status === 'exception').length },
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
            </nav>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-4xl text-secondary-300 mb-4"></i>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No Orders Found</h3>
              <p className="text-secondary-500">
                {statusFilter !== 'all' 
                  ? `No orders found with status "${statusFilter}". Try switching to a different tab.`
                  : "Connect your Shopify store and sync orders to get started."
                }
              </p>
            </div>
          ) : (
                {searchQuery || statusFilter 
                  ? "Try adjusting your search or filter criteria"
                  : "No orders have been created yet"
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
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-eye"></i>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-truck"></i>
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
            <i className="fas fa-chevron-left mr-2"></i>
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
            <i className="fas fa-chevron-right ml-2"></i>
          </Button>
        </div>
      )}
    </div>
  );
}
