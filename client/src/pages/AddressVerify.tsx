import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Search, MapPin, CheckCircle, XCircle, Loader2, Clock, Database, Package, X, User, Phone, Navigation, ArrowUpDown, Eye } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SPLAddressData {
  shortCode: string;
  fullAddress: string;
  postalCode: string;
  additionalCode: string;
  coordinates: {
    lat?: number;
    lng?: number;
  };
  city?: string;
  district?: string;
  street?: string;
  buildingNumber?: string;
  unitNumber?: string;
  municipality?: string;
  region?: string;
  landmark?: string;
  isActive?: boolean;
}

interface VerificationResult {
  found: boolean;
  verified: boolean;
  address?: any;
  coordinates?: {
    lat: number;
    lng: number;
  };
  source?: string;
}

interface VerificationStats {
  total: number;
  verified: number;
  pending: number;
  whatsappSent: number;
  failed: number;
  successRate: number;
}

export default function AddressVerify() {
  const [nasCode, setNasCode] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState<SPLAddressData | null>(null);
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch verification stats
  const { data: stats, isLoading: statsLoading } = useQuery<VerificationStats>({
    queryKey: ['/api/address/stats'],
    refetchInterval: 5000,
  });

  // Fetch pending verifications
  const { data: pendingVerifications, isLoading: pendingLoading } = useQuery({
    queryKey: ['/api/address/pending'],
    refetchInterval: 3000,
  });

  // Fetch orders for NAS parsing
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/orders'],
    refetchInterval: 5000,
  });

  // Fetch verified orders by filtering all orders
  const verifiedOrders = orders?.filter((order: any) => order.addressVerified) || [];

  // SPL verification mutation
  const splVerification = useMutation({
    mutationFn: async (shortcode: string) => {
      const response = await apiRequest('/api/address/verify/spl', {
        method: 'POST',
        body: JSON.stringify({ shortcode }),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/address/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

  // Unified verification mutation (SPL + NAS fallback)
  const unifiedVerification = useMutation({
    mutationFn: async (shortcode: string) => {
      const response = await apiRequest('/api/address/validate', {
        method: 'POST',
        body: JSON.stringify({ shortcode }),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/address/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

  // Order verification mutation
  const orderVerification = useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiRequest(`/api/verify/${orderId}`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/address/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
  });

  const handleNasVerification = () => {
    if (!nasCode.trim()) return;
    
    // Validate NAS format: 4 letters + 4 digits
    const nasPattern = /^[A-Z]{4}[0-9]{4}$/;
    if (!nasPattern.test(nasCode.trim().toUpperCase())) {
      alert('Invalid NAS format. Expected format: ABCD1234 (4 letters + 4 digits)');
      return;
    }
    
    unifiedVerification.mutate(nasCode.trim().toUpperCase());
  };

  const handleOrderVerification = (orderId: number) => {
    orderVerification.mutate(orderId);
  };

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setVerificationResult(null);
    setDrawerOpen(true);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortOrders = (orders: any[]) => {
    if (!sortField) return orders;
    
    return [...orders].sort((a, b) => {
      let aVal = '';
      let bVal = '';
      
      switch (sortField) {
        case 'orderId':
          aVal = a.saylogixNumber || '';
          bVal = b.saylogixNumber || '';
          break;
        case 'customer':
          aVal = a.customerName || '';
          bVal = b.customerName || '';
          break;
        case 'nas':
          aVal = extractNasFromAddress(a.shippingAddress) || '';
          bVal = extractNasFromAddress(b.shippingAddress) || '';
          break;
        case 'address':
          aVal = typeof a.shippingAddress === 'string' 
            ? a.shippingAddress 
            : `${a.shippingAddress?.address1 || ''} ${a.shippingAddress?.city || ''}`;
          bVal = typeof b.shippingAddress === 'string' 
            ? b.shippingAddress 
            : `${b.shippingAddress?.address1 || ''} ${b.shippingAddress?.city || ''}`;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aVal.localeCompare(bVal);
      } else {
        return bVal.localeCompare(aVal);
      }
    });
  };

  // Drawer verification mutation
  const drawerVerification = useMutation({
    mutationFn: async (nasCode: string) => {
      const response = await apiRequest('/api/address/verify/spl', {
        method: 'POST',
        body: JSON.stringify({ shortcode: nasCode }),
      });
      return response.data;
    },
    onSuccess: (data: SPLAddressData) => {
      setVerificationResult(data);
      
      // Update order with verified address
      if (selectedOrder) {
        updateOrderWithVerifiedAddress(selectedOrder.id, data);
      }
      
      toast({
        title: "Address successfully verified",
        description: "The verified address has been stored and order updated.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/address/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Unable to verify address with Saudi Post API",
        variant: "destructive",
      });
    },
  });

  const updateOrderWithVerifiedAddress = async (orderId: number, addressData: SPLAddressData) => {
    try {
      await apiRequest(`/api/orders/${orderId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({
          addressVerified: true,
          verifiedAddress: addressData.fullAddress,
          verifiedNAS: addressData.shortCode,
          coordinates: addressData.coordinates,
          verificationTimestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to update order with verified address:', error);
    }
  };

  // Extract NAS codes from order addresses
  const extractNasFromAddress = (address: any): string | null => {
    if (!address) return null;
    
    let addressText = '';
    
    if (typeof address === 'string') {
      addressText = address;
    } else if (typeof address === 'object') {
      // Handle JSON object format
      addressText = `${address.address1 || ''} ${address.address2 || ''} ${address.city || ''} ${address.zip || ''}`;
    }
    
    // Look for patterns like KUGA4386, RIYD2342, RESB3139, etc.
    const nasPattern = /\b[A-Z]{4}[0-9]{4}\b/gi;
    const matches = addressText.match(nasPattern);
    return matches ? matches[0].toUpperCase() : null;
  };

  const renderAddressCard = (data: SPLAddressData, source: string) => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Address Verified ({source})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div><strong>NAS Code:</strong> {data.shortCode}</div>
          <div><strong>Full Address:</strong> {data.fullAddress}</div>
          <div><strong>Postal Code:</strong> {data.postalCode}</div>
          {data.additionalCode && (
            <div><strong>Additional Code:</strong> {data.additionalCode}</div>
          )}
          {data.coordinates.lat && data.coordinates.lng && (
            <div><strong>Coordinates:</strong> {data.coordinates.lat}, {data.coordinates.lng}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderVerificationResult = (result: VerificationResult) => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result.found && result.verified ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          Verification Result
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={result.found ? "default" : "secondary"}>
              {result.found ? "Found" : "Not Found"}
            </Badge>
            <Badge variant={result.verified ? "default" : "destructive"}>
              {result.verified ? "Verified" : "Not Verified"}
            </Badge>
            {result.source && (
              <Badge variant="outline">Source: {result.source}</Badge>
            )}
          </div>
          {result.address && (
            <div className="mt-4 space-y-1">
              <div><strong>Address:</strong> {result.address.address}</div>
              <div><strong>City:</strong> {result.address.city}</div>
              <div><strong>District:</strong> {result.address.district}</div>
              <div><strong>Postal Code:</strong> {result.address.postalCode}</div>
            </div>
          )}
          {result.coordinates && (
            <div>
              <strong>Coordinates:</strong> {result.coordinates.lat}, {result.coordinates.lng}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.total || 0}
            </div>
            <div className="text-sm text-gray-600">Total Verifications</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.verified || 0}
            </div>
            <div className="text-sm text-gray-600">Verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats?.pending || 0}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats?.successRate ? stats.successRate.toFixed(1) : 0}%`}
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Verify NAS
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Verify with NAS
          </TabsTrigger>
          <TabsTrigger value="verified" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Verified NAS DB
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pending Verify NAS */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Orders Awaiting NAS Verification
              </CardTitle>
              <CardDescription>
                Orders fetched from marketplaces that require address verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {orders && orders.filter((order: any) => {
                    const nasCode = extractNasFromAddress(order.shippingAddress);
                    return nasCode && !order.addressVerified;
                  }).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No orders pending verification
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort('orderId')}
                          >
                            <div className="flex items-center gap-2">
                              Order ID
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort('customer')}
                          >
                            <div className="flex items-center gap-2">
                              Customer
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none text-center"
                            onClick={() => handleSort('nas')}
                          >
                            <div className="flex items-center gap-2 justify-center">
                              NAS
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort('address')}
                          >
                            <div className="flex items-center gap-2">
                              Address
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortOrders(orders?.filter((order: any) => {
                          const nasCode = extractNasFromAddress(order.shippingAddress);
                          return nasCode && !order.addressVerified;
                        }) || []).map((order: any) => {
                          const nasCode = extractNasFromAddress(order.shippingAddress);
                          return (
                            <TableRow 
                              key={order.id} 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleOrderClick(order)}
                            >
                              <TableCell className="font-medium">{order.saylogixNumber}</TableCell>
                              <TableCell>{order.customerName}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="outline">{nasCode}</Badge>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {typeof order.shippingAddress === 'string' 
                                  ? order.shippingAddress 
                                  : `${order.shippingAddress?.address1 || ''} ${order.shippingAddress?.city || ''}`}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Verify with NAS (Manual) */}
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual NAS Verification</CardTitle>
              <CardDescription>
                Enter a NAS shortcode to verify using SPL NAD (with NAS fallback)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter NAS shortcode (e.g., RIYD2342)"
                  value={nasCode}
                  onChange={(e) => setNasCode(e.target.value.toUpperCase())}
                  className="flex-1"
                  maxLength={8}
                />
                <Button 
                  onClick={handleNasVerification}
                  disabled={unifiedVerification.isPending || !nasCode.trim()}
                >
                  {unifiedVerification.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Verify
                </Button>
              </div>

              <div className="mt-2 text-sm text-gray-500">
                Format: 4 letters + 4 digits (e.g., RIYD2342, JEDD1234)
              </div>

              {unifiedVerification.error && (
                <Alert className="mt-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {unifiedVerification.error.message || 'Verification failed'}
                  </AlertDescription>
                </Alert>
              )}

              {splVerification.data && renderAddressCard(splVerification.data, 'SPL')}
              {unifiedVerification.data && renderVerificationResult(unifiedVerification.data)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Verified NAS DB */}
        <TabsContent value="verified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Verified Address Database
              </CardTitle>
              <CardDescription>
                Previously verified orders with complete address information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {orders && orders.filter((order: any) => order.addressVerified).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No verified addresses yet
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort('orderId')}
                          >
                            <div className="flex items-center gap-2">
                              Order ID
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort('customer')}
                          >
                            <div className="flex items-center gap-2">
                              Customer
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none text-center"
                            onClick={() => handleSort('nas')}
                          >
                            <div className="flex items-center gap-2 justify-center">
                              NAS
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead 
                            className="cursor-pointer hover:bg-gray-50 select-none"
                            onClick={() => handleSort('address')}
                          >
                            <div className="flex items-center gap-2">
                              Full SPL Address
                              <ArrowUpDown className="h-4 w-4" />
                            </div>
                          </TableHead>
                          <TableHead>Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortOrders(orders?.filter((order: any) => order.addressVerified) || []).map((order: any) => {
                          const nasCode = extractNasFromAddress(order.shippingAddress);
                          return (
                            <TableRow 
                              key={order.id} 
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleOrderClick(order)}
                            >
                              <TableCell className="font-medium">{order.saylogixNumber}</TableCell>
                              <TableCell>{order.customerName}</TableCell>
                              <TableCell className="text-center">
                                <Badge variant="default">{nasCode || 'N/A'}</Badge>
                              </TableCell>
                              <TableCell className="max-w-md">
                                <div className="text-sm">
                                  {order.verifiedAddress || (
                                    typeof order.shippingAddress === 'string' 
                                      ? order.shippingAddress 
                                      : `${order.shippingAddress?.address1 || ''} ${order.shippingAddress?.city || ''}`
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-gray-500">
                                  {new Date(order.addressVerifiedAt || order.createdAt).toLocaleString()}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Verification Drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Verification Details
            </SheetTitle>
          </SheetHeader>
          
          {selectedOrder && (
            <div className="mt-6 space-y-6">
              {/* Order Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Order Information</h3>
                  <Badge variant="outline">{selectedOrder.saylogixNumber}</Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Customer:</span>
                      <span>{selectedOrder.customerName}</span>
                    </div>
                    
                    {selectedOrder.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Phone:</span>
                        <span>{selectedOrder.customerPhone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">NAS Code:</span>
                      <Badge variant="outline">
                        {extractNasFromAddress(selectedOrder.shippingAddress)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Original Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Original Address</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    {typeof selectedOrder.shippingAddress === 'string' 
                      ? selectedOrder.shippingAddress 
                      : `${selectedOrder.shippingAddress?.address1 || ''} ${selectedOrder.shippingAddress?.address2 || ''} ${selectedOrder.shippingAddress?.city || ''} ${selectedOrder.shippingAddress?.zip || ''}`}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Verification Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address Verification</h3>
                
                {!verificationResult ? (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Click the button below to verify the address using the Saudi Post National Address API.
                    </p>
                    
                    <Button 
                      onClick={() => {
                        const nasCode = extractNasFromAddress(selectedOrder.shippingAddress);
                        if (nasCode) {
                          drawerVerification.mutate(nasCode);
                        }
                      }}
                      disabled={drawerVerification.isPending}
                      className="w-full"
                    >
                      {drawerVerification.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Verifying with Saudi Post API...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify with NAS
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-800">Address Successfully Verified</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="font-medium">NAS Code:</span> 
                          <span className={verificationResult.shortCode ? "text-green-600" : "text-red-600"}>
                            {verificationResult.shortCode || "Missing"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Full Address:</span> 
                          <span className={verificationResult.fullAddress ? "text-green-600" : "text-red-600"}>
                            {verificationResult.fullAddress || "Missing"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Postal Code:</span> 
                          <span className={verificationResult.postalCode ? "text-green-600" : "text-red-600"}>
                            {verificationResult.postalCode || "Missing"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Additional Code:</span> 
                          <span className={verificationResult.additionalCode ? "text-green-600" : "text-red-600"}>
                            {verificationResult.additionalCode || "Missing"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Coordinates:</span> 
                          <span className={verificationResult.coordinates?.lat && verificationResult.coordinates?.lng ? "text-green-600" : "text-red-600"}>
                            {verificationResult.coordinates?.lat && verificationResult.coordinates?.lng 
                              ? `${verificationResult.coordinates.lat}, ${verificationResult.coordinates.lng}` 
                              : "Missing"}
                          </span>
                        </div>
                        {verificationResult.city && (
                          <div className="flex justify-between">
                            <span className="font-medium">City:</span> 
                            <span className="text-green-600">{verificationResult.city}</span>
                          </div>
                        )}
                        {verificationResult.district && (
                          <div className="flex justify-between">
                            <span className="font-medium">District:</span> 
                            <span className="text-green-600">{verificationResult.district}</span>
                          </div>
                        )}
                        {verificationResult.street && (
                          <div className="flex justify-between">
                            <span className="font-medium">Street:</span> 
                            <span className="text-green-600">{verificationResult.street}</span>
                          </div>
                        )}
                        {verificationResult.buildingNumber && (
                          <div className="flex justify-between">
                            <span className="font-medium">Building Number:</span> 
                            <span className="text-green-600">{verificationResult.buildingNumber}</span>
                          </div>
                        )}
                        {verificationResult.unitNumber && (
                          <div className="flex justify-between">
                            <span className="font-medium">Unit Number:</span> 
                            <span className="text-green-600">{verificationResult.unitNumber}</span>
                          </div>
                        )}
                        {verificationResult.municipality && (
                          <div className="flex justify-between">
                            <span className="font-medium">Municipality:</span> 
                            <span className="text-green-600">{verificationResult.municipality}</span>
                          </div>
                        )}
                        {verificationResult.region && (
                          <div className="flex justify-between">
                            <span className="font-medium">Region:</span> 
                            <span className="text-green-600">{verificationResult.region}</span>
                          </div>
                        )}
                        {verificationResult.landmark && (
                          <div className="flex justify-between">
                            <span className="font-medium">Landmark:</span> 
                            <span className="text-green-600">{verificationResult.landmark}</span>
                          </div>
                        )}
                        {verificationResult.isActive !== undefined && (
                          <div className="flex justify-between">
                            <span className="font-medium">Is Active:</span> 
                            <span className={verificationResult.isActive ? "text-green-600" : "text-red-600"}>
                              {verificationResult.isActive ? "Yes" : "No"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setDrawerOpen(false)}
                      variant="outline"
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Close Verification
                    </Button>
                  </div>
                )}

                {drawerVerification.error && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {drawerVerification.error.message || 'Failed to verify address with Saudi Post API'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Google Maps Location Preview */}
              {verificationResult?.coordinates.lat && verificationResult?.coordinates.lng && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location Preview
                    </h3>
                    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${verificationResult.coordinates.lat},${verificationResult.coordinates.lng}&zoom=16&maptype=roadmap`}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Address Location"
                      />
                    </div>
                    <div className="text-center text-xs text-gray-500">
                      Coordinates: {verificationResult.coordinates.lat}, {verificationResult.coordinates.lng}
                    </div>
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