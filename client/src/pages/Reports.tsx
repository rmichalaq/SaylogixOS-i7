import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Package,
  TrendingUp,
  Clock,
  Truck,
  Download,
  MoreVertical,
  ArrowUpDown,
  BarChart3,
  AlertTriangle,
  Undo,
  MapPin,
  ChevronRight
} from "lucide-react";

// Types
type SortConfig = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

type ColumnFilters = {
  [key: string]: string;
};

// Mock data interfaces
interface OperationReport {
  id: string;
  date: string;
  totalOrders: number;
  fulfilledOrders: number;
  fulfillmentRate: number;
  avgProcessingTime: string;
  peakHour: string;
  warehouseUtilization: number;
}

interface CourierReport {
  id: string;
  courierName: string;
  totalDeliveries: number;
  onTimeDeliveries: number;
  onTimeRate: number;
  avgDeliveryTime: string;
  customerRating: number;
  activeDrivers: number;
}

interface ReturnReport {
  id: string;
  orderNumber: string;
  customerName: string;
  returnDate: string;
  reason: string;
  status: string;
  refundAmount: number;
  processingDays: number;
}

interface AddressQualityReport {
  id: string;
  region: string;
  totalAddresses: number;
  verifiedAddresses: number;
  verificationRate: number;
  nasMatchRate: number;
  incompleteAddresses: number;
  avgVerificationTime: string;
}

interface ExceptionReport {
  id: string;
  orderId: string;
  type: string;
  description: string;
  occurredAt: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
  assignedTo: string;
}

// Mock data
const mockOperationReports: OperationReport[] = [
  {
    id: "MOCK_OPR_001",
    date: "2025-01-10",
    totalOrders: 156,
    fulfilledOrders: 148,
    fulfillmentRate: 94.9,
    avgProcessingTime: "2.3 hours",
    peakHour: "14:00-15:00",
    warehouseUtilization: 78
  },
  {
    id: "MOCK_OPR_002",
    date: "2025-01-09",
    totalOrders: 142,
    fulfilledOrders: 138,
    fulfillmentRate: 97.2,
    avgProcessingTime: "2.1 hours",
    peakHour: "13:00-14:00",
    warehouseUtilization: 72
  },
  {
    id: "MOCK_OPR_003",
    date: "2025-01-08",
    totalOrders: 168,
    fulfilledOrders: 155,
    fulfillmentRate: 92.3,
    avgProcessingTime: "2.5 hours",
    peakHour: "15:00-16:00",
    warehouseUtilization: 85
  }
];

const mockCourierReports: CourierReport[] = [
  {
    id: "MOCK_CPR_001",
    courierName: "MOCK_Courier_Alpha",
    totalDeliveries: 523,
    onTimeDeliveries: 498,
    onTimeRate: 95.2,
    avgDeliveryTime: "45 min",
    customerRating: 4.7,
    activeDrivers: 12
  },
  {
    id: "MOCK_CPR_002",
    courierName: "MOCK_Courier_Beta",
    totalDeliveries: 412,
    onTimeDeliveries: 385,
    onTimeRate: 93.4,
    avgDeliveryTime: "52 min",
    customerRating: 4.5,
    activeDrivers: 10
  },
  {
    id: "MOCK_CPR_003",
    courierName: "MOCK_Courier_Gamma",
    totalDeliveries: 389,
    onTimeDeliveries: 378,
    onTimeRate: 97.2,
    avgDeliveryTime: "38 min",
    customerRating: 4.8,
    activeDrivers: 8
  }
];

const mockReturnReports: ReturnReport[] = [
  {
    id: "MOCK_RET_001",
    orderNumber: "SL25-089",
    customerName: "Ahmed Ali",
    returnDate: "2025-01-10",
    reason: "Size doesn't fit",
    status: "processing",
    refundAmount: 299.99,
    processingDays: 2
  },
  {
    id: "MOCK_RET_002",
    orderNumber: "SL25-076",
    customerName: "Sarah Mohammed",
    returnDate: "2025-01-09",
    reason: "Damaged product",
    status: "approved",
    refundAmount: 189.50,
    processingDays: 1
  },
  {
    id: "MOCK_RET_003",
    orderNumber: "SL25-064",
    customerName: "Omar Hassan",
    returnDate: "2025-01-08",
    reason: "Wrong item",
    status: "completed",
    refundAmount: 450.00,
    processingDays: 3
  }
];

const mockAddressQualityReports: AddressQualityReport[] = [
  {
    id: "MOCK_AQR_001",
    region: "Riyadh Central",
    totalAddresses: 1523,
    verifiedAddresses: 1489,
    verificationRate: 97.8,
    nasMatchRate: 94.2,
    incompleteAddresses: 34,
    avgVerificationTime: "1.2 sec"
  },
  {
    id: "MOCK_AQR_002",
    region: "Riyadh North",
    totalAddresses: 987,
    verifiedAddresses: 945,
    verificationRate: 95.7,
    nasMatchRate: 91.8,
    incompleteAddresses: 42,
    avgVerificationTime: "1.4 sec"
  },
  {
    id: "MOCK_AQR_003",
    region: "Riyadh East",
    totalAddresses: 1156,
    verifiedAddresses: 1098,
    verificationRate: 95.0,
    nasMatchRate: 93.5,
    incompleteAddresses: 58,
    avgVerificationTime: "1.3 sec"
  }
];

const mockExceptionReports: ExceptionReport[] = [
  {
    id: "MOCK_EXC_001",
    orderId: "SL25-095",
    type: "Address Verification Failed",
    description: "NAS code not found in database",
    occurredAt: "2025-01-10 14:32",
    severity: "medium",
    status: "open",
    assignedTo: "Support Team"
  },
  {
    id: "MOCK_EXC_002",
    orderId: "SL25-092",
    type: "Payment Processing Error",
    description: "Card declined by issuer",
    occurredAt: "2025-01-10 13:15",
    severity: "high",
    status: "resolved",
    assignedTo: "Finance Team"
  },
  {
    id: "MOCK_EXC_003",
    orderId: "SL25-088",
    type: "Inventory Mismatch",
    description: "SKU ELEC-001 out of stock",
    occurredAt: "2025-01-10 11:45",
    severity: "low",
    status: "open",
    assignedTo: "Warehouse Team"
  }
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState("operations");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "", direction: null });
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({});

  const handleSort = (column: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';
    
    if (sortConfig.key === column && sortConfig.direction === 'asc') {
      direction = 'desc';
    } else if (sortConfig.key === column && sortConfig.direction === 'desc') {
      direction = null;
    }
    
    setSortConfig({ key: column, direction });
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead className="cursor-pointer group">
      <div className="flex items-center space-x-2">
        <span onClick={() => handleSort(field)} className="select-none">
          {children}
        </span>
        <div className="flex flex-col items-center">
          <button
            onClick={() => handleSort(field)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowUpDown className="h-3 w-3" />
          </button>
          {sortConfig.key === field && (
            <span className="text-xs text-blue-600 font-medium">
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </span>
          )}
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <button className="text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100">
              <MoreVertical className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium">Filter {children}</p>
              <input
                type="text"
                placeholder={`Filter by ${children}...`}
                className="w-full px-2 py-1 text-sm border rounded"
                onChange={(e) => {
                  if (e.target.value) {
                    setColumnFilters(prev => ({ ...prev, [field]: e.target.value }));
                  } else {
                    setColumnFilters(prev => {
                      const newFilters = { ...prev };
                      delete newFilters[field];
                      return newFilters;
                    });
                  }
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </TableHead>
  );

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <nav className="text-sm text-gray-500 mt-1">
          Home <ChevronRight className="inline h-3 w-3 mx-1" /> Reports
        </nav>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">466</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium mr-1">↗</span>
              +12.5% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Fulfillment Rate</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">94.8%</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium mr-1">↗</span>
              +2.1% improvement
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Processing</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">2.3h</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium mr-1">↘</span>
              -15 min faster
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">On-Time Delivery</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Truck className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">95.3%</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium mr-1">↗</span>
              +1.3% increase
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-5 w-auto">
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="courier">Courier Performance</TabsTrigger>
            <TabsTrigger value="returns">Returns</TabsTrigger>
            <TabsTrigger value="address">Address Quality</TabsTrigger>
            <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Active Filters */}
        {Object.keys(columnFilters).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(columnFilters).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                {key}: {value}
                <button
                  onClick={() => {
                    setColumnFilters(prev => {
                      const newFilters = { ...prev };
                      delete newFilters[key];
                      return newFilters;
                    });
                  }}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Operations Tab */}
        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Daily Operations Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="date">Date</SortableHeader>
                    <SortableHeader field="totalOrders">Total Orders</SortableHeader>
                    <SortableHeader field="fulfilledOrders">Fulfilled</SortableHeader>
                    <SortableHeader field="fulfillmentRate">Rate</SortableHeader>
                    <SortableHeader field="avgProcessingTime">Avg Time</SortableHeader>
                    <SortableHeader field="peakHour">Peak Hour</SortableHeader>
                    <SortableHeader field="warehouseUtilization">Utilization</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOperationReports.map((report) => (
                    <TableRow key={report.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell>{report.date}</TableCell>
                      <TableCell>{report.totalOrders}</TableCell>
                      <TableCell>{report.fulfilledOrders}</TableCell>
                      <TableCell>
                        <Badge variant={report.fulfillmentRate >= 95 ? "success" : "warning"}>
                          {report.fulfillmentRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>{report.avgProcessingTime}</TableCell>
                      <TableCell>{report.peakHour}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${report.warehouseUtilization}%` }}
                            />
                          </div>
                          <span className="text-sm">{report.warehouseUtilization}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courier Performance Tab */}
        <TabsContent value="courier">
          <Card>
            <CardHeader>
              <CardTitle>Courier Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="courierName">Courier</SortableHeader>
                    <SortableHeader field="totalDeliveries">Deliveries</SortableHeader>
                    <SortableHeader field="onTimeRate">On-Time Rate</SortableHeader>
                    <SortableHeader field="avgDeliveryTime">Avg Time</SortableHeader>
                    <SortableHeader field="customerRating">Rating</SortableHeader>
                    <SortableHeader field="activeDrivers">Drivers</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCourierReports.map((report) => (
                    <TableRow key={report.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">{report.courierName}</TableCell>
                      <TableCell>{report.totalDeliveries}</TableCell>
                      <TableCell>
                        <Badge variant={report.onTimeRate >= 95 ? "success" : "warning"}>
                          {report.onTimeRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>{report.avgDeliveryTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>⭐</span>
                          <span>{report.customerRating}</span>
                        </div>
                      </TableCell>
                      <TableCell>{report.activeDrivers}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Returns Tab */}
        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle>Return Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="orderNumber">Order #</SortableHeader>
                    <SortableHeader field="customerName">Customer</SortableHeader>
                    <SortableHeader field="returnDate">Return Date</SortableHeader>
                    <SortableHeader field="reason">Reason</SortableHeader>
                    <SortableHeader field="refundAmount">Amount</SortableHeader>
                    <SortableHeader field="status">Status</SortableHeader>
                    <SortableHeader field="processingDays">Days</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReturnReports.map((report) => (
                    <TableRow 
                      key={report.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedReport(report)}
                    >
                      <TableCell className="font-medium text-blue-600">{report.orderNumber}</TableCell>
                      <TableCell>{report.customerName}</TableCell>
                      <TableCell>{report.returnDate}</TableCell>
                      <TableCell>{report.reason}</TableCell>
                      <TableCell>SAR {report.refundAmount}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            report.status === 'completed' ? 'success' : 
                            report.status === 'approved' ? 'default' : 
                            'secondary'
                          }
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.processingDays}d</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Quality Tab */}
        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle>Address Quality by Region</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="region">Region</SortableHeader>
                    <SortableHeader field="totalAddresses">Total</SortableHeader>
                    <SortableHeader field="verifiedAddresses">Verified</SortableHeader>
                    <SortableHeader field="verificationRate">Rate</SortableHeader>
                    <SortableHeader field="nasMatchRate">NAS Match</SortableHeader>
                    <SortableHeader field="incompleteAddresses">Incomplete</SortableHeader>
                    <SortableHeader field="avgVerificationTime">Avg Time</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAddressQualityReports.map((report) => (
                    <TableRow key={report.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">{report.region}</TableCell>
                      <TableCell>{report.totalAddresses}</TableCell>
                      <TableCell>{report.verifiedAddresses}</TableCell>
                      <TableCell>
                        <Badge variant={report.verificationRate >= 95 ? "success" : "warning"}>
                          {report.verificationRate}%
                        </Badge>
                      </TableCell>
                      <TableCell>{report.nasMatchRate}%</TableCell>
                      <TableCell>
                        <span className="text-red-600">{report.incompleteAddresses}</span>
                      </TableCell>
                      <TableCell>{report.avgVerificationTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exceptions Tab */}
        <TabsContent value="exceptions">
          <Card>
            <CardHeader>
              <CardTitle>System Exceptions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableHeader field="orderId">Order ID</SortableHeader>
                    <SortableHeader field="type">Type</SortableHeader>
                    <SortableHeader field="description">Description</SortableHeader>
                    <SortableHeader field="occurredAt">Time</SortableHeader>
                    <SortableHeader field="severity">Severity</SortableHeader>
                    <SortableHeader field="status">Status</SortableHeader>
                    <SortableHeader field="assignedTo">Assigned</SortableHeader>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockExceptionReports.map((report) => (
                    <TableRow 
                      key={report.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedReport(report)}
                    >
                      <TableCell className="font-medium text-blue-600">{report.orderId}</TableCell>
                      <TableCell>{report.type}</TableCell>
                      <TableCell className="max-w-xs truncate">{report.description}</TableCell>
                      <TableCell>{report.occurredAt}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            report.severity === 'high' ? 'destructive' : 
                            report.severity === 'medium' ? 'warning' : 
                            'secondary'
                          }
                        >
                          {report.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={report.status === 'resolved' ? 'success' : 'outline'}>
                          {report.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.assignedTo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Drawer */}
      <Sheet open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <SheetContent className="w-[400px]">
          <SheetHeader>
            <SheetTitle>
              {activeTab === 'returns' ? 'Return Details' : 'Exception Details'}
            </SheetTitle>
            <SheetDescription>
              View detailed information
            </SheetDescription>
          </SheetHeader>
          
          {selectedReport && (
            <div className="mt-6 space-y-4">
              {activeTab === 'returns' ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order Number</label>
                    <p className="text-lg font-semibold">{selectedReport.orderNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer</label>
                    <p>{selectedReport.customerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Return Reason</label>
                    <p>{selectedReport.reason}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Refund Amount</label>
                    <p className="text-lg font-semibold">SAR {selectedReport.refundAmount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <Badge 
                      variant={
                        selectedReport.status === 'completed' ? 'success' : 
                        selectedReport.status === 'approved' ? 'default' : 
                        'secondary'
                      }
                      className="mt-1"
                    >
                      {selectedReport.status}
                    </Badge>
                  </div>
                  <div className="pt-4">
                    <Button className="w-full">Process Return</Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order ID</label>
                    <p className="text-lg font-semibold">{selectedReport.orderId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Exception Type</label>
                    <p>{selectedReport.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-sm">{selectedReport.description}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Severity</label>
                    <Badge 
                      variant={
                        selectedReport.severity === 'high' ? 'destructive' : 
                        selectedReport.severity === 'medium' ? 'warning' : 
                        'secondary'
                      }
                      className="mt-1"
                    >
                      {selectedReport.severity}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Assigned To</label>
                    <p>{selectedReport.assignedTo}</p>
                  </div>
                  <div className="pt-4 space-y-2">
                    {selectedReport.status === 'open' && (
                      <Button className="w-full">Resolve Exception</Button>
                    )}
                    <Button variant="outline" className="w-full">View Order Details</Button>
                  </div>
                </>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}