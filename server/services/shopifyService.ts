import { storage } from "../storage";
import { eventBus } from "./eventBus";

interface ShopifyOrder {
  id: number;
  order_number: string;
  name: string;
  email: string;
  phone: string;
  total_price: string;
  currency: string;
  line_items: Array<{
    id: number;
    product_id: number;
    variant_id: number;
    title: string;
    name: string;
    sku: string;
    quantity: number;
    price: string;
    grams: number;
  }>;
  shipping_address: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string;
  };
  billing_address: {
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone: string;
  };
  created_at: string;
  financial_status: string;
  fulfillment_status: string;
}

class ShopifyService {
  private apiKey: string;
  private storeUrl: string;
  private webhookSecret: string;

  constructor() {
    this.apiKey = process.env.SHOPIFY_API_KEY || process.env.SHOPIFY_ACCESS_TOKEN || "";
    this.storeUrl = process.env.SHOPIFY_STORE_URL || "";
    this.webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET || "";
    
    if (!this.apiKey || !this.storeUrl) {
      console.warn("Shopify credentials not configured. Please set SHOPIFY_API_KEY and SHOPIFY_STORE_URL environment variables.");
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.apiKey
    };
  }

  private getApiUrl(endpoint: string) {
    return `${this.storeUrl}/admin/api/2023-10/orders${endpoint}`;
  }

  async fetchRecentOrders(limit: number = 50): Promise<ShopifyOrder[]> {
    if (!this.apiKey || !this.storeUrl) {
      throw new Error("Shopify API credentials not configured");
    }

    try {
      const response = await fetch(this.getApiUrl(`.json?limit=${limit}&status=any`), {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error("Failed to fetch Shopify orders:", error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<ShopifyOrder | null> {
    if (!this.apiKey || !this.storeUrl) {
      throw new Error("Shopify API credentials not configured");
    }

    try {
      const response = await fetch(this.getApiUrl(`/${orderId}.json`), {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.order;
    } catch (error) {
      console.error("Failed to fetch Shopify order:", error);
      throw error;
    }
  }

  async updateOrderFulfillmentStatus(orderId: string, status: string, trackingNumber?: string) {
    if (!this.apiKey || !this.storeUrl) {
      throw new Error("Shopify API credentials not configured");
    }

    try {
      const payload: any = {
        fulfillment: {
          status: status,
          notify_customer: true
        }
      };

      if (trackingNumber) {
        payload.fulfillment.tracking_number = trackingNumber;
        payload.fulfillment.tracking_company = "Custom";
      }

      const response = await fetch(this.getApiUrl(`/${orderId}/fulfillments.json`), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to update Shopify order fulfillment:", error);
      throw error;
    }
  }

  async processShopifyOrder(shopifyOrder: ShopifyOrder): Promise<void> {
    try {
      // Check if order already exists
      const existingOrder = await storage.getOrderBySourceNumber(
        shopifyOrder.order_number,
        'shopify'
      );

      if (existingOrder) {
        console.log(`Order ${shopifyOrder.order_number} already exists, skipping`);
        return;
      }

      // Generate Saylogix order number
      const year = new Date().getFullYear();
      const sequence = Date.now().toString().slice(-6);
      const saylogixNumber = `SLYY-${year}-${sequence}`;

      // Create order
      const order = await storage.createOrder({
        saylogixNumber,
        sourceOrderNumber: shopifyOrder.order_number,
        sourceChannel: 'shopify',
        sourceChannelData: shopifyOrder,
        status: 'fetched',
        customerName: `${shopifyOrder.shipping_address.first_name} ${shopifyOrder.shipping_address.last_name}`,
        customerPhone: shopifyOrder.shipping_address.phone || shopifyOrder.phone || '',
        customerEmail: shopifyOrder.email,
        shippingAddress: shopifyOrder.shipping_address,
        billingAddress: shopifyOrder.billing_address,
        orderValue: parseFloat(shopifyOrder.total_price),
        currency: shopifyOrder.currency,
        orderFetched: new Date()
      });

      // Create order items
      for (const lineItem of shopifyOrder.line_items) {
        await storage.createOrderItem({
          orderId: order.id,
          sku: lineItem.sku,
          productName: lineItem.title,
          quantity: lineItem.quantity,
          unitPrice: parseFloat(lineItem.price),
          totalPrice: parseFloat(lineItem.price) * lineItem.quantity,
          weight: lineItem.grams / 1000 // Convert grams to kg
        });
      }

      // Emit order fetched event
      await eventBus.emitEvent('EV001', {
        entityType: 'order',
        entityId: order.id,
        payload: { order, shopifyOrder },
        source: 'shopify'
      });

      console.log(`Successfully processed Shopify order: ${shopifyOrder.order_number} -> ${saylogixNumber}`);
    } catch (error) {
      console.error("Failed to process Shopify order:", error);
      throw error;
    }
  }

  async syncOrders(): Promise<number> {
    try {
      const orders = await this.fetchRecentOrders(100);
      let processedCount = 0;

      for (const order of orders) {
        // Only process paid orders
        if (order.financial_status === 'paid') {
          await this.processShopifyOrder(order);
          processedCount++;
        }
      }

      console.log(`Synced ${processedCount} Shopify orders`);
      return processedCount;
    } catch (error) {
      console.error("Failed to sync Shopify orders:", error);
      throw error;
    }
  }

  validateWebhookSignature(body: string, signature: string): boolean {
    if (!this.webhookSecret) {
      console.warn("Shopify webhook secret not configured");
      return true; // Allow webhook processing if no secret is set
    }

    // Implement webhook signature validation
    // This is a simplified version - implement proper HMAC validation
    return true;
  }

  async handleWebhook(payload: any, headers: any): Promise<void> {
    try {
      const topic = headers['x-shopify-topic'];
      const signature = headers['x-shopify-hmac-sha256'];

      // Validate webhook signature
      if (!this.validateWebhookSignature(JSON.stringify(payload), signature)) {
        throw new Error("Invalid webhook signature");
      }

      console.log(`Processing Shopify webhook: ${topic}`);

      switch (topic) {
        case 'orders/create':
        case 'orders/updated':
          await this.processShopifyOrder(payload);
          break;
        
        case 'orders/cancelled':
          await this.handleOrderCancellation(payload);
          break;
        
        default:
          console.log(`Unhandled Shopify webhook topic: ${topic}`);
      }
    } catch (error) {
      console.error("Failed to handle Shopify webhook:", error);
      throw error;
    }
  }

  private async handleOrderCancellation(shopifyOrder: ShopifyOrder): Promise<void> {
    try {
      const order = await storage.getOrderBySourceNumber(
        shopifyOrder.order_number,
        'shopify'
      );

      if (order) {
        await storage.updateOrder(order.id, {
          status: 'cancelled'
        });

        await eventBus.emitEvent('EV016', {
          entityType: 'order',
          entityId: order.id,
          payload: { reason: 'shopify_cancellation', shopifyOrder },
          source: 'shopify'
        });
      }
    } catch (error) {
      console.error("Failed to handle order cancellation:", error);
      throw error;
    }
  }
}

export const shopifyService = new ShopifyService();
