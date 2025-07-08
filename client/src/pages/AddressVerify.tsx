import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PendingVerification {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  originalAddress: {
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode?: string;
  };
  verificationMethod: string;
  attemptedAt: string;
  errorReason?: string;
}

interface VerificationStats {
  totalVerified: number;
  pendingVerification: number;
  failedVerification: number;
  verificationRate: number;
  manualVerification: number;
  whatsappVerification: number;
}

export default function AddressVerify() {
  const [selectedOrder, setSelectedOrder] = useState<PendingVerification | null>(null);
  const [manualAddress, setManualAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    region: "",
    postalCode: "",
    nasCode: ""
  });

  const { data: pendingVerifications = [] } = useQuery<PendingVerification[]>({
    queryKey: ["/api/address/pending"],
    refetchInterval: 30000,
  });

  const { data: stats } = useQuery<VerificationStats>({
    queryKey: ["/api/address/stats"],
    refetchInterval: 60000,
  });

  const handleSelectOrder = (order: PendingVerification) => {
    setSelectedOrder(order);
    setManualAddress({
      line1: order.originalAddress.line1,
      line2: order.originalAddress.line2 || "",
      city: order.originalAddress.city,
      region: order.originalAddress.region,
      postalCode: order.originalAddress.postalCode || "",
      nasCode: ""
    });
  };

  const handleManualVerification = async () => {
    if (!selectedOrder) return;

    try {
      // TODO: Implement manual verification API call
      console.log("Manual verification for order:", selectedOrder.orderNumber, manualAddress);
      
      // Reset form
      setSelectedOrder(null);
      setManualAddress({
        line1: "",
        line2: "",
        city: "",
        region: "",
        postalCode: "",
        nasCode: ""
      });
    } catch (error) {
      console.error("Manual verification error:", error);
    }
  };

  const handleRetryVerification = async (orderId: number) => {
    try {
      // TODO: Implement retry verification API call
      console.log("Retrying verification for order:", orderId);
    } catch (error) {
      console.error("Retry verification error:", error);
    }
  };

  const getVerificationMethodColor = (method: string) => {
    switch (method) {
      case "nas_api":
        return "bg-success-100 text-success-800 border-success-200";
      case "whatsapp_confirmation":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "manual":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "failed":
        return "bg-error-100 text-error-800 border-error-200";
      default:
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
    }
  };

  const getVerificationMethodIcon = (method: string) => {
    switch (method) {
      case "nas_api":
        return "fas fa-check-circle";
      case "whatsapp_confirmation":
        return "fab fa-whatsapp";
      case "manual":
        return "fas fa-user-edit";
      case "failed":
        return "fas fa-times-circle";
      default:
        return "fas fa-question-circle";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Verification Rate</p>
                <p className="text-3xl font-bold text-secondary-900">
                  {stats?.verificationRate ? stats.verificationRate.toFixed(1) : 0}%
                </p>
                <p className="text-sm text-success-600">↗ +2.3% this week</p>
              </div>
              <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-success-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Pending Verification</p>
                <p className="text-3xl font-bold text-secondary-900">
                  {stats?.pendingVerification || 0}
                </p>
                <p className="text-sm text-warning-600">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-clock text-warning-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">WhatsApp Verified</p>
                <p className="text-3xl font-bold text-secondary-900">
                  {stats?.whatsappVerification || 0}
                </p>
                <p className="text-sm text-primary-600">Customer confirmed</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <i className="fab fa-whatsapp text-primary-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Manual Review</p>
                <p className="text-3xl font-bold text-secondary-900">
                  {stats?.manualVerification || 0}
                </p>
                <p className="text-sm text-secondary-600">Staff verified</p>
              </div>
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-edit text-secondary-600"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Verifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-map-marker-alt mr-2 text-primary-500"></i>
              Pending Address Verifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingVerifications.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-check-circle text-4xl text-success-400 mb-4"></i>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">All Clear!</h3>
                <p className="text-secondary-500">No pending address verifications</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {pendingVerifications.map((verification) => (
                  <div
                    key={verification.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedOrder?.id === verification.id
                        ? "border-primary-300 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleSelectOrder(verification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-secondary-900">
                            {verification.orderNumber}
                          </span>
                          <Badge className={getVerificationMethodColor(verification.verificationMethod)}>
                            <i className={`${getVerificationMethodIcon(verification.verificationMethod)} mr-1`}></i>
                            {verification.verificationMethod}
                          </Badge>
                        </div>
                        <p className="text-sm text-secondary-600 mb-1">
                          {verification.customerName} • {verification.customerPhone}
                        </p>
                        <p className="text-sm text-secondary-500">
                          {verification.originalAddress.line1}, {verification.originalAddress.city}
                        </p>
                        {verification.errorReason && (
                          <p className="text-xs text-error-600 mt-2">
                            <i className="fas fa-exclamation-triangle mr-1"></i>
                            {verification.errorReason}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetryVerification(verification.id);
                          }}
                        >
                          <i className="fas fa-redo"></i>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual Verification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-user-edit mr-2 text-primary-500"></i>
              Manual Address Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedOrder ? (
              <div className="text-center py-8">
                <i className="fas fa-hand-pointer text-4xl text-secondary-300 mb-4"></i>
                <h3 className="text-lg font-medium text-secondary-900 mb-2">Select an Order</h3>
                <p className="text-secondary-500">Choose a pending verification from the left to manually verify the address</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-secondary-900 mb-2">
                    Order: {selectedOrder.orderNumber}
                  </h4>
                  <p className="text-sm text-secondary-600">
                    Customer: {selectedOrder.customerName} ({selectedOrder.customerPhone})
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address-line1">Address Line 1 *</Label>
                    <Input
                      id="address-line1"
                      value={manualAddress.line1}
                      onChange={(e) => setManualAddress({ ...manualAddress, line1: e.target.value })}
                      placeholder="Street address"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address-line2">Address Line 2</Label>
                    <Input
                      id="address-line2"
                      value={manualAddress.line2}
                      onChange={(e) => setManualAddress({ ...manualAddress, line2: e.target.value })}
                      placeholder="Apartment, suite, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={manualAddress.city}
                        onChange={(e) => setManualAddress({ ...manualAddress, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="region">Region *</Label>
                      <Input
                        id="region"
                        value={manualAddress.region}
                        onChange={(e) => setManualAddress({ ...manualAddress, region: e.target.value })}
                        placeholder="Region/Province"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postal-code">Postal Code</Label>
                      <Input
                        id="postal-code"
                        value={manualAddress.postalCode}
                        onChange={(e) => setManualAddress({ ...manualAddress, postalCode: e.target.value })}
                        placeholder="12345"
                      />
                    </div>
                    <div>
                      <Label htmlFor="nas-code">NAS Code</Label>
                      <Input
                        id="nas-code"
                        value={manualAddress.nasCode}
                        onChange={(e) => setManualAddress({ ...manualAddress, nasCode: e.target.value })}
                        placeholder="NAS verification code"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleManualVerification} className="flex-1">
                    <i className="fas fa-check mr-2"></i>
                    Verify Address
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
