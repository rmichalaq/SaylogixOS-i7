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

interface InboundShipment {
  id: number;
  referenceNumber: string;
  supplier: string;
  status: string;
  expectedDate: string;
  receivedDate?: string;
  dockNumber?: string;
  gateNumber?: string;
  totalItems: number;
  receivedItems: number;
  qcStatus?: string;
  grnNumber?: string;
  createdAt: string;
}

interface InboundItem {
  id: number;
  sku: string;
  productName: string;
  expectedQuantity: number;
  receivedQuantity: number;
  qcStatus: string;
  binLocation?: string;
}

export default function Inbound() {
  const [activeTab, setActiveTab] = useState("shipments");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<InboundShipment | null>(null);

  const { data: inboundShipments = [], isLoading } = useQuery({
    queryKey: ["/api/inbound/shipments", { status: statusFilter }],
    refetchInterval: 30000,
  });

  const { data: inboundItems = [] } = useQuery({
    queryKey: ["/api/inbound/items", selectedShipment?.id],
    enabled: !!selectedShipment,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "announced":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "arrived":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "unloading":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "qc_in_progress":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "qc_completed":
        return "bg-success-100 text-success-800 border-success-200";
      case "completed":
        return "bg-success-100 text-success-800 border-success-200";
      case "exception":
        return "bg-error-100 text-error-800 border-error-200";
      default:
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
    }
  };

  const getQCStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-success-100 text-success-800 border-success-200";
      case "failed":
        return "bg-error-100 text-error-800 border-error-200";
      case "pending":
        return "bg-warning-100 text-warning-800 border-warning-200";
      default:
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
    }
  };

  const handleStartUnloading = async (shipmentId: number) => {
    try {
      // TODO: Implement start unloading API call
      console.log("Starting unloading for shipment:", shipmentId);
    } catch (error) {
      console.error("Start unloading error:", error);
    }
  };

  const handleCompleteQC = async (shipmentId: number) => {
    try {
      // TODO: Implement complete QC API call
      console.log("Completing QC for shipment:", shipmentId);
    } catch (error) {
      console.error("Complete QC error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-secondary-500">Loading inbound shipments...</p>
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
              <i className="fas fa-arrow-down text-primary-500"></i>
              <span>Inbound Management</span>
            </div>
            <Button>
              <i className="fas fa-plus mr-2"></i>
              Create Shipment
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="shipments">
            <i className="fas fa-truck mr-2"></i>
            Shipments
          </TabsTrigger>
          <TabsTrigger value="receiving">
            <i className="fas fa-clipboard-list mr-2"></i>
            Receiving
          </TabsTrigger>
          <TabsTrigger value="putaway">
            <i className="fas fa-arrows-alt mr-2"></i>
            Putaway
          </TabsTrigger>
        </TabsList>

        {/* Shipments Tab */}
        <TabsContent value="shipments" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="announced">Announced</SelectItem>
                    <SelectItem value="arrived">Arrived</SelectItem>
                    <SelectItem value="unloading">Unloading</SelectItem>
                    <SelectItem value="qc_in_progress">QC In Progress</SelectItem>
                    <SelectItem value="qc_completed">QC Completed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="exception">Exception</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setStatusFilter("")}>
                  <i className="fas fa-undo mr-2"></i>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Shipments Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inbound Shipments ({inboundShipments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {inboundShipments.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-truck text-4xl text-secondary-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-secondary-900 mb-2">No Inbound Shipments</h3>
                  <p className="text-secondary-500">
                    {statusFilter 
                      ? "No shipments match the selected status filter"
                      : "No inbound shipments have been created yet"
                    }
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shipment Details</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inboundShipments.map((shipment: InboundShipment) => (
                      <TableRow 
                        key={shipment.id}
                        className={selectedShipment?.id === shipment.id ? "bg-primary-50" : ""}
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium text-secondary-900">
                              {shipment.referenceNumber}
                            </div>
                            {shipment.grnNumber && (
                              <div className="text-sm text-secondary-500">
                                GRN: {shipment.grnNumber}
                              </div>
                            )}
                            <div className="text-xs text-secondary-400">
                              Created: {new Date(shipment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="text-sm text-secondary-900">
                            {shipment.supplier}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <div className="text-sm text-secondary-900">
                              Expected: {new Date(shipment.expectedDate).toLocaleDateString()}
                            </div>
                            {shipment.receivedDate && (
                              <div className="text-sm text-success-600">
                                Received: {new Date(shipment.receivedDate).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <div className="text-sm text-secondary-900">
                              {shipment.receivedItems} / {shipment.totalItems} items
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-primary-500 h-2 rounded-full"
                                style={{ 
                                  width: `${(shipment.receivedItems / shipment.totalItems) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            {shipment.dockNumber && (
                              <div className="text-sm text-secondary-900">
                                Dock: {shipment.dockNumber}
                              </div>
                            )}
                            {shipment.gateNumber && (
                              <div className="text-xs text-secondary-500">
                                Gate: {shipment.gateNumber}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className={getStatusColor(shipment.status)}>
                            {shipment.status.replace('_', ' ')}
                          </Badge>
                          {shipment.qcStatus && (
                            <Badge className={`${getQCStatusColor(shipment.qcStatus)} mt-1`}>
                              QC: {shipment.qcStatus}
                            </Badge>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedShipment(shipment)}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            {shipment.status === "arrived" && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleStartUnloading(shipment.id)}
                              >
                                <i className="fas fa-play"></i>
                              </Button>
                            )}
                            {shipment.status === "qc_in_progress" && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleCompleteQC(shipment.id)}
                              >
                                <i className="fas fa-check"></i>
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

          {/* Shipment Details */}
          {selectedShipment && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Shipment Details: {selectedShipment.referenceNumber}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inboundItems.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-box text-4xl text-secondary-300 mb-4"></i>
                    <p className="text-secondary-500">Loading shipment items...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Expected Qty</TableHead>
                        <TableHead>Received Qty</TableHead>
                        <TableHead>QC Status</TableHead>
                        <TableHead>Bin Location</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inboundItems.map((item: InboundItem) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-secondary-900">
                                {item.sku}
                              </div>
                              <div className="text-sm text-secondary-500">
                                {item.productName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.expectedQuantity}</TableCell>
                          <TableCell>
                            <span className={
                              item.receivedQuantity === item.expectedQuantity 
                                ? "text-success-600 font-medium" 
                                : "text-warning-600 font-medium"
                            }>
                              {item.receivedQuantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getQCStatusColor(item.qcStatus)}>
                              {item.qcStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {item.binLocation || (
                              <span className="text-secondary-400 text-sm">Pending</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Receiving Tab */}
        <TabsContent value="receiving" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receiving Workstation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <i className="fas fa-clipboard-list text-4xl text-secondary-300 mb-4"></i>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">Receiving Interface</h3>
                <p className="text-secondary-500 mb-4">
                  Scan and receive incoming items
                </p>
                <Button>
                  <i className="fas fa-qrcode mr-2"></i>
                  Start Receiving
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Putaway Tab */}
        <TabsContent value="putaway" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Putaway Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <i className="fas fa-arrows-alt text-4xl text-secondary-300 mb-4"></i>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">Putaway Management</h3>
                <p className="text-secondary-500">
                  Manage items movement to storage locations
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
