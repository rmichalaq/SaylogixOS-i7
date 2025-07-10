import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Store, 
  Package, 
  FileText, 
  Activity, 
  AlertTriangle, 
  ShoppingCart, 
  Truck, 
  MessageSquare, 
  CreditCard, 
  Building2, 
  BarChart3, 
  MapPin, 
  Box,
  Plug,
  AlertCircle,
  Timer,
  Wifi,
  RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";

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

export default function IntegrationsRedesigned() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [marketplaceSubTab, setMarketplaceSubTab] = useState("ecommerce");
  const [connectedSubTab, setConnectedSubTab] = useState("all");
  const [configDialogOpen, setConfigDialogOpen] = useState<string | null>(null);
  const [shopifyDrawerOpen, setShopifyDrawerOpen] = useState(false);
  const [shopifyDrawerTab, setShopifyDrawerTab] = useState("credentials");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["/api/integrations"],
  });

  // Mock data for demonstration
  const mockShopifyStores: ShopifyStore[] = [
    {
      id: "store-1",
      name: "Main Store",
      storeUrl: "saylogix-demo.myshopify.com",
      isEnabled: true,
      lastSync: "2025-01-10T08:00:00Z",
      orderCount: 14,
      skuCount: 156,
      syncLogs: [
        { timestamp: "2025-01-10T08:00:00Z", status: "success", message: "Synced 14 orders successfully" },
        { timestamp: "2025-01-10T07:45:00Z", status: "success", message: "Inventory sync completed" },
        { timestamp: "2025-01-10T07:30:00Z", status: "error", message: "Rate limit exceeded, retrying..." },
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

  // Calculate KPI values
  const activeIntegrations = integrations.filter((i: Integration) => i.isEnabled).length;
  const errorsDetected = integrations.filter((i: Integration) => i.lastError).length;
  const pendingSyncs = integrations.filter((i: Integration) => i.isEnabled && (!i.lastSyncAt || new Date(i.lastSyncAt) < new Date(Date.now() - 24 * 60 * 60 * 1000))).length;
  const avgLatency = "245ms"; // Mock value

  const toggleIntegrationMutation = useMutation({
    mutationFn: ({ name, enabled }: { name: string; enabled: boolean }) => 
      apiRequest(`/api/integrations/${name}/toggle`, "POST", { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Success",
        description: "Integration status updated"
      });
    }
  });

  const saveConfigMutation = useMutation({
    mutationFn: ({ name, config }: { name: string; config: any }) => 
      apiRequest(`/api/integrations/${name}/config`, "POST", config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Success",
        description: "Configuration saved successfully"
      });
    }
  });

  const getIntegration = (name: string) => {
    return integrations.find((i: Integration) => i.name === name) || {
      name,
      isEnabled: false,
      successCount: 0,
      failureCount: 0,
      lastSyncAt: null,
      lastError: null
    };
  };

  // Configuration Form Component
  const ConfigForm = ({ integrationName, onClose }: { integrationName: string; onClose: () => void }) => {
    const configFields: { [key: string]: Array<{ name: string; label: string; type: string; placeholder: string }> } = {
      shopify: [
        { name: "storeUrl", label: "Store URL", type: "text", placeholder: "your-store.myshopify.com" },
        { name: "adminApiKey", label: "Admin API Key", type: "password", placeholder: "Enter your Admin API key" },
        { name: "adminApiSecret", label: "Admin API Secret", type: "password", placeholder: "Enter your Admin API secret" },
        { name: "accessToken", label: "Access Token", type: "password", placeholder: "Enter your access token" }
      ],
      aramex: [
        { name: "accountNumber", label: "Account Number", type: "text", placeholder: "Enter your account number" },
        { name: "username", label: "Username", type: "text", placeholder: "Enter your username" },
        { name: "password", label: "Password", type: "password", placeholder: "Enter your password" },
        { name: "accountPin", label: "Account PIN", type: "password", placeholder: "Enter your account PIN" }
      ],
      google_maps: [
        { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter your Google Maps API key" }
      ],
      spl: [
        { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter your SPL API key" },
        { name: "apiUrl", label: "API URL", type: "text", placeholder: "https://api.spl.com" }
      ]
    };

    const fields = configFields[integrationName] || [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter your API key" },
      { name: "apiUrl", label: "API URL", type: "text", placeholder: "https://api.example.com" }
    ];

    const form = useForm({
      defaultValues: fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
    });

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

  // Marketplace Card Component
  const MarketplaceCard = ({ config }: { config: any }) => {
    return (
      <Card className="h-56 flex flex-col">
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
                  Set up your {config.title} integration credentials
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

  // Connected Card Component for Shopify
  const ShopifyConnectedCard = () => {
    const integration = getIntegration('shopify');
    
    return (
      <Card className="h-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="https://cdn.worldvectorlogo.com/logos/shopify.svg" 
                alt="Shopify" 
                className="h-8 w-8 object-contain"
              />
              <div>
                <CardTitle className="text-lg">Shopify</CardTitle>
                <CardDescription className="text-sm">Main Store</CardDescription>
              </div>
            </div>
            <Badge variant="default">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col items-center justify-center h-16 bg-gray-50 rounded">
              <div className="text-2xl font-semibold">{mockShopifyStores[0]?.orderCount || 0}</div>
              <div className="text-xs text-gray-600">Orders Synced</div>
            </div>
            <div className="flex flex-col items-center justify-center h-16 bg-gray-50 rounded">
              <div className="text-2xl font-semibold">{mockShopifyStores[0]?.skuCount || 0}</div>
              <div className="text-xs text-gray-600">SKUs Synced</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Sheet open={shopifyDrawerOpen} onOpenChange={setShopifyDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
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
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="credentials">Credentials</TabsTrigger>
                      <TabsTrigger value="skus">SKUs</TabsTrigger>
                      <TabsTrigger value="orders">Orders</TabsTrigger>
                      <TabsTrigger value="logs">Logs</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="credentials" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium">Connected Stores</h4>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Store
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
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="skus" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium">Synced SKUs</h4>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </Button>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>SKU</TableHead>
                              <TableHead>Product</TableHead>
                              <TableHead>Stock</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {shopifySkus?.slice(0, 5).map((sku: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{sku.sku}</TableCell>
                                <TableCell>{sku.productName || "Product"}</TableCell>
                                <TableCell>{sku.onHandQty || 0}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="orders" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium">Recent Orders</h4>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </Button>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {shopifyOrders?.slice(0, 5).map((order: any) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.saylogixNumber}</TableCell>
                                <TableCell>{order.customerName}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{order.status}</Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="logs" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium">Sync Logs</h4>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Export
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
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
            
            <Button variant="outline" size="sm">
              <TestTube className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-xs text-gray-600">
              Last sync: {new Date(mockShopifyStores[0]?.lastSync || Date.now()).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Generic Connected Card Component
  const ConnectedCard = ({ config }: { config: any }) => {
    const integration = getIntegration(config.name);
    
    if (config.name === 'shopify') {
      return <ShopifyConnectedCard />;
    }
    
    return (
      <Card className="h-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
              <div>
                <CardTitle className="text-lg">{config.title}</CardTitle>
                <CardDescription className="text-sm">{config.description}</CardDescription>
              </div>
            </div>
            <Badge variant={integration.isEnabled ? "default" : "secondary"}>
              {integration.isEnabled ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col items-center justify-center h-16 bg-gray-50 rounded">
              <div className="text-2xl font-semibold">{integration.successCount || 0}</div>
              <div className="text-xs text-gray-600">Processed</div>
            </div>
            <div className="flex flex-col items-center justify-center h-16 bg-gray-50 rounded">
              <div className="text-2xl font-semibold">{integration.failureCount || 0}</div>
              <div className="text-xs text-gray-600">Failed</div>
            </div>
          </div>
          
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
            
            <Button variant="outline" size="sm">
              <TestTube className="h-4 w-4 mr-2" />
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

  // Get connected integrations
  const getConnectedIntegrations = () => {
    const connected: any[] = [];
    
    Object.entries(integrationConfigs).forEach(([category, configs]) => {
      configs.forEach(config => {
        const integration = getIntegration(config.name);
        if (integration.isEnabled) {
          connected.push({ ...config, category });
        }
      });
    });
    
    return connected;
  };

  // Filter integrations by category
  const filterIntegrationsByCategory = (configs: any[], category: string) => {
    if (category === 'all') return configs;
    return configs.filter(config => config.category === category);
  };

  if (isLoading) {
    return <div className="p-6">Loading integrations...</div>;
  }

  return (
    <div className="flex-1 p-6 bg-gray-50">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Integrations</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Plug className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{activeIntegrations}</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium mr-1">↗</span>
              Connected services
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Errors Detected</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{errorsDetected}</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-red-600 text-xs font-medium mr-1"></span>
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Syncs</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Timer className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{pendingSyncs}</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-amber-600 text-xs font-medium mr-1"></span>
              Scheduled syncs
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">API Latency</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
              <Wifi className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{avgLatency}</div>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <span className="text-green-600 text-xs font-medium mr-1">↘</span>
              Avg response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 w-auto">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="connected">Connected Integrations</TabsTrigger>
        </TabsList>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-4">
          <Tabs value={marketplaceSubTab} onValueChange={setMarketplaceSubTab}>
            <TabsList className="grid grid-cols-8 w-full">
              <TabsTrigger value="ecommerce">E-Commerce</TabsTrigger>
              <TabsTrigger value="courier">Courier</TabsTrigger>
              <TabsTrigger value="messaging">Messaging</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="erp">ERP</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="maps">Maps</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            {Object.entries(integrationConfigs).map(([category, configs]) => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {configs.map((config) => (
                    <MarketplaceCard key={config.name} config={config} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        {/* Connected Integrations Tab */}
        <TabsContent value="connected" className="space-y-4">
          <Tabs value={connectedSubTab} onValueChange={setConnectedSubTab}>
            <TabsList className="grid grid-cols-9 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="ecommerce">E-Commerce</TabsTrigger>
              <TabsTrigger value="courier">Courier</TabsTrigger>
              <TabsTrigger value="messaging">Messaging</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="erp">ERP</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="maps">Maps</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            <TabsContent value={connectedSubTab} className="mt-6">
              {getConnectedIntegrations().length === 0 ? (
                <Card className="p-8">
                  <div className="text-center">
                    <Box className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations connected</h3>
                    <p className="text-gray-600 mb-4">Get started by connecting your first integration from the marketplace</p>
                    <Button onClick={() => setActiveTab("marketplace")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Browse Marketplace
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterIntegrationsByCategory(getConnectedIntegrations(), connectedSubTab).map((config) => (
                    <ConnectedCard key={config.name} config={config} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}