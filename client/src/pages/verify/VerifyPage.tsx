import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, CheckCircle, AlertTriangle, Search, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function VerifyPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
    refetchInterval: 30000
  });

  const { data: verificationStats } = useQuery({
    queryKey: ["/api/stats/verification"],
    refetchInterval: 60000
  });

  const verifyAddressMutation = useMutation({
    mutationFn: (orderId: number) => 
      apiRequest(`/api/verify/${orderId}`, { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Verification Started",
        description: "Address verification process initiated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: () => {
      toast({
        title: "Verification Failed",
        description: "Failed to start address verification",
        variant: "destructive"
      });
    }
  });

  const pendingVerificationOrders = orders?.filter((order: any) => 
    !order.nasVerified && order.status !== 'exception'
  ) || [];

  const filteredOrders = pendingVerificationOrders.filter((order: any) =>
    order.saylogixNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getVerificationStatus = (order: any) => {
    if (order.nasVerified) return { status: 'verified', color: 'bg-green-100 text-green-800' };
    if (order.nasCode) return { status: 'checking', color: 'bg-amber-100 text-amber-800' };
    return { status: 'pending', color: 'bg-red-100 text-red-800' };
  };

  const formatAddress = (address: any) => {
    if (!address) return 'No address';
    return `${address.address1}${address.address2 ? ', ' + address.address2 : ''}, ${address.city}, ${address.province} ${address.zip}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Address Verification (NAS)</h1>
          <p className="text-gray-600">Verify delivery addresses using Saudi NAS system</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Verifications</p>
                <p className="text-3xl font-bold text-gray-900">
                  {verificationStats?.total || 0}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-3xl font-bold text-green-600">
                  {verificationStats?.verified || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">WhatsApp Sent</p>
                <p className="text-3xl font-bold text-amber-600">
                  {verificationStats?.whatsappSent || 0}
                </p>
              </div>
              <Phone className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-blue-600">
                  {verificationStats?.successRate?.toFixed(1) || 0}%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders by number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Verification Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Queue ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p>No orders requiring verification</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order: any) => {
                const verification = getVerificationStatus(order);
                return (
                  <div key={order.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {order.saylogixNumber}
                          </h3>
                          <Badge className={verification.color}>
                            {verification.status}
                          </Badge>
                          {order.priority === 'high' && (
                            <Badge className="bg-red-100 text-red-800">
                              High Priority
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Customer</p>
                            <p className="text-sm text-gray-600">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.customerPhone}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">Delivery Address</p>
                            <p className="text-sm text-gray-600">
                              {formatAddress(order.shippingAddress)}
                            </p>
                            {order.nasCode && (
                              <p className="text-sm text-blue-600 mt-1">
                                NAS Code: {order.nasCode}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            Source: {order.sourceChannel} #{order.sourceOrderNumber}
                          </span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">
                            Value: {order.orderValue} {order.currency}
                          </span>
                        </div>
                      </div>

                      <div className="ml-6">
                        <Button
                          onClick={() => verifyAddressMutation.mutate(order.id)}
                          disabled={verifyAddressMutation.isPending || order.nasVerified}
                          className="saylogix-primary"
                        >
                          {verifyAddressMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Verifying...
                            </>
                          ) : order.nasVerified ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Verified
                            </>
                          ) : (
                            <>
                              <MapPin className="h-4 w-4 mr-2" />
                              Verify Address
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
