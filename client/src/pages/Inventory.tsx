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

interface InventoryItem {
  id: number;
  sku: string;
  productName: string;
  description?: string;
  category: string;
  availableQuantity: number;
  allocatedQuantity: number;
  inboundQuantity: number;
  binLocation?: string;
  zone?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  status: string;
  isHazardous: boolean;
  requiresExpiry: boolean;
  updatedAt: string;
}

interface AdjustmentFormData {
  sku: string;
  adjustmentQuantity: number;
  reason: string;
}

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("view");
  
  // Adjustment form state
  const [adjustmentForm, setAdjustmentForm] = useState<AdjustmentFormData>({
    sku: "",
    adjustmentQuantity: 0,
    reason: ""
  });

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["/api/inventory", { 
      search: searchQuery, 
      category: categoryFilter, 
      status: statusFilter,
      page, 
      limit: 50 
    }],
    refetchInterval: 30000,
  });

  const inventory = inventoryData?.items || [];
  const totalItems = inventoryData?.total || 0;

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/inventory/categories"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-100 text-success-800 border-success-200";
      case "inactive":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "discontinued":
        return "bg-error-100 text-error-800 border-error-200";
      default:
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
    }
  };

  const getStockLevel = (available: number, allocated: number) => {
    const total = available + allocated;
    if (total === 0) return { level: "out", color: "text-error-600" };
    if (available <= 10) return { level: "low", color: "text-warning-600" };
    if (available <= 50) return { level: "medium", color: "text-primary-600" };
    return { level: "good", color: "text-success-600" };
  };

  const handleAdjustInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adjustmentForm.sku || adjustmentForm.adjustmentQuantity === 0) {
      return;
    }

    try {
      // TODO: Implement inventory adjustment API call
      console.log("Adjusting inventory:", adjustmentForm);
      
      // Reset form
      setAdjustmentForm({
        sku: "",
        adjustmentQuantity: 0,
        reason: ""
      });
    } catch (error) {
      console.error("Inventory adjustment error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-secondary-500">Loading inventory...</p>
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
              <i className="fas fa-boxes text-primary-500"></i>
              <span>Warehouse Management System (WMS)</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <i className="fas fa-download mr-2"></i>
                Export
              </Button>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Add Item
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Tabs for different inventory views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="view">
            <i className="fas fa-eye mr-2"></i>
            View Inventory
          </TabsTrigger>
          <TabsTrigger value="adjust">
            <i className="fas fa-edit mr-2"></i>
            Adjust Stock
          </TabsTrigger>
          <TabsTrigger value="cycle-count">
            <i className="fas fa-clipboard-check mr-2"></i>
            Cycle Count
          </TabsTrigger>
          <TabsTrigger value="expiry-report">
            <i className="fas fa-calendar-times mr-2"></i>
            Expiry Report
          </TabsTrigger>
        </TabsList>

        {/* View Inventory Tab */}
        <TabsContent value="view" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search by SKU or product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map((category: string) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("");
                  setStatusFilter("");
                  setPage(1);
                }}>
                  <i className="fas fa-undo mr-2"></i>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Inventory Items ({totalItems})</span>
                <span className="text-sm text-secondary-500">
                  Page {page} • Showing {inventory.length} items
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventory.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-box-open text-4xl text-secondary-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No Inventory Found</h3>
                  <p className="text-secondary-500">
                    {searchQuery || categoryFilter || statusFilter 
                      ? "Try adjusting your search or filter criteria"
                      : "No inventory items have been added yet"
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Details</TableHead>
                      <TableHead>Stock Levels</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item: InventoryItem) => {
                      const stockLevel = getStockLevel(item.availableQuantity, item.allocatedQuantity);
                      
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-secondary-900">
                                {item.sku}
                              </div>
                              <div className="text-sm text-secondary-600">
                                {item.productName}
                              </div>
                              {item.description && (
                                <div className="text-xs text-secondary-400 mt-1">
                                  {item.description}
                                </div>
                              )}
                              <Badge variant="outline" className="mt-1">
                                {item.category}
                              </Badge>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">Available:</span>
                                <span className={`text-sm font-bold ${stockLevel.color}`}>
                                  {item.availableQuantity}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-secondary-500">Allocated:</span>
                                <span className="text-sm">{item.allocatedQuantity}</span>
                              </div>
                              {item.inboundQuantity > 0 && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-secondary-500">Inbound:</span>
                                  <span className="text-sm text-primary-600">{item.inboundQuantity}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div>
                              {item.binLocation ? (
                                <>
                                  <div className="text-sm font-medium text-secondary-900">
                                    {item.binLocation}
                                  </div>
                                  <div className="text-xs text-secondary-500">
                                    Zone: {item.zone || "Unknown"}
                                  </div>
                                </>
                              ) : (
                                <span className="text-sm text-secondary-400">No location</span>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              {item.weight && (
                                <div className="text-xs text-secondary-500">
                                  Weight: {item.weight}kg
                                </div>
                              )}
                              {item.dimensions && (
                                <div className="text-xs text-secondary-500">
                                  {item.dimensions.length}×{item.dimensions.width}×{item.dimensions.height}cm
                                </div>
                              )}
                              <div className="flex space-x-1">
                                {item.isHazardous && (
                                  <Badge variant="destructive" className="text-xs">
                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                    Hazardous
                                  </Badge>
                                )}
                                {item.requiresExpiry && (
                                  <Badge variant="outline" className="text-xs">
                                    <i className="fas fa-calendar mr-1"></i>
                                    Expiry
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <Badge className={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm">
                                <i className="fas fa-edit"></i>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <i className="fas fa-history"></i>
                              </Button>
                              <Button variant="ghost" size="sm">
                                <i className="fas fa-arrows-alt"></i>
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
        </TabsContent>

        {/* Adjust Stock Tab */}
        <TabsContent value="adjust" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Adjustment</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdjustInventory} className="space-y-4">
                  <div>
                    <Label htmlFor="adjust-sku">SKU</Label>
                    <Input
                      id="adjust-sku"
                      placeholder="Enter SKU to adjust"
                      value={adjustmentForm.sku}
                      onChange={(e) => setAdjustmentForm({ ...adjustmentForm, sku: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="adjust-quantity">Adjustment Quantity</Label>
                    <Input
                      id="adjust-quantity"
                      type="number"
                      placeholder="Enter positive or negative quantity"
                      value={adjustmentForm.adjustmentQuantity || ""}
                      onChange={(e) => setAdjustmentForm({ 
                        ...adjustmentForm, 
                        adjustmentQuantity: parseInt(e.target.value) || 0 
                      })}
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                      Use positive numbers to increase stock, negative to decrease
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="adjust-reason">Reason</Label>
                    <Select 
                      value={adjustmentForm.reason} 
                      onValueChange={(value) => setAdjustmentForm({ ...adjustmentForm, reason: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason for adjustment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical_count">Physical Count Correction</SelectItem>
                        <SelectItem value="damage">Damaged Items</SelectItem>
                        <SelectItem value="theft">Theft/Loss</SelectItem>
                        <SelectItem value="receiving_error">Receiving Error</SelectItem>
                        <SelectItem value="system_error">System Error</SelectItem>
                        <SelectItem value="cycle_count">Cycle Count Adjustment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!adjustmentForm.sku || adjustmentForm.adjustmentQuantity === 0 || !adjustmentForm.reason}
                  >
                    <i className="fas fa-save mr-2"></i>
                    Apply Adjustment
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Adjustments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <i className="fas fa-history text-4xl text-secondary-300 mb-4"></i>
                  <p className="text-secondary-500">Recent adjustment history will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cycle Count Tab */}
        <TabsContent value="cycle-count" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cycle Count Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <i className="fas fa-clipboard-check text-4xl text-secondary-300 mb-4"></i>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">Cycle Count Module</h3>
                <p className="text-secondary-500 mb-4">
                  Schedule and manage inventory cycle counts
                </p>
                <Button>
                  <i className="fas fa-plus mr-2"></i>
                  Schedule Cycle Count
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expiry Report Tab */}
        <TabsContent value="expiry-report" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expiry Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <i className="fas fa-calendar-times text-4xl text-secondary-300 mb-4"></i>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">Product Expiry Tracking</h3>
                <p className="text-secondary-500">
                  Monitor products nearing expiration dates
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {totalItems > 50 && activeTab === "view" && (
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
            Showing {((page - 1) * 50) + 1} to {Math.min(page * 50, totalItems)} of {totalItems} items
          </span>
          
          <Button 
            variant="outline" 
            disabled={page * 50 >= totalItems}
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
