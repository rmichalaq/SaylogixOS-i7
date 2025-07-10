import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Loader2, AlertCircle, CheckCircle, Database, Trash2, BarChart } from "lucide-react";

export default function AdminPanel() {
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/admin/mock-data-status"],
    queryFn: async () => {
      const res = await fetch("/api/admin/mock-data-status");
      if (!res.ok) throw new Error("Failed to fetch status");
      return res.json();
    }
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/seed-mock-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to seed data");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mock-data-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/manifests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inbound"] });
    }
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/clear-mock-data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to clear data");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mock-data-status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/manifests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inbound"] });
    }
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Admin Panel - Mock Data Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Mock Data Status
          </CardTitle>
          <CardDescription>
            Current state of mock data in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading status...
            </div>
          ) : status ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {status.hasMockData ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Mock data present</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">No mock data found</span>
                  </>
                )}
              </div>
              
              {status.hasMockData && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Core Business</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.orders || 0}</div>
                      <div className="text-sm text-muted-foreground">Mock Orders</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.orderItems || 0}</div>
                      <div className="text-sm text-muted-foreground">Order Items</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.inventory || 0}</div>
                      <div className="text-sm text-muted-foreground">Inventory</div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mt-4">WMS Operations</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.pickTasks || 0}</div>
                      <div className="text-sm text-muted-foreground">Pick Tasks</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.packTasks || 0}</div>
                      <div className="text-sm text-muted-foreground">Pack Tasks</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.manifests || 0}</div>
                      <div className="text-sm text-muted-foreground">Manifests</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.manifestItems || 0}</div>
                      <div className="text-sm text-muted-foreground">Manifest Items</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.routes || 0}</div>
                      <div className="text-sm text-muted-foreground">Routes</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.routeStops || 0}</div>
                      <div className="text-sm text-muted-foreground">Route Stops</div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mt-4">Inbound Management</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.purchaseOrders || 0}</div>
                      <div className="text-sm text-muted-foreground">Purchase Orders</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.goodsReceiptNotes || 0}</div>
                      <div className="text-sm text-muted-foreground">GRNs</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.putawayTasks || 0}</div>
                      <div className="text-sm text-muted-foreground">Putaway Tasks</div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mt-4">Inventory Control</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.inventoryAdjustments || 0}</div>
                      <div className="text-sm text-muted-foreground">Adjustments</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.cycleCountTasks || 0}</div>
                      <div className="text-sm text-muted-foreground">Cycle Counts</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.productExpiry || 0}</div>
                      <div className="text-sm text-muted-foreground">Expiry Records</div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-muted-foreground mt-4">System & Configuration</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.addressVerifications || 0}</div>
                      <div className="text-sm text-muted-foreground">Address Verifications</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.events || 0}</div>
                      <div className="text-sm text-muted-foreground">System Events</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.webhookLogs || 0}</div>
                      <div className="text-sm text-muted-foreground">Webhook Logs</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.nasLookups || 0}</div>
                      <div className="text-sm text-muted-foreground">NAS Lookups</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.integrations || 0}</div>
                      <div className="text-sm text-muted-foreground">Integrations</div>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-2xl font-bold">{status.breakdown.warehouseZones || 0}</div>
                      <div className="text-sm text-muted-foreground">Warehouse Zones</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Seed Mock Data
            </CardTitle>
            <CardDescription>
              Create realistic test data across all modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => seedMutation.mutate()}
              disabled={seedMutation.isPending}
              className="w-full"
            >
              {seedMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Data...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Mock Data
                </>
              )}
            </Button>
            {seedMutation.isSuccess && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Mock data seeded successfully!
                </AlertDescription>
              </Alert>
            )}
            {seedMutation.isError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {seedMutation.error?.message || "Failed to seed mock data"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Clear Mock Data
            </CardTitle>
            <CardDescription>
              Remove all mock data from the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending || !status?.hasMockData}
              variant="destructive"
              className="w-full"
            >
              {clearMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Clearing Data...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Mock Data
                </>
              )}
            </Button>
            {clearMutation.isSuccess && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Mock data cleared successfully!
                </AlertDescription>
              </Alert>
            )}
            {clearMutation.isError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {clearMutation.error?.message || "Failed to clear mock data"}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> Mock data is designed to be easily identifiable with MOCK_ prefixes. 
          This data helps test UI functionality across all modules without affecting real operations.
        </AlertDescription>
      </Alert>
    </div>
  );
}