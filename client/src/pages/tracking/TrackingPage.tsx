import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Search, MapPin, Clock, CheckCircle, Package, Phone, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleTrackOrder = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate tracking lookup - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock tracking data
      setTrackingResult({
        trackingNumber: trackingNumber,
        orderNumber: "SLYY-2024-001247",
        status: "Out for Delivery",
        estimatedDelivery: "Today, 3:00 PM - 5:00 PM",
        courier: "Aramex",
        customer: {
          name: "Ahmed Al-Rahman",
          phone: "+966 55 123 4567",
          address: "King Fahd Road, Al Olaya District, Riyadh 12244"
        },
        timeline: [
          {
            status: "Order Received",
            description: "Order received from Shopify",
            timestamp: "2024-01-06 09:00:00",
            location: "Riyadh Warehouse",
            completed: true
          },
          {
            status: "Picked",
            description: "Items picked from warehouse",
            timestamp: "2024-01-06 10:30:00",
            location: "Riyadh Warehouse",
            completed: true
          },
          {
            status: "Packed",
            description: "Package prepared for shipping",
            timestamp: "2024-01-06 11:15:00",
            location: "Riyadh Warehouse",
            completed: true
          },
          {
            status: "Dispatched",
            description: "Package handed over to courier",
            timestamp: "2024-01-06 14:00:00",
            location: "Riyadh Hub",
            completed: true
          },
          {
            status: "In Transit",
            description: "Package on route to destination",
            timestamp: "2024-01-06 15:30:00",
            location: "Local Delivery Hub",
            completed: true
          },
          {
            status: "Out for Delivery",
            description: "Package out for delivery",
            timestamp: "2024-01-06 16:00:00",
            location: "Delivery Vehicle",
            completed: true
          },
          {
            status: "Delivered",
            description: "Package will be delivered",
            timestamp: "2024-01-06 17:00:00",
            location: "Customer Address",
            completed: false
          }
        ]
      });
      
    } catch (error) {
      toast({
        title: "Tracking Failed",
        description: "Unable to find tracking information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(trackingResult.trackingNumber);
    toast({
      title: "Copied",
      description: "Tracking number copied to clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'out for delivery': return 'bg-blue-100 text-blue-800';
      case 'in transit': return 'bg-amber-100 text-amber-800';
      case 'exception': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
          <p className="text-gray-600">Track your orders in real-time</p>
        </div>
      </div>

      {/* Tracking Search */}
      <Card>
        <CardHeader>
          <CardTitle>Track Your Order</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Enter tracking number (e.g., ARX12345678, SLYY-2024-001247)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
              />
            </div>
            <Button 
              onClick={handleTrackOrder}
              disabled={isLoading}
              className="saylogix-primary"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Tracking...
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  Track Order
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Results */}
      {trackingResult && (
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Package className="h-5 w-5 mr-2 text-blue-600" />
                  Order Details
                </CardTitle>
                <Badge className={getStatusColor(trackingResult.status)}>
                  {trackingResult.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tracking Information</p>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Tracking #:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">
                        {trackingResult.trackingNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyTrackingNumber}
                        className="ml-2 h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Order #:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">
                        {trackingResult.orderNumber}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Courier:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">
                        {trackingResult.courier}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Delivery Information</p>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-900">
                        {trackingResult.estimatedDelivery}
                      </span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
                      <span className="text-sm text-gray-900">
                        {trackingResult.customer.address}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Customer Information</p>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium text-gray-900 ml-2">
                        {trackingResult.customer.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-900">
                        {trackingResult.customer.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {trackingResult.timeline.map((event: any, index: number) => (
                    <div key={index} className="relative flex items-start">
                      <div className={`absolute left-2 w-4 h-4 rounded-full border-2 ${
                        event.completed 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'bg-white border-gray-300'
                      }`}></div>
                      
                      <div className="ml-10">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            event.completed ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {event.status}
                          </h4>
                          <span className={`text-xs ${
                            event.completed ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {event.completed 
                              ? new Date(event.timestamp).toLocaleString()
                              : 'Estimated'
                            }
                          </span>
                        </div>
                        <p className={`text-sm ${
                          event.completed ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                          {event.description}
                        </p>
                        <p className={`text-xs ${
                          event.completed ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                          {event.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Public Tracking Link Info */}
      <Card>
        <CardHeader>
          <CardTitle>For Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Customers can track their orders using the public tracking page:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm text-gray-800">
              https://track.saylogix.com/track/[TRACKING_NUMBER]
            </code>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            This page provides real-time tracking information without requiring authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
