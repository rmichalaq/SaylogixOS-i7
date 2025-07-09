import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Truck, 
  ClipboardList, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Plus,
  FileText,
  Building,
  ShoppingCart
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplier: string;
  eta: string;
  status: 'pending' | 'asn_received' | 'gate_entry' | 'unloaded';
  asnReceived: boolean;
  gateEntry: boolean;
  unloaded: boolean;
  dockAssignment?: string;
  items: POItem[];
}

interface POItem {
  id: number;
  sku: string;
  description: string;
  expectedQuantity: number;
  receivedQuantity?: number;
}

interface GRN {
  id: number;
  grnNumber: string;
  poNumber: string;
  supplier: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
  items: GRNItem[];
}

interface GRNItem {
  id: number;
  sku: string;
  description: string;
  expectedQuantity: number;
  receivedQuantity: number;
  discrepancy?: string;
}

interface PutawayTask {
  id: number;
  grnNumber: string;
  status: 'staged' | 'in_process' | 'completed';
  assignedTo?: string;
  items: PutawayItem[];
  createdAt: string;
}

interface PutawayItem {
  id: number;
  sku: string;
  description: string;
  quantity: number;
  binLocation?: string;
  scanStatus: 'pending' | 'scanned' | 'placed';
}

export default function Inbound() {
  const [activeTab, setActiveTab] = useState('purchase-orders');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isPODrawerOpen, setIsPODrawerOpen] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);
  const [selectedPutaway, setSelectedPutaway] = useState<PutawayTask | null>(null);
  const [asnNumbers, setAsnNumbers] = useState<string[]>(['']);
  const [dockAssignment, setDockAssignment] = useState('');
  const [unloadingComments, setUnloadingComments] = useState('');
  const [grnFilter, setGrnFilter] = useState('pending');
  const [putawayFilter, setPutawayFilter] = useState('staged');
  
  const queryClient = useQueryClient();

  // Fetch Purchase Orders
  const { data: purchaseOrders, isLoading: poLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ['/api/inbound/purchase-orders'],
    refetchInterval: 5000,
  });

  // Fetch GRNs
  const { data: grns, isLoading: grnLoading } = useQuery<GRN[]>({
    queryKey: ['/api/inbound/grns'],
    refetchInterval: 5000,
  });

  // Fetch Putaway Tasks
  const { data: putawayTasks, isLoading: putawayLoading } = useQuery<PutawayTask[]>({
    queryKey: ['/api/inbound/putaway'],
    refetchInterval: 5000,
  });

  // Mutations
  const updatePOMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<PurchaseOrder> }) =>
      apiRequest(`/api/inbound/purchase-orders/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/grns'] });
    },
  });

  const updateGRNMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<GRN> }) =>
      apiRequest(`/api/inbound/grns/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/grns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/putaway'] });
    },
  });

  const updatePutawayMutation = useMutation({
    mutationFn: (data: { id: number; updates: Partial<PutawayTask> }) =>
      apiRequest(`/api/inbound/putaway/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inbound/putaway'] });
    },
  });

  // Handle PO Actions
  const handleASNSave = () => {
    if (!selectedPO) return;
    const validASNs = asnNumbers.filter(asn => asn.trim());
    updatePOMutation.mutate({
      id: selectedPO.id,
      updates: { asnReceived: true, asnNumbers: validASNs }
    });
  };

  const handleGateEntry = (checked: boolean) => {
    if (!selectedPO) return;
    updatePOMutation.mutate({
      id: selectedPO.id,
      updates: { gateEntry: checked }
    });
  };

  const handleDockAssignment = () => {
    if (!selectedPO) return;
    updatePOMutation.mutate({
      id: selectedPO.id,
      updates: { dockAssignment }
    });
  };

  const handleUnloadingConfirmation = (checked: boolean) => {
    if (!selectedPO) return;
    updatePOMutation.mutate({
      id: selectedPO.id,
      updates: { 
        unloaded: checked,
        unloadingComments: checked ? unloadingComments : undefined
      }
    });
  };

  const addASNField = () => {
    setAsnNumbers([...asnNumbers, '']);
  };

  const updateASNField = (index: number, value: string) => {
    const newASNs = [...asnNumbers];
    newASNs[index] = value;
    setAsnNumbers(newASNs);
  };

  const removeASNField = (index: number) => {
    if (asnNumbers.length > 1) {
      setAsnNumbers(asnNumbers.filter((_, i) => i !== index));
    }
  };

  const getStatusBadge = (po: PurchaseOrder) => {
    if (po.unloaded) return <Badge className="bg-green-100 text-green-800">Unloaded ✅</Badge>;
    if (po.gateEntry) return <Badge className="bg-blue-100 text-blue-800">Gate Entry ⏳</Badge>;
    if (po.asnReceived) return <Badge className="bg-yellow-100 text-yellow-800">ASN ✅</Badge>;
    return <Badge variant="outline">Pending</Badge>;
  };

  const filteredGRNs = grns?.filter(grn => grn.status === grnFilter) || [];
  const filteredPutaways = putawayTasks?.filter(task => task.status === putawayFilter) || [];
  
  // Filter out POs that have reached GRN stage unless explicitly showing all
  const filteredPurchaseOrders = purchaseOrders?.filter(po => !po.unloaded) || [];

  const handlePOClick = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsPODrawerOpen(true);
    // Reset form states
    setAsnNumbers(['']);
    setDockAssignment('');
    setUnloadingComments('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Inbound Processing</h1>
        <p className="text-gray-600">
          Manage purchase orders, goods receipt notes, and putaway operations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="purchase-orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="grn" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            GRN
          </TabsTrigger>
          <TabsTrigger value="putaway" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Putaway
          </TabsTrigger>
        </TabsList>

        {/* Purchase Orders Tab */}
        <TabsContent value="purchase-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Purchase Orders Pending Processing
              </CardTitle>
              <CardDescription>
                Manage incoming shipments through the complete inbound flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {poLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>ETA</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchaseOrders.map((po) => (
                      <TableRow key={po.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell 
                          className="font-medium text-blue-600 hover:text-blue-800"
                          onClick={() => handlePOClick(po)}
                        >
                          {po.poNumber}
                        </TableCell>
                        <TableCell>{po.supplier}</TableCell>
                        <TableCell>{new Date(po.eta).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(po)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GRN Tab */}
        <TabsContent value="grn" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={grnFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setGrnFilter('pending')}
            >
              Pending
            </Button>
            <Button
              variant={grnFilter === 'processing' ? 'default' : 'outline'}
              onClick={() => setGrnFilter('processing')}
            >
              Processing
            </Button>
            <Button
              variant={grnFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setGrnFilter('completed')}
            >
              Completed
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Goods Receipt Notes - {grnFilter.charAt(0).toUpperCase() + grnFilter.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {grnLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredGRNs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {grnFilter} GRNs found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GRN Number</TableHead>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGRNs.map((grn) => (
                      <TableRow key={grn.id}>
                        <TableCell className="font-medium">{grn.grnNumber}</TableCell>
                        <TableCell>{grn.poNumber}</TableCell>
                        <TableCell>{grn.supplier}</TableCell>
                        <TableCell>{new Date(grn.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => setSelectedGRN(grn)}
                            variant="outline"
                          >
                            {grn.status === 'pending' ? 'Start' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Putaway Tab */}
        <TabsContent value="putaway" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={putawayFilter === 'staged' ? 'default' : 'outline'}
              onClick={() => setPutawayFilter('staged')}
            >
              Staged
            </Button>
            <Button
              variant={putawayFilter === 'in_process' ? 'default' : 'outline'}
              onClick={() => setPutawayFilter('in_process')}
            >
              In Process
            </Button>
            <Button
              variant={putawayFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setPutawayFilter('completed')}
            >
              Completed
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Putaway Tasks - {putawayFilter.charAt(0).toUpperCase() + putawayFilter.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {putawayLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredPutaways.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No {putawayFilter} putaway tasks found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>GRN Number</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPutaways.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">{task.grnNumber}</TableCell>
                        <TableCell>{task.assignedTo || 'Unassigned'}</TableCell>
                        <TableCell>{task.items.length} items</TableCell>
                        <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => setSelectedPutaway(task)}
                            variant="outline"
                          >
                            {task.status === 'staged' ? 'Start' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PO Detail Drawer */}
      <Sheet open={isPODrawerOpen} onOpenChange={setIsPODrawerOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Process PO - {selectedPO?.poNumber}</SheetTitle>
          </SheetHeader>

          {selectedPO && (
            <div className="mt-6 space-y-6">
              {/* PO Details Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-3">Purchase Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">PO Number:</span>
                    <p className="mt-1">{selectedPO.poNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Supplier:</span>
                    <p className="mt-1">{selectedPO.supplier}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">ETA:</span>
                    <p className="mt-1">{new Date(selectedPO.eta).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedPO)}</div>
                  </div>
                  {selectedPO.dockAssignment && (
                    <div>
                      <span className="font-medium text-gray-600">Dock Assignment:</span>
                      <p className="mt-1">{selectedPO.dockAssignment}</p>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Process Actions */}
              {/* ASN Panel */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <h4 className="font-medium">ASN (Advanced Shipping Notice)</h4>
                  {selectedPO.asnReceived && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
                {!selectedPO.asnReceived ? (
                  <div className="space-y-2">
                    {asnNumbers.map((asn, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="Enter Airway Bill Number"
                          value={asn}
                          onChange={(e) => updateASNField(index, e.target.value)}
                        />
                        {index === asnNumbers.length - 1 && (
                          <Button size="sm" variant="outline" onClick={addASNField}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        {asnNumbers.length > 1 && (
                          <Button size="sm" variant="outline" onClick={() => removeASNField(index)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button onClick={handleASNSave} disabled={updatePOMutation.isPending}>
                      Save ASN
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-green-600">ASN received and logged</div>
                )}
              </div>

              <Separator />

              {/* Gate Entry */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  <h4 className="font-medium">Gate Entry</h4>
                  {selectedPO.gateEntry && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="gate-entry"
                    checked={selectedPO.gateEntry}
                    onCheckedChange={handleGateEntry}
                    disabled={selectedPO.gateEntry}
                  />
                  <label htmlFor="gate-entry" className="text-sm">
                    Mark arrival at gate
                  </label>
                </div>
              </div>

              <Separator />

              {/* Dock Assignment */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <h4 className="font-medium">Dock Assignment (Optional)</h4>
                </div>
                <div className="flex gap-2">
                  <Select value={dockAssignment} onValueChange={setDockAssignment}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select dock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dock-a">Dock A</SelectItem>
                      <SelectItem value="dock-b">Dock B</SelectItem>
                      <SelectItem value="dock-c">Dock C</SelectItem>
                      <SelectItem value="dock-d">Dock D</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleDockAssignment} variant="outline">
                    Assign
                  </Button>
                  <Button variant="outline">Skip</Button>
                </div>
                {selectedPO.dockAssignment && (
                  <div className="text-sm text-green-600">
                    Assigned to: {selectedPO.dockAssignment}
                  </div>
                )}
              </div>

              <Separator />

              {/* Unloading Confirmation */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  <h4 className="font-medium">Unloading Confirmation</h4>
                  {selectedPO.unloaded && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
                {!selectedPO.unloaded ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Optional comments (pass/fail visual check)"
                      value={unloadingComments}
                      onChange={(e) => setUnloadingComments(e.target.value)}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="unloading"
                        onCheckedChange={handleUnloadingConfirmation}
                      />
                      <label htmlFor="unloading" className="text-sm">
                        Confirm unloading completed
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-green-600">
                      Unloading confirmed - Ready for GRN
                    </div>
                    <Button 
                      onClick={() => {
                        // Move to GRN - This would trigger GRN creation
                        setIsPODrawerOpen(false);
                        setSelectedPO(null);
                      }}
                      className="w-full"
                    >
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Move to GRN
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* GRN Detail Dialog */}
      <Dialog open={!!selectedGRN} onOpenChange={() => setSelectedGRN(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>GRN Details - {selectedGRN?.grnNumber}</DialogTitle>
            <DialogDescription>
              Scan and confirm quantities, log any discrepancies
            </DialogDescription>
          </DialogHeader>

          {selectedGRN && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>PO Number:</strong> {selectedGRN.poNumber}
                </div>
                <div>
                  <strong>Supplier:</strong> {selectedGRN.supplier}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Discrepancy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedGRN.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.sku}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.expectedQuantity}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          defaultValue={item.receivedQuantity}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Notes"
                          defaultValue={item.discrepancy}
                          className="w-32"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedGRN(null)}>
              Cancel
            </Button>
            <Button>Save & Complete GRN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Putaway Detail Dialog */}
      <Dialog open={!!selectedPutaway} onOpenChange={() => setSelectedPutaway(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Putaway Task - {selectedPutaway?.grnNumber}</DialogTitle>
            <DialogDescription>
              Scan cart and confirm bin placements
            </DialogDescription>
          </DialogHeader>

          {selectedPutaway && (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Bin Location</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedPutaway.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.sku}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <Input
                          placeholder="Scan bin location"
                          defaultValue={item.binLocation}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          item.scanStatus === 'placed' ? 'default' :
                          item.scanStatus === 'scanned' ? 'secondary' : 'outline'
                        }>
                          {item.scanStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPutaway(null)}>
              Cancel
            </Button>
            <Button>Complete Putaway</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}