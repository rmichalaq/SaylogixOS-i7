import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PackingTask {
  id: number;
  orderId: number;
  orderNumber: string;
  customerName: string;
  itemCount: number;
  packageType?: string;
  packageSize?: string;
  actualWeight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  assignedPacker?: string;
  status: string;
  priority: string;
  labelGenerated: boolean;
  labelUrl?: string;
  awbNumber?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface PackageDetails {
  packageType: string;
  packageSize: string;
  actualWeight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
}

export default function Packing() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [statusFilter, setStatusFilter] = useState("");
  const [packerFilter, setPackerFilter] = useState("");
  const [selectedTask, setSelectedTask] = useState<PackingTask | null>(null);
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({
    packageType: "",
    packageSize: "",
    actualWeight: 0,
    dimensions: { length: 0, width: 0, height: 0 }
  });

  const { data: packingTasks = [], isLoading } = useQuery({
    queryKey: ["/api/packing/tasks", { status: statusFilter, packer: packerFilter }],
    refetchInterval: 15000,
  });

  const { data: packers = [] } = useQuery({
    queryKey: ["/api/packing/packers"],
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

  const handleStartPacking = async (taskId: number) => {
    try {
      // TODO: Implement start packing API call
      console.log("Starting packing for task:", taskId);
    } catch (error) {
      console.error("Start packing error:", error);
    }
  };

  const handleCompletePacking = async (taskId: number) => {
    try {
      if (!packageDetails.packageType || !packageDetails.actualWeight) {
        alert("Please fill in all package details");
        return;
      }

      // TODO: Implement complete packing API call
      console.log("Completing packing for task:", taskId, "details:", packageDetails);
      
      // Reset form
      setPackageDetails({
        packageType: "",
        packageSize: "",
        actualWeight: 0,
        dimensions: { length: 0, width: 0, height: 0 }
      });
      setSelectedTask(null);
    } catch (error) {
      console.error("Complete packing error:", error);
    }
  };

  const handleGenerateLabel = async (taskId: number) => {
    try {
      // TODO: Implement generate label API call
      console.log("Generating label for task:", taskId);
    } catch (error) {
      console.error("Generate label error:", error);
    }
  };

  const packageTypes = [
    { value: "box", label: "Box" },
    { value: "envelope", label: "Envelope" },
    { value: "bag", label: "Bag" },
    { value: "tube", label: "Tube" },
    { value: "custom", label: "Custom" }
  ];

  const packageSizes = [
    { value: "xs", label: "Extra Small" },
    { value: "s", label: "Small" },
    { value: "m", label: "Medium" },
    { value: "l", label: "Large" },
    { value: "xl", label: "Extra Large" },
    { value: "custom", label: "Custom Size" }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-secondary-500">Loading packing tasks...</p>
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
              <i className="fas fa-box text-primary-500"></i>
              <span>Packing Management</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <i className="fas fa-print mr-2"></i>
                Print Labels
              </Button>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Manual Pack
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tasks">
            <i className="fas fa-list mr-2"></i>
            Packing Tasks
          </TabsTrigger>
          <TabsTrigger value="workstation">
            <i className="fas fa-desktop mr-2"></i>
            Workstation
          </TabsTrigger>
          <TabsTrigger value="performance">
            <i className="fas fa-chart-line mr-2"></i>
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Packing Tasks Tab */}
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
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="exception">Exception</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={packerFilter} onValueChange={setPackerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by packer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Packers</SelectItem>
                    {packers.map((packer: any) => (
                      <SelectItem key={packer.id} value={packer.id}>
                        {packer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => {
                  setStatusFilter("");
                  setPackerFilter("");
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
              <CardTitle>Packing Tasks ({packingTasks.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {packingTasks.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-box text-4xl text-secondary-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No Packing Tasks</h3>
                  <p className="text-secondary-500">
                    {statusFilter || packerFilter 
                      ? "No tasks match the selected filters"
                      : "No packing tasks available at the moment"
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Package Info</TableHead>
                      <TableHead>Weight & Dimensions</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Packer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packingTasks.map((task: PackingTask) => (
                      <TableRow 
                        key={task.id}
                        className={selectedTask?.id === task.id ? "bg-primary-50" : ""}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-secondary-900">
                              {task.orderNumber}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {task.itemCount} items
                            </div>
                            {task.awbNumber && (
                              <div className="text-xs text-secondary-400">
                                AWB: {task.awbNumber}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm text-secondary-900">
                            {task.customerName}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            {task.packageType && (
                              <div className="text-sm text-secondary-900">
                                {task.packageType} ({task.packageSize})
                              </div>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              {task.labelGenerated ? (
                                <Badge className="bg-success-100 text-success-800">
                                  <i className="fas fa-check mr-1"></i>
                                  Label Ready
                                </Badge>
                              ) : (
                                <Badge className="bg-warning-100 text-warning-800">
                                  <i className="fas fa-clock mr-1"></i>
                                  No Label
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            {task.actualWeight && (
                              <div className="text-sm text-secondary-900">
                                {task.actualWeight}kg
                              </div>
                            )}
                            {task.dimensions && (
                              <div className="text-xs text-secondary-500">
                                {task.dimensions.length}×{task.dimensions.width}×{task.dimensions.height}cm
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm text-secondary-600">
                            {task.assignedPacker || "Unassigned"}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
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
                                onClick={() => handleStartPacking(task.id)}
                              >
                                <i className="fas fa-play"></i>
                              </Button>
                            )}
                            {task.labelGenerated && task.labelUrl && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.open(task.labelUrl, '_blank')}
                              >
                                <i className="fas fa-print"></i>
                              </Button>
                            )}
                            {!task.labelGenerated && task.status === "completed" && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleGenerateLabel(task.id)}
                              >
                                <i className="fas fa-tag"></i>
                              </Button>
                            )}
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

        {/* Workstation Tab */}
        <TabsContent value="workstation" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Details */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedTask ? `Packing: ${selectedTask.orderNumber}` : "Select a Task"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedTask ? (
                  <div className="text-center py-8">
                    <i className="fas fa-hand-pointer text-4xl text-secondary-300 mb-4"></i>
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">Select a Task</h3>
                    <p className="text-secondary-500">Choose a packing task from the tasks tab to begin packing</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-secondary-900 mb-2">Order Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>Order: {selectedTask.orderNumber}</div>
                        <div>Customer: {selectedTask.customerName}</div>
                        <div>Items: {selectedTask.itemCount}</div>
                        <div>Priority: <Badge className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge></div>
                      </div>
                    </div>

                    {selectedTask.status === "in_progress" && (
                      <div className="space-y-4">
                        <h4 className="font-medium text-secondary-900">Package Details</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="package-type">Package Type</Label>
                            <Select 
                              value={packageDetails.packageType} 
                              onValueChange={(value) => setPackageDetails({ ...packageDetails, packageType: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select package type" />
                              </SelectTrigger>
                              <SelectContent>
                                {packageTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="package-size">Package Size</Label>
                            <Select 
                              value={packageDetails.packageSize} 
                              onValueChange={(value) => setPackageDetails({ ...packageDetails, packageSize: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select package size" />
                              </SelectTrigger>
                              <SelectContent>
                                {packageSizes.map((size) => (
                                  <SelectItem key={size.value} value={size.value}>
                                    {size.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="actual-weight">Actual Weight (kg)</Label>
                          <Input
                            id="actual-weight"
                            type="number"
                            step="0.1"
                            placeholder="Enter weight"
                            value={packageDetails.actualWeight || ""}
                            onChange={(e) => setPackageDetails({ 
                              ...packageDetails, 
                              actualWeight: parseFloat(e.target.value) || 0 
                            })}
                          />
                        </div>

                        <div>
                          <Label>Dimensions (cm)</Label>
                          <div className="grid grid-cols-3 gap-2 mt-1">
                            <Input
                              type="number"
                              placeholder="Length"
                              value={packageDetails.dimensions.length || ""}
                              onChange={(e) => setPackageDetails({ 
                                ...packageDetails, 
                                dimensions: { 
                                  ...packageDetails.dimensions, 
                                  length: parseFloat(e.target.value) || 0 
                                }
                              })}
                            />
                            <Input
                              type="number"
                              placeholder="Width"
                              value={packageDetails.dimensions.width || ""}
                              onChange={(e) => setPackageDetails({ 
                                ...packageDetails, 
                                dimensions: { 
                                  ...packageDetails.dimensions, 
                                  width: parseFloat(e.target.value) || 0 
                                }
                              })}
                            />
                            <Input
                              type="number"
                              placeholder="Height"
                              value={packageDetails.dimensions.height || ""}
                              onChange={(e) => setPackageDetails({ 
                                ...packageDetails, 
                                dimensions: { 
                                  ...packageDetails.dimensions, 
                                  height: parseFloat(e.target.value) || 0 
                                }
                              })}
                            />
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleCompletePacking(selectedTask.id)}
                          className="w-full"
                          disabled={!packageDetails.packageType || !packageDetails.actualWeight}
                        >
                          <i className="fas fa-check mr-2"></i>
                          Complete Packing
                        </Button>
                      </div>
                    )}

                    {selectedTask.status === "completed" && !selectedTask.labelGenerated && (
                      <Button 
                        onClick={() => handleGenerateLabel(selectedTask.id)}
                        className="w-full"
                      >
                        <i className="fas fa-tag mr-2"></i>
                        Generate Shipping Label
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Packing Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Packing Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      <i className="fas fa-info-circle mr-2"></i>
                      Fragile Items
                    </h4>
                    <p className="text-sm text-blue-700">
                      Use bubble wrap and ensure adequate cushioning for fragile items
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">
                      <i className="fas fa-weight-hanging mr-2"></i>
                      Weight Guidelines
                    </h4>
                    <p className="text-sm text-green-700">
                      Verify actual weight matches expected weight. Report discrepancies immediately
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Quality Check
                    </h4>
                    <p className="text-sm text-yellow-700">
                      Ensure all items match the order before sealing the package
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">
                      <i className="fas fa-tag mr-2"></i>
                      Labeling
                    </h4>
                    <p className="text-sm text-purple-700">
                      Generate and attach shipping label before moving to dispatch
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Packages Packed</p>
                    <p className="text-3xl font-bold text-secondary-900">156</p>
                    <p className="text-sm text-success-600">↗ +8% today</p>
                  </div>
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-box text-success-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Avg Pack Time</p>
                    <p className="text-3xl font-bold text-secondary-900">4.2</p>
                    <p className="text-sm text-primary-600">minutes per package</p>
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
                    <p className="text-sm font-medium text-secondary-600">Label Success</p>
                    <p className="text-3xl font-bold text-secondary-900">99.2%</p>
                    <p className="text-sm text-success-600">↗ +0.5% this week</p>
                  </div>
                  <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-tag text-success-600"></i>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-600">Active Packers</p>
                    <p className="text-3xl font-bold text-secondary-900">6</p>
                    <p className="text-sm text-secondary-600">out of 8 total</p>
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
              <CardTitle>Packer Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <i className="fas fa-chart-line text-4xl text-secondary-300 mb-4"></i>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">Performance Analytics</h3>
                <p className="text-secondary-500">Detailed packer performance metrics and trends</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
