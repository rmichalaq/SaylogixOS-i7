import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MapPin, CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SPLAddressData {
  shortCode: string;
  fullAddress: string;
  postalCode: string;
  additionalCode: string;
  coordinates: {
    lat?: number;
    lng?: number;
  };
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
  const queryClient = useQueryClient();

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

  // SPL verification mutation
  const splVerification = useMutation({
    mutationFn: async (shortcode: string) => {
      const response = await apiRequest('/api/address/verify/spl', {
        method: 'POST',
        body: { shortcode },
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
        body: { shortcode },
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

  // Extract NAS codes from order addresses
  const extractNasFromAddress = (address: any): string | null => {
    if (!address) return null;
    
    const addressText = typeof address === 'string' ? address : 
      `${address.address1 || ''} ${address.address2 || ''} ${address.city || ''} ${address.zip || ''}`;
    
    const nasPattern = /\b[A-Z]{4}[0-9]{4}\b/g;
    const matches = addressText.match(nasPattern);
    return matches ? matches[0] : null;
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Verify NAS</h1>
        <p className="text-gray-600">
          Verify Saudi Arabian National Address Shortcodes using SPL NAD with NAS fallback
        </p>
      </div>

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

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="single">Single Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>NAS Verification</CardTitle>
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
      </Tabs>

      {/* Orders with potential NAS codes */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Orders Requiring NAS Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-2">
              {orders.map((order: any) => {
                const nasCode = extractNasFromAddress(order.shippingAddress);
                const needsVerification = nasCode && !order.addressVerified;
                
                if (!needsVerification) return null;
                
                return (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{order.saylogixNumber}</div>
                      <div className="text-sm text-gray-600">
                        NAS: {nasCode} | Customer: {order.customerName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {typeof order.shippingAddress === 'string' 
                          ? order.shippingAddress 
                          : `${order.shippingAddress?.address1 || ''} ${order.shippingAddress?.city || ''}`}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleOrderVerification(order.id)}
                      disabled={orderVerification.isPending}
                    >
                      {orderVerification.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Verify'
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All orders verified!</h3>
              <p className="text-gray-500">No orders require NAS verification</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Verifications */}
      {pendingVerifications && pendingVerifications.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingVerifications.map((verification: any) => (
                <div key={verification.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{verification.eventType}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(verification.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}