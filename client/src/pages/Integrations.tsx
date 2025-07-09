import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, TestTube, CheckCircle, XCircle, Clock, Zap, Plus, ChevronDown, ChevronRight, Store, Package, FileText, Activity, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Integration {
  id: number;
  name: string;
  type: string;
  category: string;
  isEnabled: boolean;
  config?: any;
  lastSyncAt?: string;
  successCount: number;
  failureCount: number;
  lastError?: string;
}

const integrationConfigs = {
  ecommerce: [
    { name: "shopify", title: "Shopify", description: "Connect your Shopify store", icon: "🛍️" },
    { name: "salla", title: "Salla", description: "Saudi e-commerce platform", icon: "🏬" },
    { name: "zid", title: "Zid", description: "MENA region e-commerce", icon: "🛒" },
    { name: "woocommerce", title: "WooCommerce", description: "WordPress e-commerce", icon: "🌐" },
    { name: "amazon", title: "Amazon", description: "Amazon marketplace", icon: "📦" },
    { name: "magento", title: "Magento", description: "Enterprise e-commerce platform", icon: "🏪" },
    { name: "bigcommerce", title: "BigCommerce", description: "Cloud-based e-commerce", icon: "☁️" },
    { name: "ebay", title: "eBay", description: "Online auction marketplace", icon: "🔨" },
  ],
  courier: [
    { name: "aramex", title: "Aramex", description: "Regional shipping partner", icon: "📮" },
    { name: "fastlo", title: "Fastlo", description: "Local delivery service", icon: "🚚" },
    { name: "naqel", title: "Naqel", description: "Saudi postal service", icon: "📬" },
    { name: "smsa", title: "SMSA", description: "Express delivery", icon: "⚡" },
    { name: "dhl", title: "DHL", description: "International express delivery", icon: "✈️" },
    { name: "fedex", title: "FedEx", description: "Global courier service", icon: "🌍" },
    { name: "ups", title: "UPS", description: "United Parcel Service", icon: "📦" },
  ],
  messaging: [
    { name: "twilio_whatsapp", title: "Twilio WhatsApp", description: "WhatsApp messaging", icon: "💬" },
    { name: "infobip", title: "Infobip", description: "Multi-channel messaging", icon: "📱" },
    { name: "zenvia", title: "Zenvia", description: "Customer engagement", icon: "💬" },
    { name: "whatsapp_business", title: "WhatsApp Business", description: "Direct WhatsApp API", icon: "💚" },
    { name: "telegram", title: "Telegram Bot", description: "Telegram messaging", icon: "✈️" },
  ],
  payments: [
    { name: "tabby", title: "Tabby", description: "Buy now, pay later", icon: "💳" },
    { name: "tamara", title: "Tamara", description: "Flexible payments", icon: "💰" },
    { name: "mada", title: "MADA", description: "Saudi payment network", icon: "🏦" },
    { name: "stripe", title: "Stripe", description: "Global payment processor", icon: "💳" },
    { name: "paypal", title: "PayPal", description: "Digital payment platform", icon: "🟦" },
  ],
  erp: [
    { name: "sap", title: "SAP", description: "Enterprise resource planning", icon: "🏢" },
    { name: "ms_dynamics", title: "MS Dynamics", description: "Microsoft business apps", icon: "🖥️" },
    { name: "zoho", title: "Zoho", description: "Business software suite", icon: "⚡" },
    { name: "oracle", title: "Oracle ERP", description: "Enterprise cloud applications", icon: "🔶" },
    { name: "netsuite", title: "NetSuite", description: "Cloud business suite", icon: "☁️" },
  ],
  analytics: [
    { name: "ga4", title: "Google Analytics 4", description: "Web analytics", icon: "📊" },
    { name: "mixpanel", title: "Mixpanel", description: "Product analytics", icon: "📈" },
    { name: "powerbi", title: "Power BI", description: "Business intelligence", icon: "📊" },
    { name: "tableau", title: "Tableau", description: "Data visualization platform", icon: "📊" },
    { name: "amplitude", title: "Amplitude", description: "Digital analytics platform", icon: "📈" },
  ],
  verification: [
    { name: "spl", title: "SPL NAD", description: "Saudi National Address Database", icon: "📍" },
    { name: "nas", title: "NAS API", description: "National Address Service", icon: "🗺️" },
  ]
};

interface ShopifyStore {
  id: string;
  name: string;
  storeUrl: string;
  isEnabled: boolean;
  lastSync: string;
  orderCount: number;
  skuCount: number;
  syncLogs: Array<{
    timestamp: string;
    status: 'success' | 'error';
    message: string;
  }>;
}

export default function Integrations() {
  const [activeTab, setActiveTab] = useState("ecommerce");
  const [configDialogOpen, setConfigDialogOpen] = useState<string | null>(null);
  const [expandedShopify, setExpandedShopify] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [shopifyModalOpen, setShopifyModalOpen] = useState(false);
  const [shopifyActiveTab, setShopifyActiveTab] = useState("credentials");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["/api/integrations"],
  });

  // Mock Shopify stores data - in real app, this would come from API
  const mockShopifyStores: ShopifyStore[] = [
    {
      id: "store-1",
      name: "Main Store",
      storeUrl: "saylogix-demo.myshopify.com",
      isEnabled: true,
      lastSync: "2025-07-09T08:00:00Z",
      orderCount: 14,
      skuCount: 156,
      syncLogs: [
        { timestamp: "2025-07-09T08:00:00Z", status: "success", message: "Synced 14 orders successfully" },
        { timestamp: "2025-07-09T07:45:00Z", status: "success", message: "Inventory sync completed" },
        { timestamp: "2025-07-09T07:30:00Z", status: "error", message: "Rate limit exceeded, retrying..." },
      ]
    }
  ];

  const { data: shopifyOrders } = useQuery({
    queryKey: ["/api/orders"],
    select: (data) => data?.filter((order: any) => order.sourceChannel === 'Shopify') || []
  });

  const { data: shopifySkus } = useQuery({
    queryKey: ["/api/inventory"],
    select: (data) => data?.filter((item: any) => item.source === 'Shopify') || []
  });

  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ name, enabled }: { name: string; enabled: boolean }) => {
      const response = await fetch(`/api/integrations/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          type: name,
          category: activeTab,
          isEnabled: enabled 
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({ title: "Integration updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update integration", variant: "destructive" });
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/integrations/${name}/test`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: (result, name) => {
      if (result.success) {
        toast({ title: "Connection successful", description: result.message });
      } else {
        toast({ title: "Connection failed", description: result.message, variant: "destructive" });
      }
    },
    onError: () => {
      toast({ title: "Test failed", variant: "destructive" });
    }
  });

  const saveConfigMutation = useMutation({
    mutationFn: async ({ name, config }: { name: string; config: any }) => {
      const endpoint = name === "shopify" ? `/api/integrations/shopify/simple` : `/api/integrations/${name}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(name === "shopify" ? config : {
          type: name,
          category: activeTab,
          config,
          isEnabled: true
        }),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error.error || "Failed to save configuration");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({ 
        title: "Configuration saved successfully",
        description: "Connection validation in progress..."
      });
      setConfigDialogOpen(null);
      
      // Refresh after a short delay to show updated status
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      }, 2000);
    },
    onError: (error) => {
      toast({ title: "Failed to save configuration", description: error.message, variant: "destructive" });
    }
  });

  const getIntegration = (name: string): Integration | undefined => {
    return integrations.find((i: Integration) => i.name === name);
  };

  const getStatusColor = (integration: Integration | undefined) => {
    if (!integration || !integration.isEnabled) return "gray";
    if (integration.lastError) return "red";
    if (integration.lastSyncAt) return "green";
    return "yellow";
  };

  const getStatusIcon = (integration: Integration | undefined) => {
    if (!integration || !integration.isEnabled) return <XCircle className="h-4 w-4" />;
    if (integration.lastError) return <XCircle className="h-4 w-4" />;
    if (integration.lastSyncAt) return <CheckCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const ConfigForm = ({ integrationName, onClose }: { integrationName: string; onClose: () => void }) => {
    const form = useForm({
      defaultValues: getIntegration(integrationName)?.config || {},
    });

    const getConfigFields = (name: string) => {
      switch (name) {
        case "shopify":
          return [
            { name: "storeUrl", label: "Store URL", type: "text", placeholder: "your-store.myshopify.com", required: true },
            { name: "adminApiKey", label: "Admin API Key", type: "password", placeholder: "shpat_xxxxx", required: true },
            { name: "adminApiSecret", label: "Admin API Secret", type: "password", placeholder: "Enter admin API secret" },
            { name: "accessToken", label: "Access Token", type: "password", placeholder: "Enter access token" },
          ];
        case "aramex":
          return [
            { name: "contractName", label: "Contract Name", type: "text", placeholder: "Main Contract" },
            { name: "username", label: "Username", type: "text", placeholder: "Enter username" },
            { name: "password", label: "Password", type: "password", placeholder: "Enter password" },
            { name: "accountNumber", label: "Account Number", type: "text", placeholder: "Enter account number" },
            { name: "pickupZone", label: "Pickup Zone", type: "text", placeholder: "Enter pickup zone" },
          ];
        case "fastlo":
          return [
            { name: "contractName", label: "Contract Name", type: "text", placeholder: "Main Contract" },
            { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter API key" },
            { name: "clientId", label: "Client ID", type: "text", placeholder: "Enter client ID" },
            { name: "pickupZone", label: "Pickup Zone", type: "text", placeholder: "Enter pickup zone" },
          ];
        case "google_maps":
          return [
            { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter Google Maps API key" },
          ];
        case "spl":
          return [
            { name: "apiToken", label: "API Token", type: "password", placeholder: "Enter SPL API token" },
            { name: "baseUrl", label: "Base URL", type: "text", placeholder: "https://api.splonline.com.sa/v1" },
          ];
        case "nas":
          return [
            { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter NAS API key" },
            { name: "baseUrl", label: "Base URL", type: "text", placeholder: "Enter NAS API base URL" },
          ];
        default:
          return [
            { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter API key" },
            { name: "baseUrl", label: "Base URL", type: "text", placeholder: "Enter base URL" },
          ];
      }
    };

    const fields = getConfigFields(integrationName);

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => saveConfigMutation.mutate({ name: integrationName, config: data }))} className="space-y-4">
          {fields.map((field) => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input 
                      type={field.type} 
                      placeholder={field.placeholder} 
                      {...formField} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saveConfigMutation.isPending}>
              {saveConfigMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    );
  };

  // Enhanced Shopify configuration modal
  const ShopifyConfigModal = () => {
    const form = useForm({
      defaultValues: {
        storeName: '',
        storeUrl: '',
        adminApiKey: '',
        adminApiSecret: '',
        accessToken: ''
      }
    });

    return (
      <Dialog open={shopifyModalOpen} onOpenChange={setShopifyModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Shopify Integration Management</DialogTitle>
            <DialogDescription>
              Manage your Shopify store connections, view synced data, and monitor sync status
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={shopifyActiveTab} onValueChange={setShopifyActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="skus">SKUs ({shopifySkus?.length || 0})</TabsTrigger>
              <TabsTrigger value="orders">Orders ({shopifyOrders?.length || 0})</TabsTrigger>
              <TabsTrigger value="logs">Sync Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="credentials" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium">Connected Stores</h4>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Store
                  </Button>
                </div>
                
                {mockShopifyStores.map((store) => (
                  <Card key={store.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Store className="h-5 w-5 text-blue-600" />
                        <div>
                          <h5 className="font-medium">{store.name}</h5>
                          <p className="text-sm text-gray-500">{store.storeUrl}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={store.isEnabled ? "default" : "secondary"}>
                          {store.isEnabled ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm">Edit</Button>
                        <Switch checked={store.isEnabled} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{store.orderCount}</p>
                        <p className="text-sm text-gray-500">Orders Synced</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{store.skuCount}</p>
                        <p className="text-sm text-gray-500">SKUs Synced</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Last Sync</p>
                        <p className="text-sm text-gray-500">{new Date(store.lastSync).toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="skus" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">Synced SKUs from Shopify</h4>
                <Button variant="outline" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Sync SKUs Now
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopifySkus?.slice(0, 10).map((sku: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{sku.sku}</TableCell>
                      <TableCell>{sku.name || "Product Name"}</TableCell>
                      <TableCell>{sku.quantity || 0}</TableCell>
                      <TableCell>${sku.price || "0.00"}</TableCell>
                      <TableCell>
                        <Badge variant="default">Synced</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!shopifySkus || shopifySkus.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                        No SKUs found. Click "Sync SKUs Now" to fetch from Shopify.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="orders" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">Recent Shopify Orders</h4>
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Sync Orders Now
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Saylogix ID</TableHead>
                    <TableHead>Shopify Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Address Status</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shopifyOrders?.slice(0, 10).map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.saylogixNumber}</TableCell>
                      <TableCell>{order.sourceOrderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {order.city && order.region ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Not Verified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{order.totalAmount} {order.currency}</TableCell>
                    </TableRow>
                  ))}
                  {(!shopifyOrders || shopifyOrders.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No orders found. All Shopify orders will appear here, including those with incomplete addresses.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="logs" className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">Sync Activity Log</h4>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Store</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockShopifyStores[0]?.syncLogs.map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                          {log.status === 'success' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <XCircle className="h-3 w-3 mr-1" />
                          )}
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.message}</TableCell>
                      <TableCell>Main Store</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  const renderShopifyCard = (config: any) => {
    const integration = getIntegration(config.name);
    const statusColor = getStatusColor(integration);
    const statusIcon = getStatusIcon(integration);

    return (
      <Card key={config.name} className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <Badge variant={statusColor === "green" ? "default" : statusColor === "red" ? "destructive" : "secondary"}>
                {statusIcon}
              </Badge>
            </div>
            <Switch
              checked={integration?.isEnabled || false}
              onCheckedChange={(checked) =>
                toggleIntegrationMutation.mutate({ name: config.name, enabled: checked })
              }
            />
          </div>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {integration && (
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Connected Stores:</span>
                <span className="font-medium">{mockShopifyStores.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Orders:</span>
                <span className="font-medium">{shopifyOrders?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Synced SKUs:</span>
                <span className="font-medium">{shopifySkus?.length || 0}</span>
              </div>
              {integration.lastSyncAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="font-medium text-xs">
                    {new Date(integration.lastSyncAt).toLocaleString()}
                  </span>
                </div>
              )}
              {integration.lastError && (
                <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
                  {integration.lastError}
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => setShopifyModalOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const response = await fetch(`/api/integrations/shopify/test`);
                  const result = await response.json();
                  if (result.success) {
                    toast({ title: "Connection successful", description: result.message });
                  } else {
                    toast({ title: "Connection failed", description: result.message, variant: "destructive" });
                  }
                } catch (error) {
                  toast({ title: "Test failed", variant: "destructive" });
                }
              }}
              disabled={!integration?.isEnabled}
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>

          {/* Quick Actions */}
          {integration?.isEnabled && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={async () => {
                  try {
                    const response = await fetch("/api/shopify/sync", {
                      method: "POST",
                    });
                    const result = await response.json();
                    toast({ title: "Sync started", description: result.message || "Syncing orders from Shopify" });
                    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
                  } catch (error) {
                    toast({ title: "Sync failed", variant: "destructive" });
                  }
                }}
              >
                <Zap className="h-4 w-4 mr-2" />
                Quick Sync
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShopifyModalOpen(true);
                  setShopifyActiveTab("orders");
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                View Orders
              </Button>
            </div>
          )}
        </CardContent>
        
        <ShopifyConfigModal />
      </Card>
    );
  };

  const renderIntegrationCard = (config: any) => {
    // Use special Shopify card for Shopify integration
    if (config.name === "shopify") {
      return renderShopifyCard(config);
    }

    // Default card for other integrations
    const integration = getIntegration(config.name);
    const statusColor = getStatusColor(integration);
    const statusIcon = getStatusIcon(integration);

    return (
      <Card key={config.name} className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{config.title}</CardTitle>
              <Badge variant={statusColor === "green" ? "default" : statusColor === "red" ? "destructive" : "secondary"}>
                {statusIcon}
              </Badge>
            </div>
            <Switch
              checked={integration?.isEnabled || false}
              onCheckedChange={(checked) =>
                toggleIntegrationMutation.mutate({ name: config.name, enabled: checked })
              }
            />
          </div>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {integration && (
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Success Rate:</span>
                <span className="font-medium">
                  {integration.successCount + integration.failureCount > 0
                    ? Math.round((integration.successCount / (integration.successCount + integration.failureCount)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failures:</span>
                <span className="font-medium">{integration.failureCount}</span>
              </div>
              {integration.lastSyncAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="font-medium text-xs">
                    {new Date(integration.lastSyncAt).toLocaleString()}
                  </span>
                </div>
              )}
              {integration.lastError && (
                <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
                  {integration.lastError}
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Dialog open={configDialogOpen === config.name} onOpenChange={(open) => setConfigDialogOpen(open ? config.name : null)}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configure {config.title}</DialogTitle>
                  <DialogDescription>
                    Set up your {config.title} integration credentials and settings
                  </DialogDescription>
                </DialogHeader>
                <ConfigForm 
                  integrationName={config.name} 
                  onClose={() => setConfigDialogOpen(null)} 
                />
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const endpoint = config.name === "shopify" ? `/api/integrations/shopify/test` : `/api/integrations/${config.name}/test`;
                  const response = await fetch(endpoint);
                  const result = await response.json();
                  if (result.success) {
                    toast({ title: "Connection successful", description: result.message });
                  } else {
                    toast({ title: "Connection failed", description: result.message, variant: "destructive" });
                  }
                } catch (error) {
                  toast({ title: "Test failed", variant: "destructive" });
                }
              }}
              disabled={!integration?.isEnabled}
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>



          {/* Courier specific info */}
          {(config.name === "aramex" || config.name === "fastlo") && integration?.isEnabled && integration?.config && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Contract:</span>
                  <span className="font-medium">{integration.config.contractName || "Main Contract"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup Zone:</span>
                  <span className="font-medium">{integration.config.pickupZone || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-medium text-gray-400">••••••••</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return <div className="p-6">Loading integrations...</div>;
  }

  return (
    <div className="p-6">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="ecommerce">
            <span className="hidden sm:inline">E-Commerce</span>
            <span className="sm:hidden">E-Com</span>
          </TabsTrigger>
          <TabsTrigger value="courier">Courier</TabsTrigger>
          <TabsTrigger value="messaging">
            <span className="hidden sm:inline">Messaging</span>
            <span className="sm:hidden">Msg</span>
          </TabsTrigger>
          <TabsTrigger value="payments">
            <span className="hidden sm:inline">Payments</span>
            <span className="sm:hidden">Pay</span>
          </TabsTrigger>
          <TabsTrigger value="erp">ERP</TabsTrigger>
          <TabsTrigger value="analytics">
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="verification">
            <span className="hidden sm:inline">Verification</span>
            <span className="sm:hidden">Verify</span>
          </TabsTrigger>
        </TabsList>

        {Object.entries(integrationConfigs).map(([category, configs]) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {configs.map(renderIntegrationCard)}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}