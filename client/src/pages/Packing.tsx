import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Package, Printer, QrCode, AlertCircle, CheckCircle, Clock, Box, Search } from "lucide-react";

interface Order {
  id: number;
  saylogixNumber: string;
  sourceOrderNumber: string;
  customerName: string;
  priority: string;
  orderValue: string;
  currency: string;
  status: string;
  itemCount: number;
  createdAt: string;
}

interface PackTask {
  id: number;
  orderId: number;
  toteId?: string;
  status: string;
  awbNumber?: string;
  weight?: number;
  packagingType?: string;
  completedAt?: string;
  completedBy?: number;
  createdAt: string;
}

interface OrderItem {
  id: number;
  orderId: number;
  productName: string;
  sku: string;
  barcode?: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  scannedQuantity?: number;
}

export default function Packing() {
  const [activeTab, setActiveTab] = useState("queue");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [currentPackingOrder, setCurrentPackingOrder] = useState<Order | null>(null);
  const [scannedItems, setScannedItems] = useState<Record<string, number>>({});
  const [packagingType, setPackagingType] = useState("");
  const [weight, setWeight] = useState("");
  const scanInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders ready for packing (picked status)
  const { data: packingQueue = [] } = useQuery({
    queryKey: ["/api/orders", { status: "picked" }],
    queryFn: async () => {
      const response = await fetch("/api/orders?status=picked");
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch completed pack tasks
  const { data: completedPacks = [] } = useQuery({
    queryKey: ["/api/pack-tasks", { status: "completed" }],
    queryFn: async () => {
      const response = await fetch("/api/pack-tasks?status=completed");
      if (!response.ok) throw new Error("Failed to fetch pack tasks");
      return response.json();
    },
    refetchInterval: 30000,
  });

  // Fetch order items for current packing
  const { data: orderItems = [] } = useQuery({
    queryKey: ["/api/order-items", currentPackingOrder?.id],
    enabled: !!currentPackingOrder,
  });

  // Auto-focus scanner input
  useEffect(() => {
    if (activeTab === "scan" && scanInputRef.current) {
      scanInputRef.current.focus();
    }
  }, [activeTab, currentPackingOrder]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleScan = async (value: string) => {
    if (!value) return;

    try {
      // Check if it's a tote ID (starts with TOTE-)
      if (value.startsWith("TOTE-")) {
        // Fetch order assigned to this tote
        const response = await fetch(`/api/orders/by-tote/${value}`);
        if (response.ok) {
          const order = await response.json();
          setCurrentPackingOrder(order);
          setScannedItems({});
          toast({
            title: "Tote scanned",
            description: `Order ${order.saylogixNumber} loaded for packing`,
          });
        } else {
          toast({
            title: "Tote not found",
            description: "No order assigned to this tote",
            variant: "destructive",
          });
        }
      } else {
        // It's a SKU barcode
        if (!currentPackingOrder) {
          // Find oldest unpacked order with this SKU
          const response = await fetch(`/api/orders/by-sku/${value}?status=picked`);
          if (response.ok) {
            const order = await response.json();
            setCurrentPackingOrder(order);
            setScannedItems({ [value]: 1 });
            toast({
              title: "Order found",
              description: `Starting to pack order ${order.saylogixNumber}`,
            });
          } else {
            toast({
              title: "No orders found",
              description: "No unpacked orders contain this SKU",
              variant: "destructive",
            });
          }
        } else {
          // Add to scanned items
          const newScannedItems = { ...scannedItems };
          newScannedItems[value] = (newScannedItems[value] || 0) + 1;
          setScannedItems(newScannedItems);

          // Check if all items are scanned
          const allScanned = orderItems.every((item: OrderItem) => 
            newScannedItems[item.barcode || item.sku] >= item.quantity
          );

          if (allScanned) {
            await completePacking();
          }
        }
      }
    } catch (error) {
      toast({
        title: "Scan error",
        description: "Failed to process scan",
        variant: "destructive",
      });
    }

    setScanInput("");
  };

  const completePacking = async () => {
    if (!currentPackingOrder) return;

    try {
      // Create pack task and generate AWB
      const response = await apiRequest("/api/pack-tasks", {
        method: "POST",
        body: JSON.stringify({
          orderId: currentPackingOrder.id,
          status: "completed",
          packagingType: "standard",
          weight: 1.5, // Default weight
        }),
      });

      // Update order status
      await apiRequest(`/api/orders/${currentPackingOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "packed" }),
      });

      toast({
        title: "Packing completed",
        description: "AWB generated and label printed automatically",
      });

      // Reset for next order
      setCurrentPackingOrder(null);
      setScannedItems({});
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pack-tasks"] });

      // Auto-focus scanner input
      if (scanInputRef.current) {
        scanInputRef.current.focus();
      }
    } catch (error) {
      toast({
        title: "Packing failed",
        description: "Failed to complete packing",
        variant: "destructive",
      });
    }
  };

  const manualCompletePacking = async () => {
    if (!selectedOrder || !packagingType || !weight) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiRequest("/api/pack-tasks", {
        method: "POST",
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: "completed",
          packagingType,
          weight: parseFloat(weight),
        }),
      });

      await apiRequest(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "packed" }),
      });

      toast({
        title: "Packing completed",
        description: "Order packed and AWB generated",
      });

      setIsDrawerOpen(false);
      setSelectedOrder(null);
      setPackagingType("");
      setWeight("");
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pack-tasks"] });
    } catch (error) {
      toast({
        title: "Packing failed",
        description: "Failed to complete packing",
        variant: "destructive",
      });
    }
  };

  const reprintLabel = async (packTask: PackTask) => {
    try {
      await apiRequest(`/api/pack-tasks/${packTask.id}/reprint`, {
        method: "POST",
      });

      toast({
        title: "Label reprinted",
        description: `AWB ${packTask.awbNumber} sent to printer`,
      });
    } catch (error) {
      toast({
        title: "Reprint failed",
        description: "Failed to reprint label",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Packing</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="queue">Packing Queue</TabsTrigger>
          <TabsTrigger value="scan">Pack Orders</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        {/* Packing Queue Tab */}
        <TabsContent value="queue" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packingQueue.map((order: Order) => (
                    <TableRow
                      key={order.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDrawerOpen(true);
                      }}
                    >
                      <TableCell className="font-medium text-blue-600">
                        {order.saylogixNumber}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.itemCount}</TableCell>
                      <TableCell>
                        {parseFloat(order.orderValue).toFixed(2)} {order.currency}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {packingQueue.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders to pack</h3>
                  <p className="text-gray-500">All picked orders have been packed</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pack Orders (Auto-Scan) Tab */}
        <TabsContent value="scan" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Scanner Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-md mx-auto">
                <Label htmlFor="scan-input">Scan SKU Barcode or Tote ID</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    ref={scanInputRef}
                    id="scan-input"
                    placeholder="Waiting for scan..."
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleScan(scanInput);
                      }
                    }}
                    className="pl-10 text-lg"
                    autoFocus
                  />
                </div>
              </div>

              {currentPackingOrder && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Packing Order {currentPackingOrder.saylogixNumber}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Expected Items:</p>
                        <div className="space-y-2">
                          {orderItems.map((item: OrderItem) => {
                            const scannedQty = scannedItems[item.barcode || item.sku] || 0;
                            const isComplete = scannedQty >= item.quantity;
                            
                            return (
                              <div
                                key={item.id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${
                                  isComplete
                                    ? "bg-green-50 border-green-200"
                                    : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-sm text-gray-500">
                                    SKU: {item.sku} {item.barcode && `| Barcode: ${item.barcode}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${isComplete ? "text-green-600" : ""}`}>
                                    {scannedQty} / {item.quantity}
                                  </span>
                                  {isComplete && <CheckCircle className="h-5 w-5 text-green-600" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {!currentPackingOrder && (
                <div className="text-center py-12">
                  <Box className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to scan</h3>
                  <p className="text-gray-500">Scan a SKU barcode or Tote ID to start packing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed Tab */}
        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>AWB Number</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Packed At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedPacks.map((task: PackTask & { order: Order }) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium text-blue-600">
                        {task.order?.saylogixNumber}
                      </TableCell>
                      <TableCell>{task.order?.customerName}</TableCell>
                      <TableCell className="font-mono">
                        {task.awbNumber || "Generating..."}
                      </TableCell>
                      <TableCell>{task.weight} kg</TableCell>
                      <TableCell>
                        {task.completedAt
                          ? new Date(task.completedAt).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => reprintLabel(task)}
                          disabled={!task.awbNumber}
                        >
                          <Printer className="h-4 w-4 mr-2" />
                          Reprint
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {completedPacks.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No completed packs</h3>
                  <p className="text-gray-500">Packed orders will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Manual Packing Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Pack Order {selectedOrder?.saylogixNumber}</SheetTitle>
          </SheetHeader>

          {selectedOrder && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="packaging-type">Packaging Type</Label>
                  <Select value={packagingType} onValueChange={setPackagingType}>
                    <SelectTrigger id="packaging-type" className="mt-2">
                      <SelectValue placeholder="Select packaging type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small-box">Small Box</SelectItem>
                      <SelectItem value="medium-box">Medium Box</SelectItem>
                      <SelectItem value="large-box">Large Box</SelectItem>
                      <SelectItem value="envelope">Envelope</SelectItem>
                      <SelectItem value="custom">Custom Packaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="Enter weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={manualCompletePacking} className="flex-1">
                  Complete Packing
                </Button>
                <Button variant="outline" onClick={() => setIsDrawerOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}