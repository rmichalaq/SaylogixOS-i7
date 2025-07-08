import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, TestTube, CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

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
  ]
};

export default function Integrations() {
  const [activeTab, setActiveTab] = useState("ecommerce");
  const [configDialogOpen, setConfigDialogOpen] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: integrations = [], isLoading } = useQuery({
    queryKey: ["/api/integrations"],
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
      const response = await fetch(`/api/integrations/${name}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: name,
          category: activeTab,
          config,
          isEnabled: true
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({ title: "Configuration saved successfully" });
      setConfigDialogOpen(null);
    },
    onError: () => {
      toast({ title: "Failed to save configuration", variant: "destructive" });
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
            { name: "storeUrl", label: "Store URL", type: "text", placeholder: "your-store.myshopify.com" },
            { name: "adminApiKey", label: "Admin API Key", type: "password", placeholder: "Enter admin API key" },
            { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter API key" },
            { name: "apiSecret", label: "API Secret", type: "password", placeholder: "Enter API secret" },
          ];
        case "google_maps":
          return [
            { name: "apiKey", label: "API Key", type: "password", placeholder: "Enter Google Maps API key" },
          ];
        case "aramex":
          return [
            { name: "username", label: "Username", type: "text", placeholder: "Enter username" },
            { name: "password", label: "Password", type: "password", placeholder: "Enter password" },
            { name: "accountNumber", label: "Account Number", type: "text", placeholder: "Enter account number" },
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

  const renderIntegrationCard = (config: any) => {
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
              onClick={() => testConnectionMutation.mutate(config.name)}
              disabled={testConnectionMutation.isPending || !integration?.isEnabled}
            >
              <TestTube className="h-4 w-4 mr-2" />
              Test
            </Button>
          </div>

          {/* Shopify specific actions */}
          {config.name === "shopify" && integration?.isEnabled && (
            <Button 
              className="w-full" 
              variant="outline"
              onClick={async () => {
                try {
                  const response = await fetch("/api/integrations/shopify/fetch-orders", {
                    method: "POST",
                  });
                  const result = await response.json();
                  if (result.success) {
                    toast({ title: "Orders synced", description: result.message });
                  } else {
                    toast({ title: "Sync failed", variant: "destructive" });
                  }
                } catch (error) {
                  toast({ title: "Sync failed", variant: "destructive" });
                }
              }}
            >
              <Zap className="h-4 w-4 mr-2" />
              Sync Orders Now
            </Button>
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600 mt-2">Connect external services and manage API integrations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="ecommerce">E-Commerce</TabsTrigger>
          <TabsTrigger value="courier">Courier</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="erp">ERP</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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