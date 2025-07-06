import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function Picking() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pickerFilter, setPickerFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<PickingTask | null>(null);

  const { data: pickingTasks = [], isLoading } = useQuery({
    queryKey: ["/api/picking/tasks", { status: statusFilter, picker: pickerFilter }],
    refetchInterval: 15000, // Refresh every 15 seconds for real-time updates
  });

  const { data: pickingBatches = [] } = useQuery({
    queryKey: ["/api/picking/batches"],
    refetchInterval: 30000,
  });

  const { data: pickers = [] } = useQuery({
    queryKey: ["/api/picking/pickers"],
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
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-hand-paper text-primary-500"></i>
              <span>Picking Management</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <i className="fas fa-route mr-2"></i>
                Optimize Routes
              </Button>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Create Batch
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">
            <i className="fas fa-list mr-2"></i>
            Picking Tasks
          </TabsTrigger>
          <TabsTrigger value="batches">
            <i className="fas fa-layer-group mr-2"></i>
            Picking Batches
          </TabsTrigger>
          <TabsTrigger value="performance">
            <i className="fas fa-chart-line mr-2"></i>
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Picking Tasks Tab */}
        <TabsContent value="tasks" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="exception">Exception</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={pickerFilter} onValueChange={setPickerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by picker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pickers</SelectItem>
                    {pickers.map((picker: any) => (
                      <SelectItem key={picker.id} value={picker.id}>
                        {picker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => {
                  setStatusFilter("");
                  setPickerFilter("");
                }}>
                  <i className="fas fa-undo mr-2"></i>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Table */}
          <Card>
            <CardHeader>
              <CardTitle>Picking Tasks ({pickingTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pickingTasks.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-hand-paper text-4xl text-secondary-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No Picking Tasks</h3>
                  <p className="text-secondary-500">
                    {statusFilter || pickerFilter 
                      ? "No tasks match the selected filters"
                      : "No picking tasks available at the moment"
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task Details</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Picker</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickingTasks.map((task: PickingTask) => (
                      <TableRow 
                        key={task.id}
                        className={selectedTask?.id === task.id ? "bg-primary-50" : ""}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-secondary-900">
                              Task #{task.id}
                            </div>
                            <div className="text-sm text-secondary-500">
                              Order: {task.orderNumber}
                            </div>
                            <div className="text-xs text-secondary-400">
                              Path: {task.pickPath}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <div className="font-medium text-secondary-900">
                              {task.sku}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {task.productName}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <div className="text-sm text-secondary-900">
                              Required: {task.quantity}
                            </div>
                            {task.pickedQuantity > 0 && (
                              <div className="text-sm text-success-600">
                                Picked: {task.pickedQuantity}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="font-mono text-sm text-secondary-900">
                            {task.binLocation}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm text-secondary-600">
                            {task.assignedPicker || "Unassigned"}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          {task.exceptionReason && (
                            <div className="text-xs text-error-600 mt-1">
                              {task.exceptionReason}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedTask(task)}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            {task.status === "assigned" && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleStartPicking(task.id)}
                              >
                                <i className="fas fa-play"></i>
                              </Button>
                            )}
                            {task.status === "in_progress" && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCompletePicking(task.id, task.quantity)}
                              >
                                <i className="fas fa-check"></i>
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleReportException(task.id, "Item not found")}
                            >
                              <i className="fas fa-exclamation-triangle"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Task Details */}
          {selectedTask && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Task Details: #{selectedTask.id}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>Order: {selectedTask.orderNumber}</div>
                      <div>Priority: <Badge className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge></div>
                      <div>Created: {new Date(selectedTask.createdAt).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">Product Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>SKU: {selectedTask.sku}</div>
                      <div>Product: {selectedTask.productName}</div>
                      <div>Location: {selectedTask.binLocation}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">Picking Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>Required: {selectedTask.quantity}</div>
                      <div>Picked: {selectedTask.pickedQuantity}</div>
                      <div>Picker: {selectedTask.assignedPicker || "Unassigned"}</div>
                      <div>Status: <Badge className={getStatusColor(selectedTask.status)}>{selectedTask.status}</Badge></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Picking Batches Tab */}
        <TabsContent value="batches" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Picking Batches ({pickingBatches.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {pickingBatches.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-layer-group text-4xl text-secondary-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No Picking Batches</h3>
                  <p className="text-secondary-500">Create batches to group picking tasks efficiently</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Number</TableHead>
                      <TableHead>Assigned Picker</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Estimated Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pickingBatches.map((batch: PickingBatch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-medium">
                          {batch.batchNumber}
                        </TableCell>
                        <TableCell>{batch.assignedPicker}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm text-secondary-900">
                              {batch.completedTasks} / {batch.taskCount} tasks
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-primary-500 h-2 rounded-full"
                                style={{ 
                                  width: `${(batch.completedTasks / batch.taskCount) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{batch.estimatedTime} min</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(batch.status)}>
                            {batch.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Tasks Completed</p>
                    <p className="text-3xl font-bold text-secondary-900">127</p>
                    <p className="text-sm text-success-600">↗ +15% today</p>
                  </div>
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-check text-success-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Avg Pick Time</p>
                    <p className="text-3xl font-bold text-secondary-900">3.2</p>
                    <p className="text-sm text-primary-600">minutes per item</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-clock text-primary-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Accuracy Rate</p>
                    <p className="text-3xl font-bold text-secondary-900">98.5%</p>
                    <p className="text-sm text-success-600">↗ +0.3% this week</p>
                  </div>
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-bullseye text-success-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Active Pickers</p>
                    <p className="text-3xl font-bold text-secondary-900">8</p>
                    <p className="text-sm text-secondary-600">out of 12 total</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-primary-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Picker Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <i className="fas fa-chart-bar text-4xl text-secondary-300 mb-4"></i>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">Performance Analytics</h3>
                <p className="text-secondary-500">Detailed picker performance metrics and analytics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
