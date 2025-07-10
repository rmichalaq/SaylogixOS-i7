import { useState } from "react";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  Timer,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Upload,
  FileSpreadsheet,
  Settings
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

// Types for sorting and filtering
type SortConfig = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

type ColumnFilters = {
  [key: string]: string;
};

// Inventory Actions Menu Component
function InventoryActionsMenu() {
  const [createProductOpen, setCreateProductOpen] = useState(false);

  const handleDownloadInventory = () => {
    // TODO: Implement Excel export functionality
    console.log("Download inventory as Excel");
  };

  const handleUploadBulk = () => {
    // TODO: Implement bulk upload functionality
    console.log("Upload bulk products");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Actions</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={() => setCreateProductOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Product
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleUploadBulk}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Bulk Products
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownloadInventory}>
            <Download className="mr-2 h-4 w-4" />
            Download Inventory
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Product Drawer */}
      <CreateProductDrawer 
        open={createProductOpen}
        onOpenChange={setCreateProductOpen}
      />
    </>
  );
}

// Create Product Drawer Component
function CreateProductDrawer({ open, onOpenChange }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    barcode: "",
    sku: "",
    description: "",
    status: "active",
    weight: "",
    dimensions: "",
    availableQty: "0",
    reservedQty: "0",
    onHandQty: "0",
    reorderLevel: "10",
    binLocation: ""
  });

  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/inventory", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      onOpenChange(false);
      // Reset form
      setFormData({
        productName: "",
        category: "",
        barcode: "",
        sku: "",
        description: "",
        status: "active",
        weight: "",
        dimensions: "",
        availableQty: "0",
        reservedQty: "0",
        onHandQty: "0",
        reorderLevel: "10",
        binLocation: ""
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert numeric fields to numbers
    const submitData = {
      ...formData,
      availableQty: parseInt(formData.availableQty) || 0,
      reservedQty: parseInt(formData.reservedQty) || 0,
      onHandQty: parseInt(formData.onHandQty) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 10,
      weight: formData.weight ? parseFloat(formData.weight) : null,
    };
    
    createProductMutation.mutate(submitData);
  };

  const handleCancel = () => {
    setFormData({
      productName: "",
      category: "",
      barcode: "",
      sku: "",
      description: "",
      status: "active",
      weight: "",
      dimensions: "",
      availableQty: "0",
      reservedQty: "0",
      onHandQty: "0",
      reorderLevel: "10",
      binLocation: ""
    });
    onOpenChange(false);
  };

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "low_stock", label: "Low Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
    { value: "discontinued", label: "Discontinued" }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Create New Product</SheetTitle>
          <SheetDescription>
            Add a new product to your inventory
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="Enter product name..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU Code *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Enter category..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Enter barcode..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Inventory Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="binLocation">Bin Location</Label>
              <Input
                id="binLocation"
                value={formData.binLocation}
                onChange={(e) => setFormData({ ...formData, binLocation: e.target.value })}
                placeholder="e.g., A1-B2-C3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="onHandQty">On Hand Quantity</Label>
              <Input
                id="onHandQty"
                type="number"
                min="0"
                value={formData.onHandQty}
                onChange={(e) => setFormData({ ...formData, onHandQty: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableQty">Available Quantity</Label>
              <Input
                id="availableQty"
                type="number"
                min="0"
                value={formData.availableQty}
                onChange={(e) => setFormData({ ...formData, availableQty: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservedQty">Reserved Quantity</Label>
              <Input
                id="reservedQty"
                type="number"
                min="0"
                value={formData.reservedQty}
                onChange={(e) => setFormData({ ...formData, reservedQty: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                placeholder="10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="Enter weight..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions">Dimensions (L x W x H)</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                placeholder="e.g., 10 x 5 x 2 cm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="saylogix-primary"
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// Sortable Column Header Component
function SortableColumnHeader({ 
  column, 
  label, 
  className = "",
  sortConfig,
  columnFilters,
  onSort,
  onFilter,
  onClearFilter
}: { 
  column: string; 
  label: string; 
  className?: string;
  sortConfig: SortConfig;
  columnFilters: ColumnFilters;
  onSort: (column: string) => void;
  onFilter: (column: string, value: string) => void;
  onClearFilter: (column: string) => void;
}) {
  const getSortIcon = () => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const hasActiveFilter = columnFilters[column] && columnFilters[column].length > 0;

  return (
    <th className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      <div className="flex items-center justify-between group">
        <button
          onClick={() => onSort(column)}
          className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
        >
          <span>{label}</span>
          {getSortIcon()}
        </button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                hasActiveFilter ? 'opacity-100 text-blue-600' : ''
              }`}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-3">
              <div>
                <Label htmlFor={`filter-${column}`} className="text-sm font-medium">
                  Filter {label}
                </Label>
                <Input
                  id={`filter-${column}`}
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={columnFilters[column] || ''}
                  onChange={(e) => onFilter(column, e.target.value)}
                  className="mt-1"
                />
              </div>
              {hasActiveFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onClearFilter(column)}
                  className="w-full"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </th>
  );
}

// View Tab Components
function ViewAllProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/inventory"],
    refetchInterval: 30000
  });

  // Helper function to get column values for sorting and filtering
  const getColumnValue = (item: any, column: string) => {
    switch (column) {
      case 'product':
        return item.sku + ' ' + item.productName;
      case 'category':
        return item.category || '';
      case 'available':
        return item.availableQty || 0;
      case 'reserved':
        return item.reservedQty || 0;
      case 'onHand':
        return item.onHandQty || 0;
      case 'status':
        return item.status || '';
      default:
        return '';
    }
  };

  const filteredInventory = React.useMemo(() => {
    if (!inventory) return [];

    let items = inventory.filter((item: any) => {
      const matchesSearch = searchTerm === "" || 
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.productName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      
      // Apply column filters
      const matchesColumnFilters = Object.entries(columnFilters).every(([column, filterValue]) => {
        if (!filterValue) return true;
        const itemValue = getColumnValue(item, column).toString().toLowerCase();
        return itemValue.includes(filterValue.toLowerCase());
      });
      
      return matchesSearch && matchesCategory && matchesColumnFilters;
    });

    // Apply sorting
    if (sortConfig.key && sortConfig.direction) {
      items.sort((a, b) => {
        const aValue = getColumnValue(a, sortConfig.key);
        const bValue = getColumnValue(b, sortConfig.key);
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return items;
  }, [inventory, searchTerm, categoryFilter, columnFilters, sortConfig]);

  const categories = [...new Set(inventory?.map((item: any) => item.category).filter(Boolean))] || [];

  // Handle column sorting
  const handleSort = (column: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === column && sortConfig.direction === 'desc') {
      direction = null;
    }
    
    setSortConfig({ key: column, direction });
  };

  // Handle column filtering
  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Clear filter for a specific column
  const clearColumnFilter = (column: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setEditDrawerOpen(true);
  };



  // Check if any filters are active
  const hasActiveFilters = Object.keys(columnFilters).some(key => columnFilters[key]);
  const hasActiveSort = sortConfig.key && sortConfig.direction;

  return (
    <div className="space-y-6">
      {/* Active Filters Display */}
      {(hasActiveFilters || hasActiveSort) && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h4 className="text-sm font-medium text-gray-700">Active Filters & Sort:</h4>
                <div className="flex items-center space-x-2">
                  {hasActiveSort && (
                    <Badge variant="outline" className="text-xs">
                      Sort: {sortConfig.key} {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </Badge>
                  )}
                  {Object.entries(columnFilters).map(([column, value]) => (
                    value && (
                      <Badge key={column} variant="outline" className="text-xs">
                        {column}: "{value}"
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => clearColumnFilter(column)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    )
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setColumnFilters({});
                  setSortConfig({ key: '', direction: null });
                }}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                    <SortableColumnHeader 
                      column="product" 
                      label="Product" 
                      className="text-left"
                      sortConfig={sortConfig}
                      columnFilters={columnFilters}
                      onSort={handleSort}
                      onFilter={handleColumnFilter}
                      onClearFilter={clearColumnFilter}
                    />
                    <SortableColumnHeader 
                      column="category" 
                      label="Category" 
                      className="text-center"
                      sortConfig={sortConfig}
                      columnFilters={columnFilters}
                      onSort={handleSort}
                      onFilter={handleColumnFilter}
                      onClearFilter={clearColumnFilter}
                    />
                    <SortableColumnHeader 
                      column="available" 
                      label="Available" 
                      className="text-center"
                      sortConfig={sortConfig}
                      columnFilters={columnFilters}
                      onSort={handleSort}
                      onFilter={handleColumnFilter}
                      onClearFilter={clearColumnFilter}
                    />
                    <SortableColumnHeader 
                      column="reserved" 
                      label="Reserved" 
                      className="text-center"
                      sortConfig={sortConfig}
                      columnFilters={columnFilters}
                      onSort={handleSort}
                      onFilter={handleColumnFilter}
                      onClearFilter={clearColumnFilter}
                    />
                    <SortableColumnHeader 
                      column="onHand" 
                      label="On Hand" 
                      className="text-center"
                      sortConfig={sortConfig}
                      columnFilters={columnFilters}
                      onSort={handleSort}
                      onFilter={handleColumnFilter}
                      onClearFilter={clearColumnFilter}
                    />
                    <SortableColumnHeader 
                      column="status" 
                      label="Status" 
                      className="text-center"
                      sortConfig={sortConfig}
                      columnFilters={columnFilters}
                      onSort={handleSort}
                      onFilter={handleColumnFilter}
                      onClearFilter={clearColumnFilter}
                    />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item: any) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleProductClick(item)}
                    >
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

      {/* Product Edit Drawer */}
      <ProductEditDrawer 
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        product={selectedProduct}
      />
    </div>
  );
}

// Product Edit Drawer Component
function ProductEditDrawer({ open, onOpenChange, product }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: any;
}) {
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    barcode: "",
    sku: "",
    description: "",
    status: "active",
    weight: "",
    dimensions: ""
  });

  const queryClient = useQueryClient();

  // Initialize form data when product changes
  React.useEffect(() => {
    if (product) {
      setFormData({
        productName: product.productName || "",
        category: product.category || "",
        barcode: product.barcode || "",
        sku: product.sku || "",
        description: product.description || "",
        status: product.status || "active",
        weight: product.weight || "",
        dimensions: product.dimensions || ""
      });
    }
  }, [product]);

  const updateProductMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/inventory/${product?.id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      onOpenChange(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (product) {
      updateProductMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (product) {
      setFormData({
        productName: product.productName || "",
        category: product.category || "",
        barcode: product.barcode || "",
        sku: product.sku || "",
        description: product.description || "",
        status: product.status || "active",
        weight: product.weight || "",
        dimensions: product.dimensions || ""
      });
    }
    onOpenChange(false);
  };

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "low_stock", label: "Low Stock" },
    { value: "out_of_stock", label: "Out of Stock" },
    { value: "discontinued", label: "Discontinued" }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle>Edit Product</SheetTitle>
          <SheetDescription>
            Update product information and inventory details
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Product Name *</Label>
              <Input
                id="productName"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="Enter product name..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU Code *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="Enter SKU..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Enter category..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Enter barcode..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Inventory Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="Enter weight..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter product description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensions (L x W x H)</Label>
            <Input
              id="dimensions"
              value={formData.dimensions}
              onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
              placeholder="e.g., 10 x 5 x 2 cm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="saylogix-primary"
              disabled={updateProductMutation.isPending}
            >
              {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
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

  const { data: adjustments } = useQuery({
    queryKey: ["/api/inventory/adjustments"],
  });

  const totalItems = inventory?.length || 0;
  const lowStockItems = inventory?.filter((item: any) => item.availableQty <= item.reorderLevel).length || 0;
  const totalValue = inventory?.reduce((sum: number, item: any) => sum + (item.availableQty * 25), 0) || 0;
  const activeAdjustments = adjustments?.filter((adj: any) => adj.status === 'pending').length || 0;

  return (
    <div className="space-y-6">
      

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
                <p className="text-3xl font-bold text-amber-600">{activeAdjustments}</p>
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
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all-products">All Products</TabsTrigger>
                <TabsTrigger value="stock-on-hand">Stock on Hand</TabsTrigger>
              </TabsList>
              
              {/* Contextual Action Button */}
              <InventoryActionsMenu />
            </div>
            
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