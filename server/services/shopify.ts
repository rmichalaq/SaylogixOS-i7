import crypto from "crypto";
import { storage } from "../storage";

interface ShopifyOrder {
  id: number;
  order_number: string;
  name: string;
  email?: string;
  phone?: string;
  financial_status: string;
  fulfillment_status: string | null;
  total_price: string;
  currency: string;
  shipping_address: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  billing_address?: any;
  line_items: Array<{
    id: number;
    product_id: number;
    variant_id: number;
    title: string;
    quantity: number;
    price: string;
    sku: string;
    weight: number;
  }>;
  created_at: string;
  updated_at: string;
}

export class ShopifyService {
  private storeUrl: string;
  private adminApiKey: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.storeUrl = process.env.SHOPIFY_STORE_URL || "";
    this.adminApiKey = process.env.SHOPIFY_ADMIN_API_KEY || "";
    this.apiKey = process.env.SHOPIFY_API_KEY || "";
    this.apiSecret = process.env.SHOPIFY_API_SECRET_KEY || "";
    
    if (!this.storeUrl || !this.adminApiKey) {
      console.warn("Shopify credentials not configured. Please set SHOPIFY_STORE_URL and SHOPIFY_ADMIN_API_KEY environment variables.");
    }
  }

  configure(config: any): void {
    this.storeUrl = config.storeUrl;
    this.adminApiKey = config.adminApiKey;
    this.apiKey = config.apiKey || config.adminApiKey;
    this.apiSecret = config.adminApiSecret || config.apiSecret;
  }

  isConfigured(): boolean {
    return !!(this.storeUrl && this.adminApiKey);
  }

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error("Shopify not configured");
    }

    // Ensure proper URL construction
    let baseUrl = this.storeUrl;
    if (!baseUrl.includes('://')) {
      baseUrl = `https://${baseUrl}`;
    }
    if (!baseUrl.includes('.myshopify.com') && !baseUrl.includes('shopify.com')) {
      baseUrl = `https://${this.storeUrl}.myshopify.com`;
    }
    
    const url = `${baseUrl}/admin/api/2024-01/${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": this.adminApiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Shopify API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async registerWebhook(): Promise<void> {
    if (!this.isConfigured()) {
      console.log("Shopify not configured, skipping webhook registration");
      return;
    }

    try {
      const webhookData = {
        webhook: {
          topic: "orders/create",
          address: `${process.env.REPLIT_DOMAIN || "http://localhost:5000"}/api/webhooks/shopify/orders`,
          format: "json",
        },
      };

      const result = await this.makeRequest("webhooks.json", {
        method: "POST",
        body: JSON.stringify(webhookData),
      });

      console.log("Shopify webhook registered successfully:", result.webhook.id);
      
      // Update integration status
      await this.updateIntegrationStatus(true, "Webhook registered successfully");
    } catch (error) {
      console.error("Failed to register Shopify webhook:", error);
      await this.updateIntegrationStatus(false, `Failed to register webhook: ${error.message}`);
    }
  }

  private async updateIntegrationStatus(success: boolean, message: string): Promise<void> {
    try {
      const integration = await storage.getIntegration("shopify");
      if (integration) {
        const updates = success
          ? { successCount: integration.successCount + 1, lastError: null, lastSyncAt: new Date() }
          : { failureCount: integration.failureCount + 1, lastError: message };
        
        await storage.updateIntegration(integration.id, updates);
      }
    } catch (error) {
      console.error("Failed to update integration status:", error);
    }
  }

  verifyWebhook(data: string, signature: string): boolean {
    if (!this.apiSecret) return false;

    const hmac = crypto.createHmac("sha256", this.apiSecret);
    hmac.update(data, "utf8");
    const calculatedSignature = hmac.digest("base64");

    return crypto.timingSafeEqual(
      Buffer.from(signature, "base64"),
      Buffer.from(calculatedSignature, "base64")
    );
  }

  private generateInternalOrderId(): string {
    const year = new Date().getFullYear() % 100;
    // This should be implemented with proper database sequence to avoid race conditions
    const orderCount = Math.floor(Math.random() * 1000) + 1; // Temporary - should query max order number
    return `SL${year.toString().padStart(2, "0")}-${orderCount}`;
  }

  async processShopifyOrder(shopifyOrder: ShopifyOrder): Promise<void> {
    try {
      // Check if order already exists
      const existingOrder = await storage.getOrderBySourceNumber(
        shopifyOrder.order_number,
        "shopify"
      );

      if (existingOrder) {
        console.log(`Order ${shopifyOrder.order_number} already exists, skipping`);
        return;
      }

      // Generate internal order ID
      const internalOrderId = this.generateInternalOrderId();

      // Process shipping address
      const shippingAddress = {
        firstName: shopifyOrder.shipping_address.first_name,
        lastName: shopifyOrder.shipping_address.last_name,
        address1: shopifyOrder.shipping_address.address1,
        address2: shopifyOrder.shipping_address.address2 || "",
        city: shopifyOrder.shipping_address.city,
        province: shopifyOrder.shipping_address.province,
        country: shopifyOrder.shipping_address.country,
        zip: shopifyOrder.shipping_address.zip,
        phone: shopifyOrder.shipping_address.phone,
      };

      // Create order
      const order = await storage.createOrder({
        saylogixNumber: internalOrderId,
        sourceOrderNumber: shopifyOrder.order_number,
        sourceChannel: "shopify",
        sourceChannelData: { shopifyOrderId: shopifyOrder.id },
        status: "fetched",
        customerName: `${shopifyOrder.shipping_address.first_name} ${shopifyOrder.shipping_address.last_name}`,
        customerPhone: shopifyOrder.phone || shopifyOrder.shipping_address.phone,
        customerEmail: shopifyOrder.email,
        shippingAddress,
        billingAddress: shopifyOrder.billing_address,
        orderValue: shopifyOrder.total_price,
        currency: shopifyOrder.currency,
        orderFetched: new Date(),
      });

      // Create order items
      for (const item of shopifyOrder.line_items) {
        await storage.createOrderItem({
          orderId: order.id,
          sku: item.sku || `SHOPIFY-${item.variant_id}`,
          productName: item.title,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: (parseFloat(item.price) * item.quantity).toFixed(2),
          weight: item.weight?.toString(),
        });
      }

      // Create event
      await storage.createEvent({
        type: "order_received",
        entityType: "order",
        entityId: order.id,
        data: { source: "shopify", shopifyOrderId: shopifyOrder.id },
        description: `Order ${internalOrderId} received from Shopify`,
      });

      console.log(`Successfully processed Shopify order: ${internalOrderId}`);
      await this.updateIntegrationStatus(true, `Order ${internalOrderId} processed successfully`);

    } catch (error) {
      console.error("Failed to process Shopify order:", error);
      await this.updateIntegrationStatus(false, `Failed to process order: ${error.message}`);
      throw error;
    }
  }

  async registerWebhooks(): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("Shopify not configured");
    }

    try {
      const webhookTopics = [
        { topic: "orders/create", endpoint: "/webhooks/shopify" },
        { topic: "orders/updated", endpoint: "/webhooks/shopify" }
      ];

      for (const webhook of webhookTopics) {
        const webhookData = {
          webhook: {
            topic: webhook.topic,
            address: `${process.env.REPLIT_URL || 'https://your-app.replit.app'}${webhook.endpoint}`,
            format: "json"
          }
        };

        await this.makeRequest("webhooks.json", {
          method: "POST",
          body: JSON.stringify(webhookData),
        });

        console.log(`Registered Shopify webhook for ${webhook.topic}`);
      }

      await this.updateIntegrationStatus(true, "Webhooks registered successfully");
    } catch (error) {
      console.error("Failed to register webhooks:", error);
      await this.updateIntegrationStatus(false, `Webhook registration failed: ${error.message}`);
      throw error;
    }
  }

  mapShopifyStatus(shopifyStatus: string, fulfillmentStatus?: string): string {
    // Map Shopify statuses to internal Saylogix statuses
    if (shopifyStatus === "cancelled") return "cancelled";
    
    if (fulfillmentStatus === "fulfilled") return "dispatched";
    if (fulfillmentStatus === "partial") return "picking";
    
    if (shopifyStatus === "open") return "picking";
    if (shopifyStatus === "closed") return "delivered";
    
    return "received"; // default status
  }

  async fetchOpenOrders(): Promise<ShopifyOrder[]> {
    if (!this.isConfigured()) {
      throw new Error("Shopify not configured");
    }

    try {
      const response = await this.makeRequest("orders.json?status=open&limit=50");
      console.log(`Fetched ${response.orders.length} open orders from Shopify`);
      return response.orders;
    } catch (error) {
      console.error("Failed to fetch Shopify orders:", error);
      await this.updateIntegrationStatus(false, `Failed to fetch orders: ${error.message}`);
      throw error;
    }
  }

  async syncOrders(): Promise<number> {
    if (!this.isConfigured()) {
      throw new Error("Shopify not configured");
    }

    try {
      const orders = await this.fetchOpenOrders();
      let processedCount = 0;

      for (const order of orders) {
        try {
          await this.processShopifyOrder(order);
          processedCount++;
        } catch (error) {
          console.error(`Failed to process order ${order.id}:`, error);
        }
      }

      await this.updateIntegrationStatus(true, `Successfully synced ${processedCount} orders`);
      return processedCount;
    } catch (error) {
      console.error("Failed to sync Shopify orders:", error);
      await this.updateIntegrationStatus(false, `Sync failed: ${error.message}`);
      throw error;
    }
  }

  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    if (!this.isConfigured()) {
      console.log("Shopify not configured, skipping status update");
      return;
    }

    try {
      // Map internal status to Shopify fulfillment status
      const statusMapping: Record<string, string> = {
        "dispatched": "fulfilled",
        "delivered": "fulfilled",
        "cancelled": "cancelled",
      };

      const shopifyStatus = statusMapping[status];
      if (!shopifyStatus) {
        console.log(`No Shopify status mapping for: ${status}`);
        return;
      }

      if (shopifyStatus === "fulfilled") {
        // Create fulfillment
        const fulfillmentData = {
          fulfillment: {
            location_id: null,
            tracking_number: null,
            notify_customer: true,
          },
        };

        await this.makeRequest(`orders/${orderId}/fulfillments.json`, {
          method: "POST",
          body: JSON.stringify(fulfillmentData),
        });

        console.log(`Updated Shopify order ${orderId} status to fulfilled`);
      }

      await this.updateIntegrationStatus(true, `Order ${orderId} status updated to ${shopifyStatus}`);
    } catch (error) {
      console.error(`Failed to update Shopify order status:`, error);
      await this.updateIntegrationStatus(false, `Failed to update order status: ${error.message}`);
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: "Shopify credentials not configured" };
    }

    try {
      const response = await this.makeRequest("shop.json");
      return {
        success: true,
        message: `Connected to ${response.shop.name} (${response.shop.domain})`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }
}

export const shopifyService = new ShopifyService();