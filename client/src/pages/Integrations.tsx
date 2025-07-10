import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, TestTube, CheckCircle, XCircle, Clock, Zap, Plus, ChevronDown, ChevronRight, Store, Package, FileText, Activity, AlertTriangle, ShoppingCart, Truck, MessageSquare, CreditCard, Building2, BarChart3, MapPin, Box } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
    { name: "shopify", title: "Shopify", description: "Connect your Shopify store", logo: "https://cdn.worldvectorlogo.com/logos/shopify.svg" },
    { name: "salla", title: "Salla", description: "Saudi e-commerce platform", logo: null },
    { name: "zid", title: "Zid", description: "MENA region e-commerce", logo: null },
    { name: "woocommerce", title: "WooCommerce", description: "WordPress e-commerce", logo: "https://cdn.worldvectorlogo.com/logos/woocommerce.svg" },
    { name: "amazon", title: "Amazon", description: "Amazon marketplace", logo: "https://cdn.worldvectorlogo.com/logos/amazon-icon-1.svg" },
    { name: "magento", title: "Magento", description: "Enterprise e-commerce platform", logo: "https://cdn.worldvectorlogo.com/logos/magento.svg" },
    { name: "bigcommerce", title: "BigCommerce", description: "Cloud-based e-commerce", logo: "https://cdn.worldvectorlogo.com/logos/bigcommerce-icon.svg" },
    { name: "ebay", title: "eBay", description: "Online auction marketplace", logo: "https://cdn.worldvectorlogo.com/logos/ebay-3.svg" },
  ],
  courier: [
    { name: "aramex", title: "Aramex", description: "Regional shipping partner", logo: "https://cdn.worldvectorlogo.com/logos/aramex-logo.svg" },
    { name: "fastlo", title: "Fastlo", description: "Local delivery service", logo: null },
    { name: "naqel", title: "Naqel", description: "Saudi postal service", logo: null },
    { name: "smsa", title: "SMSA", description: "Express delivery", logo: null },
    { name: "dhl", title: "DHL", description: "International express delivery", logo: "https://cdn.worldvectorlogo.com/logos/dhl-1.svg" },
    { name: "fedex", title: "FedEx", description: "Global courier service", logo: "https://cdn.worldvectorlogo.com/logos/fedex-logo-2.svg" },
    { name: "ups", title: "UPS", description: "United Parcel Service", logo: "https://cdn.worldvectorlogo.com/logos/ups.svg" },
  ],
  messaging: [
    { name: "twilio_whatsapp", title: "Twilio WhatsApp", description: "WhatsApp messaging", logo: "https://cdn.worldvectorlogo.com/logos/twilio-2.svg" },
    { name: "infobip", title: "Infobip", description: "Multi-channel messaging", logo: null },
    { name: "zenvia", title: "Zenvia", description: "Customer engagement", logo: null },
    { name: "whatsapp_business", title: "WhatsApp Business", description: "Direct WhatsApp API", logo: "https://cdn.worldvectorlogo.com/logos/whatsapp-icon.svg" },
    { name: "telegram", title: "Telegram Bot", description: "Telegram messaging", logo: "https://cdn.worldvectorlogo.com/logos/telegram-1.svg" },
  ],
  payments: [
    { name: "tabby", title: "Tabby", description: "Buy now, pay later", logo: null },
    { name: "tamara", title: "Tamara", description: "Flexible payments", logo: null },
    { name: "mada", title: "MADA", description: "Saudi payment network", logo: null },
    { name: "stripe", title: "Stripe", description: "Global payment processor", logo: "https://cdn.worldvectorlogo.com/logos/stripe-4.svg" },
    { name: "paypal", title: "PayPal", description: "Digital payment platform", logo: "https://cdn.worldvectorlogo.com/logos/paypal-2.svg" },
  ],
  erp: [
    { name: "sap", title: "SAP", description: "Enterprise resource planning", logo: "https://cdn.worldvectorlogo.com/logos/sap-2.svg" },
    { name: "ms_dynamics", title: "MS Dynamics", description: "Microsoft business apps", logo: "https://cdn.worldvectorlogo.com/logos/dynamics-365-1.svg" },
    { name: "zoho", title: "Zoho", description: "Business software suite", logo: "https://cdn.worldvectorlogo.com/logos/zoho-2.svg" },
    { name: "oracle", title: "Oracle ERP", description: "Enterprise cloud applications", logo: "https://cdn.worldvectorlogo.com/logos/oracle-6.svg" },
    { name: "netsuite", title: "NetSuite", description: "Cloud business suite", logo: "https://cdn.worldvectorlogo.com/logos/netsuite-1.svg" },
  ],
  analytics: [
    { name: "ga4", title: "Google Analytics 4", description: "Web analytics", logo: "https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg" },
    { name: "mixpanel", title: "Mixpanel", description: "Product analytics", logo: "https://cdn.worldvectorlogo.com/logos/mixpanel.svg" },
    { name: "powerbi", title: "Power BI", description: "Business intelligence", logo: "https://cdn.worldvectorlogo.com/logos/microsoft-power-bi-2.svg" },
    { name: "tableau", title: "Tableau", description: "Data visualization platform", logo: "https://cdn.worldvectorlogo.com/logos/tableau-software.svg" },
    { name: "amplitude", title: "Amplitude", description: "Digital analytics platform", logo: null },
  ],
  maps: [
    { name: "google_maps", title: "Google Maps", description: "Maps API for address verification", logo: "https://cdn.worldvectorlogo.com/logos/google-maps-2020-icon.svg" },
    { name: "mapbox", title: "Mapbox", description: "Mapbox maps and geocoding", logo: "https://cdn.worldvectorlogo.com/logos/mapbox-2.svg" },
  ],
  other: [
    { name: "spl", title: "SPL NAD", description: "Saudi National Address Database", logo: null },
    { name: "nas", title: "NAS API", description: "National Address Service", logo: null },
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
  const [activeTab, setActiveTab] = useState("marketplace");
  const [marketplaceSubTab, setMarketplaceSubTab] = useState("ecommerce");
  const [connectedSubTab, setConnectedSubTab] = useState("ecommerce");
  const [configDialogOpen, setConfigDialogOpen] = useState<string | null>(null);
  const [expandedShopify, setExpandedShopify] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [shopifyModalOpen, setShopifyModalOpen] = useState(false);
  const [shopifyActiveTab, setShopifyActiveTab] = useState("credentials");
  const [shopifyDrawerOpen, setShopifyDrawerOpen] = useState(false);
  const [shopifyDrawerTab, setShopifyDrawerTab] = useState("credentials");
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

  // Helper to get icon for a category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ecommerce': return <ShoppingCart className="h-4 w-4" />;
      case 'courier': return <Truck className="h-4 w-4" />;
      case 'messaging': return <MessageSquare className="h-4 w-4" />;
      case 'payments': return <CreditCard className="h-4 w-4" />;
      case 'erp': return <Building2 className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'maps': return <MapPin className="h-4 w-4" />;
      case 'other': return <Box className="h-4 w-4" />;
      default: return <Box className="h-4 w-4" />;
    }
  };

  // Marketplace card - uniform layout for all integrations
  const renderMarketplaceCard = (config: any) => {
    const integration = getIntegration(config.name);
    
    return (
      <Card key={config.name} className="h-56 flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div className="h-8 w-8 flex items-center justify-center">
              {config.logo ? (
                <img 
                  src={config.logo} 
                  alt={config.title} 
                  className="h-8 w-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Box className={`h-8 w-8 text-gray-400 fallback-icon ${config.logo ? 'hidden' : ''}`} />
            </div>
          </div>
          <CardTitle className="text-lg truncate">{config.title}</CardTitle>
          <CardDescription className="line-clamp-2">{config.description}</CardDescription>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-end">
          <Dialog open={configDialogOpen === config.name} onOpenChange={(open) => setConfigDialogOpen(open ? config.name : null)}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
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
        </CardContent>
      </Card>
    );
  };

  // Connected integrations card - shows detailed info for active integrations
  const renderConnectedCard = (config: any) => {
    const integration = getIntegration(config.name);
    if (!integration?.isEnabled) return null;

    // Special handling for Shopify to match new design requirements
    if (config.name === "shopify") {
      return (
        <Card key={config.name} className="h-56 flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 flex items-center justify-center">
                {config.logo ? (
                  <img 
                    src={config.logo} 
                    alt={config.title} 
                    className="h-8 w-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <Box className={`h-8 w-8 text-gray-400 fallback-icon ${config.logo ? 'hidden' : ''}`} />
              </div>
            </div>
            <CardTitle className="text-lg">{config.title}</CardTitle>
            <CardDescription>
              {mockShopifyStores.length} Connected Store{mockShopifyStores.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col justify-end">
            <Sheet open={shopifyDrawerOpen} onOpenChange={setShopifyDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[600px] sm:max-w-[600px]">
                <SheetHeader>
                  <SheetTitle>Shopify Integration</SheetTitle>
                  <SheetDescription>
                    Manage your Shopify store connections and view sync activity
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <Tabs value={shopifyDrawerTab} onValueChange={setShopifyDrawerTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="credentials">Credentials</TabsTrigger>
                      <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="credentials" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium">Connected Stores</h4>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Store
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {mockShopifyStores.map((store) => (
                          <Card key={store.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-medium">{store.name}</h5>
                                  <p className="text-sm text-gray-600">{store.storeUrl}</p>
                                  <div className="flex items-center gap-4 mt-2 text-sm">
                                    <span className="text-gray-600">
                                      {store.orderCount} orders synced
                                    </span>
                                    <span className="text-gray-600">
                                      {store.skuCount} SKUs synced
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={store.isEnabled ? "default" : "secondary"}>
                                    {store.isEnabled ? "Active" : "Inactive"}
                                  </Badge>
                                  <Button variant="outline" size="sm">
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {mockShopifyStores.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No stores connected yet</p>
                            <Button>
                              <Plus className="h-4 w-4 mr-2" />
                              Add New Store
                            </Button>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="sync-logs" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium">Sync Activity Log</h4>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Export Logs
                        </Button>
                      </div>
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {mockShopifyStores[0]?.syncLogs.map((log, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 border rounded">
                            <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                              {log.status === 'success' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {log.status}
                            </Badge>
                            <div className="flex-1">
                              <p className="text-sm">{log.message}</p>
                              <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                        
                        {(!mockShopifyStores[0]?.syncLogs || mockShopifyStores[0].syncLogs.length === 0) && (
                          <div className="text-center py-8">
                            <p className="text-gray-500">No sync activity yet</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
          </CardContent>
        </Card>
      );
    }

    // Default card for other integrations
    const statusColor = getStatusColor(integration);
    const statusIcon = getStatusIcon(integration);

    return (
      <Card key={config.name} className="h-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-6 w-6 flex items-center justify-center flex-shrink-0">
              {config.logo ? (
                <img 
                  src={config.logo} 
                  alt={config.title} 
                  className="h-6 w-6 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Box className={`h-6 w-6 text-gray-400 fallback-icon ${config.logo ? 'hidden' : ''}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{config.title}</CardTitle>
                  <Badge variant={statusColor === "green" ? "default" : statusColor === "red" ? "destructive" : "secondary"}>
                    {statusIcon}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col items-center justify-center h-16 bg-gray-50 rounded">
              <div className="text-2xl font-semibold">0</div>
              <div className="text-xs text-gray-600">Processed</div>
            </div>
            <div className="flex flex-col items-center justify-center h-16 bg-gray-50 rounded">
              <div className="text-2xl font-semibold">0</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Dialog open={configDialogOpen === config.name} onOpenChange={(open) => setConfigDialogOpen(open ? config.name : null)}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configure {config.title}</DialogTitle>
                  <DialogDescription>
                    Update your {config.title} integration credentials and settings
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
              size="sm"
              onClick={async () => {
                try {
                  const endpoint = `/api/integrations/${config.name}/test`;
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
            >
              Test
            </Button>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-xs text-gray-600">
              {integration.lastSyncAt && `Last sync: ${new Date(integration.lastSyncAt).toLocaleString()}`}
            </div>
            <Button 
              variant="link" 
              size="sm"
              className="text-red-600 hover:text-red-700 p-0 h-auto"
              onClick={() => toggleIntegrationMutation.mutate({ name: config.name, enabled: false })}
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderIntegrationCard = (config: any) => {
    // Use marketplace card for marketplace tab
    if (activeTab === "marketplace") {
      return renderMarketplaceCard(config);
    }
    
    // Use connected card for connected tab
    return renderConnectedCard(config);
  };

  // Helper to get all integrations for marketplace
  const getAllIntegrations = () => {
    return Object.values(integrationConfigs).flat();
  };

  // Helper to get connected integrations grouped by category
  const getConnectedIntegrations = () => {
    const connected: { [key: string]: any[] } = {};
    
    Object.entries(integrationConfigs).forEach(([category, configs]) => {
      const connectedInCategory = configs.filter(config => {
        const integration = getIntegration(config.name);
        return integration?.isEnabled;
      });
      
      if (connectedInCategory.length > 0) {
        connected[category] = connectedInCategory;
      }
    });
    
    return connected;
  };





  if (isLoading) {
    return <div className="p-6">Loading integrations...</div>;
  }

  return (
    <div className="p-6">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="connected">Connected Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="mt-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Integration Marketplace</h3>
            <p className="text-gray-600">Browse and configure available integrations for your logistics platform</p>
          </div>
          
          <Tabs value={marketplaceSubTab} onValueChange={setMarketplaceSubTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="ecommerce" className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                <span className="hidden sm:inline">E-Commerce</span>
                <span className="sm:hidden">E-Com</span>
              </TabsTrigger>
              <TabsTrigger value="courier" className="flex items-center gap-1">
                <Truck className="h-3 w-3" />
                Courier
              </TabsTrigger>
              <TabsTrigger value="messaging" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span className="hidden sm:inline">Messaging</span>
                <span className="sm:hidden">Msg</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                <span className="hidden sm:inline">Payments</span>
                <span className="sm:hidden">Pay</span>
              </TabsTrigger>
              <TabsTrigger value="erp" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                ERP
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span className="hidden sm:inline">Analytics</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
              <TabsTrigger value="maps" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Maps
              </TabsTrigger>
              <TabsTrigger value="other" className="flex items-center gap-1">
                <Box className="h-3 w-3" />
                Other
              </TabsTrigger>
            </TabsList>

            {Object.entries(integrationConfigs).map(([category, configs]) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {configs.map(renderMarketplaceCard)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="connected" className="mt-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Connected Integrations</h3>
            <p className="text-gray-600">Manage your active integrations and view sync status</p>
          </div>
          
          {Object.keys(getConnectedIntegrations()).length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Connected Integrations</h4>
              <p className="text-gray-600 mb-4">Configure integrations from the Marketplace to get started</p>
              <Button onClick={() => setActiveTab("marketplace")}>
                Browse Marketplace
              </Button>
            </div>
          ) : (
            <Tabs value={connectedSubTab} onValueChange={setConnectedSubTab} className="w-full">
              <TabsList className="grid w-full grid-cols-8">
                <TabsTrigger value="ecommerce" className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  <span className="hidden sm:inline">E-Commerce</span>
                  <span className="sm:hidden">E-Com</span>
                </TabsTrigger>
                <TabsTrigger value="courier" className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  Courier
                </TabsTrigger>
                <TabsTrigger value="messaging" className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span className="hidden sm:inline">Messaging</span>
                  <span className="sm:hidden">Msg</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" />
                  <span className="hidden sm:inline">Payments</span>
                  <span className="sm:hidden">Pay</span>
                </TabsTrigger>
                <TabsTrigger value="erp" className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  ERP
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1">
                  <BarChart3 className="h-3 w-3" />
                  <span className="hidden sm:inline">Analytics</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger value="maps" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Maps
                </TabsTrigger>
                <TabsTrigger value="other" className="flex items-center gap-1">
                  <Box className="h-3 w-3" />
                  Other
                </TabsTrigger>
              </TabsList>

              {Object.entries(integrationConfigs).map(([category, configs]) => {
                const connectedInCategory = configs.filter(config => {
                  const integration = getIntegration(config.name);
                  return integration?.isEnabled;
                });
                
                return (
                  <TabsContent key={category} value={category} className="mt-6">
                    {connectedInCategory.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="flex justify-center mb-4">
                          {getCategoryIcon(category)}
                        </div>
                        <p className="text-gray-600 mb-4">No {category} integrations connected</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setActiveTab("marketplace");
                            setMarketplaceSubTab(category);
                          }}
                        >
                          Browse {category} integrations
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {connectedInCategory.map(renderConnectedCard)}
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}