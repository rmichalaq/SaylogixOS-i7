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
  const [statusFilter, setStatusFilter] = useState("");
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
      {/* Header and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-shopping-cart text-primary-500"></i>
              <span>Order Management System (OMS)</span>
            </div>
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Manual Order
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search orders by number, customer, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
                <SelectItem value="picking">Picking</SelectItem>
                <SelectItem value="picked">Picked</SelectItem>
                <SelectItem value="packed">Packed</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="exception">Exception</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Orders ({totalOrders})</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary-500">
                Page {page} • Showing {orders.length} orders
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-inbox text-4xl text-secondary-300 mb-4"></i>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No Orders Found</h3>
              <p className="text-secondary-500">
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
