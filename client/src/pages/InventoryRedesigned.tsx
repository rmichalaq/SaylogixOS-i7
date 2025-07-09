import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Package, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Edit, 
  ClipboardCheck, 
  CalendarX,
  Plus,
  Check,
  X,
  Download,
  RefreshCw,
  MapPin,
  BarChart3,
  Filter,
  Clock,
  CheckCircle2,
  XCircle,
  Timer
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

// View Tab Components
function ViewAllProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/inventory"],
    refetchInterval: 30000
  });

  const filteredInventory = inventory?.filter((item: any) => {
    const matchesSearch = searchTerm === "" || 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = [...new Set(inventory?.map((item: any) => item.category).filter(Boolean))] || [];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by SKU or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: string) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products ({filteredInventory.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading products...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No products found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reserved
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      On Hand
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.sku}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.productName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant="secondary">
                          {item.category || "No Category"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {item.availableQty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {item.reservedQty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {item.onHandQty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant={item.status === "active" ? "default" : "secondary"}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ViewStockOnHand() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/inventory"],
    refetchInterval: 30000
  });

  const filteredInventory = inventory?.filter((item: any) => {
    const matchesSearch = searchTerm === "" || 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === "all" || item.binLocation === locationFilter;
    
    return matchesSearch && matchesLocation && item.onHandQty > 0;
  }) || [];

  const locations = [...new Set(inventory?.map((item: any) => item.binLocation).filter(Boolean))] || [];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by SKU or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location: string) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock on Hand ({filteredInventory.length} SKUs)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading stock...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No stock found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      On Hand Qty
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Available Qty
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reserved Qty
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Adjustment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {item.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant="outline" className="bg-blue-50">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.binLocation || "No Location"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                        {item.onHandQty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-green-600">
                        {item.availableQty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-amber-600">
                        {item.reservedQty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {item.lastAdjustment ? format(new Date(item.lastAdjustment), "MMM dd, yyyy") : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Adjust Tab Components
function AdjustmentForm() {
  const [formData, setFormData] = useState({
    sku: "",
    binLocation: "",
    adjustmentType: "increase",
    adjustmentQty: "",
    reason: "",
    reasonDetails: ""
  });

  const queryClient = useQueryClient();

  const createAdjustmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/inventory/adjustments", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/adjustments"] });
      setFormData({
        sku: "",
        binLocation: "",
        adjustmentType: "increase",
        adjustmentQty: "",
        reason: "",
        reasonDetails: ""
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAdjustmentMutation.mutate({
      ...formData,
      adjustmentQty: parseInt(formData.adjustmentQty),
      requestedBy: "System Admin"
    });
  };

  const reasonOptions = [
    "Damaged goods",
    "Expired items",
    "Lost items",
    "Found items",
    "Cycle count adjustment",
    "Return to vendor",
    "Theft/shrinkage",
    "System error correction",
    "Other"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Inventory Adjustment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="binLocation">Bin Location *</Label>
              <Input
                id="binLocation"
                value={formData.binLocation}
                onChange={(e) => setFormData({ ...formData, binLocation: e.target.value })}
                placeholder="Enter bin location..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustmentType">Adjustment Type *</Label>
              <Select 
                value={formData.adjustmentType} 
                onValueChange={(value) => setFormData({ ...formData, adjustmentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase Quantity</SelectItem>
                  <SelectItem value="decrease">Decrease Quantity</SelectItem>
                  <SelectItem value="set">Set Quantity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjustmentQty">
                {formData.adjustmentType === "set" ? "New Quantity *" : "Adjustment Quantity *"}
              </Label>
              <Input
                id="adjustmentQty"
                type="number"
                value={formData.adjustmentQty}
                onChange={(e) => setFormData({ ...formData, adjustmentQty: e.target.value })}
                placeholder="Enter quantity..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Select 
                value={formData.reason} 
                onValueChange={(value) => setFormData({ ...formData, reason: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {reasonOptions.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasonDetails">Additional Details</Label>
            <Textarea
              id="reasonDetails"
              value={formData.reasonDetails}
              onChange={(e) => setFormData({ ...formData, reasonDetails: e.target.value })}
              placeholder="Enter additional details about this adjustment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="saylogix-primary"
              disabled={createAdjustmentMutation.isPending}
            >
              {createAdjustmentMutation.isPending ? "Creating..." : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function AdjustmentApproval() {
  const { data: adjustments, isLoading } = useQuery({
    queryKey: ["/api/inventory/adjustments"],
    refetchInterval: 30000
  });

  const queryClient = useQueryClient();

  const approveAdjustmentMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/inventory/adjustments/${id}/approve`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/adjustments"] });
    },
  });

  const rejectAdjustmentMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/inventory/adjustments/${id}/reject`, "PATCH"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/adjustments"] });
    },
  });

  const pendingAdjustments = adjustments?.filter((adj: any) => adj.status === "pending") || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals ({pendingAdjustments.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading adjustments...</p>
          </div>
        ) : pendingAdjustments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CheckCircle2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No pending adjustments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjustment #
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjustment
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingAdjustments.map((adjustment: any) => (
                  <tr key={adjustment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                      {adjustment.adjustmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {adjustment.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {adjustment.binLocation}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant={adjustment.adjustmentType === "increase" ? "default" : "destructive"}>
                        {adjustment.adjustmentType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {adjustment.beforeQty} → {adjustment.afterQty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {adjustment.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {adjustment.requestedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveAdjustmentMutation.mutate(adjustment.id)}
                          disabled={approveAdjustmentMutation.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectAdjustmentMutation.mutate(adjustment.id)}
                          disabled={rejectAdjustmentMutation.isPending}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AdjustmentHistory() {
  const { data: adjustments, isLoading } = useQuery({
    queryKey: ["/api/inventory/adjustments"],
    refetchInterval: 30000
  });

  const completedAdjustments = adjustments?.filter((adj: any) => adj.status !== "pending") || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adjustment History ({completedAdjustments.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading history...</p>
          </div>
        ) : completedAdjustments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No adjustment history</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjustment #
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adjustment
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedAdjustments.map((adjustment: any) => (
                  <tr key={adjustment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {format(new Date(adjustment.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                      {adjustment.adjustmentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {adjustment.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {adjustment.beforeQty} → {adjustment.afterQty}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {adjustment.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant={adjustment.status === "approved" ? "default" : "destructive"}>
                        {adjustment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {adjustment.approvedBy || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Cycle Count Tab Components
function CreateCountTask() {
  const [formData, setFormData] = useState({
    countType: "zone",
    criteria: "",
    dueDate: "",
    notes: ""
  });

  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/inventory/cycle-count", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/cycle-count"] });
      setFormData({
        countType: "zone",
        criteria: "",
        dueDate: "",
        notes: ""
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Cycle Count Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="countType">Count Type *</Label>
              <Select 
                value={formData.countType} 
                onValueChange={(value) => setFormData({ ...formData, countType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zone">Zone Count</SelectItem>
                  <SelectItem value="sku">SKU Count</SelectItem>
                  <SelectItem value="location">Location Count</SelectItem>
                  <SelectItem value="discrepancy">Discrepancy Count</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="criteria">
              {formData.countType === "zone" && "Zone(s) to Count *"}
              {formData.countType === "sku" && "SKU(s) to Count *"}
              {formData.countType === "location" && "Location Range *"}
              {formData.countType === "discrepancy" && "Discrepancy Criteria *"}
            </Label>
            <Input
              id="criteria"
              value={formData.criteria}
              onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
              placeholder={
                formData.countType === "zone" ? "Enter zone codes (e.g., A1, A2, B1)" :
                formData.countType === "sku" ? "Enter SKU list or pattern" :
                formData.countType === "location" ? "Enter location range (e.g., A1-A10)" :
                "Enter discrepancy threshold"
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any additional instructions or notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="saylogix-primary"
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function InProgressCounts() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/inventory/cycle-count"],
    refetchInterval: 30000
  });

  const inProgressTasks = tasks?.filter((task: any) => 
    task.status === "assigned" || task.status === "in_progress"
  ) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>In Progress Counts ({inProgressTasks.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading tasks...</p>
          </div>
        ) : inProgressTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No counts in progress</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task #
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inProgressTasks.map((task: any) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                      {task.taskNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant="outline">
                        {task.countType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {task.completedItemCount} / {task.expectedItemCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {task.assignedTo || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {task.dueDate ? format(new Date(task.dueDate), "MMM dd, yyyy") : "No due date"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant={task.status === "in_progress" ? "default" : "secondary"}>
                        {task.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CountHistory() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/inventory/cycle-count"],
    refetchInterval: 30000
  });

  const completedTasks = tasks?.filter((task: any) => task.status === "completed") || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Count History ({completedTasks.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading history...</p>
          </div>
        ) : completedTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p>No completed counts</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed Date
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task #
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items Counted
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discrepancies
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedTasks.map((task: any) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {task.completedAt ? format(new Date(task.completedAt), "MMM dd, yyyy") : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                      {task.taskNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant="outline">
                        {task.countType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {task.completedItemCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge variant={task.discrepancyCount > 0 ? "destructive" : "default"}>
                        {task.discrepancyCount}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {task.assignedTo || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Expiry Report Component
function ExpiryReport() {
  const [filterLevel, setFilterLevel] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: expiryData, isLoading } = useQuery({
    queryKey: ["/api/inventory/expiry"],
    refetchInterval: 30000
  });

  const filteredData = expiryData?.filter((item: any) => {
    const matchesSearch = searchTerm === "" || 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === "all" || item.alertLevel === filterLevel;
    
    return matchesSearch && matchesLevel;
  }) || [];

  const getAlertBadgeColor = (level: string) => {
    switch (level) {
      case "red": return "destructive";
      case "yellow": return "secondary";
      case "green": return "default";
      default: return "outline";
    }
  };

  const getExpiryStatus = (daysToExpiry: number) => {
    if (daysToExpiry < 0) return "Expired";
    if (daysToExpiry <= 7) return "Critical";
    if (daysToExpiry <= 30) return "Warning";
    return "Good";
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Batches</p>
                <p className="text-3xl font-bold text-gray-900">{expiryData?.length || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-3xl font-bold text-red-600">
                  {expiryData?.filter((item: any) => item.alertLevel === "red" && item.daysToExpiry < 0).length || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-3xl font-bold text-amber-600">
                  {expiryData?.filter((item: any) => item.alertLevel === "yellow").length || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Good</p>
                <p className="text-3xl font-bold text-green-600">
                  {expiryData?.filter((item: any) => item.alertLevel === "green").length || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by SKU or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Alert Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="red">Critical/Expired</SelectItem>
                <SelectItem value="yellow">Warning</SelectItem>
                <SelectItem value="green">Good</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expiry Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Expiry Report ({filteredData.length} batches)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading expiry data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CalendarX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No expiry data found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Number
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days to Expiry
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alert Level
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-gray-900">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {item.batchNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        {item.binLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {format(new Date(item.expiryDate), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {item.daysToExpiry}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant={item.daysToExpiry < 0 ? "destructive" : item.daysToExpiry <= 7 ? "secondary" : "default"}>
                          {getExpiryStatus(item.daysToExpiry)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge variant={getAlertBadgeColor(item.alertLevel)}>
                          {item.alertLevel}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Main Inventory Component
export default function InventoryRedesigned() {
  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
    refetchInterval: 30000
  });

  const totalItems = inventory?.length || 0;
  const lowStockItems = inventory?.filter((item: any) => item.availableQty <= item.reorderLevel).length || 0;
  const totalValue = inventory?.reduce((sum: number, item: any) => sum + (item.availableQty * 25), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Manage your warehouse inventory across all locations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total SKUs</p>
                <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
                <p className="text-sm text-blue-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Active Items
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
                <p className="text-sm font-medium text-gray-600">Low Stock Alert</p>
                <p className="text-3xl font-bold text-red-600">{lowStockItems}</p>
                <p className="text-sm text-red-600">Requires attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inventory Value</p>
                <p className="text-3xl font-bold text-green-600">
                  {(totalValue / 1000).toFixed(0)}K SAR
                </p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Total Value
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">﷼</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Adjustments</p>
                <p className="text-3xl font-bold text-amber-600">3</p>
                <p className="text-sm text-amber-600">Pending approval</p>
              </div>
              <Edit className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="view" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="view" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>View</span>
          </TabsTrigger>
          <TabsTrigger value="adjust" className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Adjust</span>
          </TabsTrigger>
          <TabsTrigger value="cycle-count" className="flex items-center space-x-2">
            <ClipboardCheck className="h-4 w-4" />
            <span>Cycle Count</span>
          </TabsTrigger>
          <TabsTrigger value="expiry" className="flex items-center space-x-2">
            <CalendarX className="h-4 w-4" />
            <span>Expiry Report</span>
          </TabsTrigger>
        </TabsList>

        {/* View Tab */}
        <TabsContent value="view">
          <Tabs defaultValue="all-products" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all-products">All Products</TabsTrigger>
              <TabsTrigger value="stock-on-hand">Stock on Hand</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all-products">
              <ViewAllProducts />
            </TabsContent>
            
            <TabsContent value="stock-on-hand">
              <ViewStockOnHand />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Adjust Tab */}
        <TabsContent value="adjust">
          <Tabs defaultValue="adjustment-form" className="space-y-6">
            <TabsList>
              <TabsTrigger value="adjustment-form">Adjustment Form</TabsTrigger>
              <TabsTrigger value="adjustment-approval">Adjustment Approval</TabsTrigger>
              <TabsTrigger value="adjustment-history">Adjustment History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="adjustment-form">
              <AdjustmentForm />
            </TabsContent>
            
            <TabsContent value="adjustment-approval">
              <AdjustmentApproval />
            </TabsContent>
            
            <TabsContent value="adjustment-history">
              <AdjustmentHistory />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Cycle Count Tab */}
        <TabsContent value="cycle-count">
          <Tabs defaultValue="create-task" className="space-y-6">
            <TabsList>
              <TabsTrigger value="create-task">Create Count Task</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create-task">
              <CreateCountTask />
            </TabsContent>
            
            <TabsContent value="in-progress">
              <InProgressCounts />
            </TabsContent>
            
            <TabsContent value="history">
              <CountHistory />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Expiry Report Tab */}
        <TabsContent value="expiry">
          <ExpiryReport />
        </TabsContent>
      </Tabs>
    </div>
  );
}