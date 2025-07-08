import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Search, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface AddressData {
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
}

export default function AddressVerificationPage() {
  const [shortcode, setShortcode] = useState('');
  const [batchCodes, setBatchCodes] = useState('');
  const queryClient = useQueryClient();

  // Fetch verification stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/address/stats'],
    refetchInterval: 5000,
  });

  // Fetch pending verifications
  const { data: pendingVerifications, isLoading: pendingLoading } = useQuery({
    queryKey: ['/api/address/pending'],
    refetchInterval: 3000,
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
    },
  });

  // Unified verification mutation (SPL + NAS)
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
    },
  });

  // Batch verification mutation
  const batchVerification = useMutation({
    mutationFn: async (shortcodes: string[]) => {
      const response = await apiRequest('/api/address/verify/spl/batch', {
        method: 'POST',
        body: { shortcodes },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/address/stats'] });
    },
  });

  const handleSingleVerification = () => {
    if (!shortcode.trim()) return;
    splVerification.mutate(shortcode.trim());
  };

  const handleUnifiedVerification = () => {
    if (!shortcode.trim()) return;
    unifiedVerification.mutate(shortcode.trim());
  };

  const handleBatchVerification = () => {
    if (!batchCodes.trim()) return;
    const codes = batchCodes.split('\n').map(c => c.trim()).filter(c => c);
    batchVerification.mutate(codes);
  };

  const renderAddressCard = (data: AddressData, source: string) => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Address Verified ({source})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <strong>Short Code:</strong> {data.shortCode}
          </div>
          <div>
            <strong>Full Address:</strong> {data.fullAddress}
          </div>
          <div>
            <strong>Postal Code:</strong> {data.postalCode}
          </div>
          {data.additionalCode && (
            <div>
              <strong>Additional Code:</strong> {data.additionalCode}
            </div>
          )}
          {data.coordinates.lat && data.coordinates.lng && (
            <div>
              <strong>Coordinates:</strong> {data.coordinates.lat}, {data.coordinates.lng}
            </div>
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
        <h1 className="text-3xl font-bold mb-2">Address Verification</h1>
        <p className="text-gray-600">
          Verify Saudi Arabian addresses using SPL NAD (National Address Database) and NAS (National Address Service)
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
              {statsLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats?.successRate?.toFixed(1) || 0}%`}
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Single Verification</TabsTrigger>
          <TabsTrigger value="unified">Unified (SPL + NAS)</TabsTrigger>
          <TabsTrigger value="batch">Batch Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SPL Address Verification</CardTitle>
              <CardDescription>
                Verify a single address using SPL NAD (National Address Database)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter NAS shortcode (e.g., RIYD2342)"
                  value={shortcode}
                  onChange={(e) => setShortcode(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSingleVerification}
                  disabled={splVerification.isPending || !shortcode.trim()}
                >
                  {splVerification.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Verify
                </Button>
              </div>

              {splVerification.error && (
                <Alert className="mt-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {splVerification.error.message || 'Verification failed'}
                  </AlertDescription>
                </Alert>
              )}

              {splVerification.data && renderAddressCard(splVerification.data, 'SPL')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unified" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unified Address Verification</CardTitle>
              <CardDescription>
                Verify using SPL first, then fallback to NAS if needed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter NAS shortcode (e.g., RIYD2342)"
                  value={shortcode}
                  onChange={(e) => setShortcode(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleUnifiedVerification}
                  disabled={unifiedVerification.isPending || !shortcode.trim()}
                >
                  {unifiedVerification.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Verify
                </Button>
              </div>

              {unifiedVerification.error && (
                <Alert className="mt-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {unifiedVerification.error.message || 'Verification failed'}
                  </AlertDescription>
                </Alert>
              )}

              {unifiedVerification.data && renderVerificationResult(unifiedVerification.data)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Address Verification</CardTitle>
              <CardDescription>
                Verify multiple addresses at once (one per line)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <textarea
                  placeholder="Enter multiple NAS shortcodes (one per line)&#10;RIYD2342&#10;JEDD1234&#10;DMNM5678"
                  value={batchCodes}
                  onChange={(e) => setBatchCodes(e.target.value)}
                  className="w-full h-32 p-2 border rounded-md resize-none"
                />
                <Button 
                  onClick={handleBatchVerification}
                  disabled={batchVerification.isPending || !batchCodes.trim()}
                  className="w-full"
                >
                  {batchVerification.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Verify Batch
                </Button>
              </div>

              {batchVerification.error && (
                <Alert className="mt-4">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {batchVerification.error.message || 'Batch verification failed'}
                  </AlertDescription>
                </Alert>
              )}

              {batchVerification.data && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Batch Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(batchVerification.data).map(([code, isValid]) => (
                        <div key={code} className="flex items-center justify-between p-2 border rounded">
                          <span className="font-mono">{code}</span>
                          <Badge variant={isValid ? "default" : "destructive"}>
                            {isValid ? "Valid" : "Invalid"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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