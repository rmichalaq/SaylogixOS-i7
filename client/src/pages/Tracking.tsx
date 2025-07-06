import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface TrackingInfo {
  order: {
    saylogixNumber: string;
    sourceOrderNumber: string;
    status: string;
    priority: string;
    courierService: string;
    awbNumber: string;
    trackingUrl: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: {
      line1: string;
      line2?: string;
      city: string;
      region: string;
      postalCode?: string;
      country: string;
    };
    itemCount: number;
    totalAmount: string;
    currency: string;
  };
  timeline: Array<{
    eventType: string;
    timestamp: string;
    description: string;
    status: string;
    location?: string;
  }>;
  courierTracking?: any;
  estimatedDelivery?: {
    estimatedDate: string;
    estimatedDays: number;
    confidence: string;
  };
  lastUpdate: string;
}

export default function Tracking() {
  const [trackingQuery, setTrackingQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const { data: trackingInfo, isLoading, error } = useQuery<TrackingInfo>({
    queryKey: ["/api/tracking", submittedQuery],
    enabled: !!submittedQuery,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingQuery.trim()) {
      setSubmittedQuery(trackingQuery.trim());
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success-100 text-success-800 border-success-200";
      case "dispatched":
        return "bg-primary-100 text-primary-800 border-primary-200";
      case "out_for_delivery":
        return "bg-warning-100 text-warning-800 border-warning-200";
      case "exception":
        return "bg-error-100 text-error-800 border-error-200";
      default:
        return "bg-secondary-100 text-secondary-800 border-secondary-200";
    }
  };

  const getTimelineIcon = (eventType: string, status: string) => {
    let icon = "fas fa-circle";
    switch (eventType) {
      case "order.fetched":
        icon = "fas fa-shopping-cart";
        break;
      case "verify.resolved":
        icon = "fas fa-check-circle";
        break;
      case "order.validated":
        icon = "fas fa-clipboard-check";
        break;
      case "pick.completed":
        icon = "fas fa-hand-paper";
        break;
      case "pack.completed":
        icon = "fas fa-box";
        break;
      case "order.dispatched":
        icon = "fas fa-truck";
        break;
      case "delivered":
        icon = "fas fa-home";
        break;
    }

    let colorClass = "text-primary-500";
    if (status === "success") colorClass = "text-success-500";
    else if (status === "failure") colorClass = "text-error-500";

    return `${icon} ${colorClass}`;
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <i className="fas fa-truck mr-2 text-primary-500"></i>
            Package Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="tracking-input">Enter Tracking Number</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  id="tracking-input"
                  placeholder="Order number, AWB, or tracking code..."
                  value={trackingQuery}
                  onChange={(e) => setTrackingQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!trackingQuery.trim()}>
                  <i className="fas fa-search mr-2"></i>
                  Track
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
              <p className="text-secondary-500">Searching for tracking information...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-error-500 mb-4"></i>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">Tracking Not Found</h3>
              <p className="text-secondary-500">
                We couldn't find any tracking information for "{submittedQuery}". 
                Please check the number and try again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Results */}
      {trackingInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Summary */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-secondary-600">Order Number</p>
                <p className="text-sm text-secondary-900">{trackingInfo.order.saylogixNumber}</p>
                <p className="text-xs text-secondary-500">{trackingInfo.order.sourceOrderNumber}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-secondary-600">Status</p>
                <Badge className={getStatusColor(trackingInfo.order.status)}>
                  {trackingInfo.order.status}
                </Badge>
              </div>

              {trackingInfo.order.awbNumber && (
                <div>
                  <p className="text-sm font-medium text-secondary-600">AWB Number</p>
                  <p className="text-sm text-secondary-900">{trackingInfo.order.awbNumber}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-secondary-600">Courier Service</p>
                <p className="text-sm text-secondary-900">{trackingInfo.order.courierService || "Not assigned"}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-secondary-600">Customer</p>
                <p className="text-sm text-secondary-900">{trackingInfo.order.customerName}</p>
                <p className="text-xs text-secondary-500">{trackingInfo.order.customerPhone}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-secondary-600">Delivery Address</p>
                <p className="text-sm text-secondary-900">{trackingInfo.order.deliveryAddress.line1}</p>
                {trackingInfo.order.deliveryAddress.line2 && (
                  <p className="text-sm text-secondary-900">{trackingInfo.order.deliveryAddress.line2}</p>
                )}
                <p className="text-sm text-secondary-500">
                  {trackingInfo.order.deliveryAddress.city}, {trackingInfo.order.deliveryAddress.region}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-secondary-600">Order Value</p>
                <p className="text-sm text-secondary-900">
                  {parseFloat(trackingInfo.order.totalAmount).toFixed(2)} {trackingInfo.order.currency}
                </p>
                <p className="text-xs text-secondary-500">{trackingInfo.order.itemCount} items</p>
              </div>

              {trackingInfo.estimatedDelivery && (
                <div>
                  <p className="text-sm font-medium text-secondary-600">Estimated Delivery</p>
                  <p className="text-sm text-secondary-900">
                    {new Date(trackingInfo.estimatedDelivery.estimatedDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {trackingInfo.estimatedDelivery.estimatedDays} days • {trackingInfo.estimatedDelivery.confidence} confidence
                  </p>
                </div>
              )}

              {trackingInfo.order.trackingUrl && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(trackingInfo.order.trackingUrl, '_blank')}
                >
                  <i className="fas fa-external-link-alt mr-2"></i>
                  Track with Courier
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {trackingInfo.timeline.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-clock text-4xl text-secondary-300 mb-4"></i>
                  <p className="text-secondary-500">No timeline events available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {trackingInfo.timeline.map((event, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                          <i className={getTimelineIcon(event.eventType, event.status)}></i>
                        </div>
                        {index < trackingInfo.timeline.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-secondary-900">{event.description}</h4>
                          <Badge className={event.status === "success" ? "bg-success-100 text-success-800" : "bg-secondary-100 text-secondary-800"}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-secondary-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                        {event.location && (
                          <p className="text-xs text-secondary-400 mt-1">
                            <i className="fas fa-map-marker-alt mr-1"></i>
                            {event.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-secondary-400">
                  Last updated: {new Date(trackingInfo.lastUpdate).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Results State */}
      {!isLoading && !error && !trackingInfo && submittedQuery && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <i className="fas fa-search text-4xl text-secondary-300 mb-4"></i>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No Results</h3>
              <p className="text-secondary-500">Enter a tracking number to search for package information</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
