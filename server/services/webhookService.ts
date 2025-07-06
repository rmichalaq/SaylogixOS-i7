import { storage } from "../storage";
import { eventBus } from "./eventBus";
import { shopifyService } from "./shopifyService";
import { courierService } from "./courierService";
import { whatsappService } from "./whatsappService";

interface WebhookRetryConfig {
  maxRetries: number;
  retryDelays: number[]; // in milliseconds
  exponentialBackoff: boolean;
}

class WebhookService {
  private defaultRetryConfig: WebhookRetryConfig = {
    maxRetries: 3,
    retryDelays: [1000, 5000, 15000],
    exponentialBackoff: true
  };

  constructor() {
    this.initializeWebhookProcessors();
  }

  private initializeWebhookProcessors() {
    // Process pending webhooks on startup
    this.processPendingWebhooks();
    
    // Set up periodic retry processing
    setInterval(() => {
      this.processPendingWebhooks();
    }, 30000); // Every 30 seconds
  }

  async handleShopifyWebhook(payload: any, headers: any): Promise<void> {
    try {
      const webhookId = this.generateWebhookId('shopify');
      
      // Log incoming webhook
      await storage.createWebhookLog({
        webhookId,
        url: 'shopify_webhook',
        method: 'POST',
        headers,
        payload,
        status: 'pending'
      });

      // Process webhook through Shopify service
      await shopifyService.handleWebhook(payload, headers);

      // Mark as successful
      await this.markWebhookSuccess(webhookId, 'Processed successfully');
      
    } catch (error) {
      console.error("Failed to handle Shopify webhook:", error);
      await this.markWebhookFailed(payload.webhookId || 'unknown', error.message);
      throw error;
    }
  }

  async handleCourierWebhook(payload: any, headers: any): Promise<void> {
    try {
      const webhookId = this.generateWebhookId('courier');
      
      // Log incoming webhook
      await storage.createWebhookLog({
        webhookId,
        url: 'courier_webhook',
        method: 'POST',
        headers,
        payload,
        status: 'pending'
      });

      // Process webhook through courier service
      await courierService.handleWebhook(payload, headers);

      // Mark as successful
      await this.markWebhookSuccess(webhookId, 'Processed successfully');
      
    } catch (error) {
      console.error("Failed to handle courier webhook:", error);
      await this.markWebhookFailed(payload.webhookId || 'unknown', error.message);
      throw error;
    }
  }

  async handleWhatsAppWebhook(payload: any, headers: any): Promise<void> {
    try {
      const webhookId = this.generateWebhookId('whatsapp');
      
      // Log incoming webhook
      await storage.createWebhookLog({
        webhookId,
        url: 'whatsapp_webhook',
        method: 'POST',
        headers,
        payload,
        status: 'pending'
      });

      // Process webhook through WhatsApp service
      await whatsappService.handleWebhook(payload);

      // Mark as successful
      await this.markWebhookSuccess(webhookId, 'Processed successfully');
      
    } catch (error) {
      console.error("Failed to handle WhatsApp webhook:", error);
      await this.markWebhookFailed(payload.webhookId || 'unknown', error.message);
      throw error;
    }
  }

  // Send outbound webhooks to external systems
  async sendWebhook(url: string, payload: any, options: {
    headers?: Record<string, string>;
    retryConfig?: Partial<WebhookRetryConfig>;
    eventType?: string;
  } = {}): Promise<void> {
    const webhookId = this.generateWebhookId('outbound');
    const config = { ...this.defaultRetryConfig, ...options.retryConfig };
    
    try {
      // Log outbound webhook
      const webhookLog = await storage.createWebhookLog({
        webhookId,
        url,
        method: 'POST',
        headers: options.headers || {},
        payload,
        status: 'pending',
        maxRetries: config.maxRetries
      });

      await this.executeWebhook(webhookLog, config);
      
    } catch (error) {
      console.error(`Failed to send webhook to ${url}:`, error);
      throw error;
    }
  }

  private async executeWebhook(webhookLog: any, config: WebhookRetryConfig): Promise<void> {
    try {
      const response = await fetch(webhookLog.url, {
        method: webhookLog.method,
        headers: {
          'Content-Type': 'application/json',
          ...webhookLog.headers
        },
        body: JSON.stringify(webhookLog.payload),
        timeout: 30000 // 30 second timeout
      });

      const responseBody = await response.text();

      if (response.ok) {
        // Success
        await storage.updateWebhookLog(webhookLog.id, {
          status: 'success',
          responseStatus: response.status,
          responseBody,
          lastAttemptAt: new Date()
        });
      } else {
        // HTTP error
        throw new Error(`HTTP ${response.status}: ${responseBody}`);
      }
      
    } catch (error) {
      await this.handleWebhookFailure(webhookLog, error.message, config);
    }
  }

  private async handleWebhookFailure(webhookLog: any, errorMessage: string, config: WebhookRetryConfig): Promise<void> {
    const retryCount = (webhookLog.retryCount || 0) + 1;
    
    if (retryCount <= config.maxRetries) {
      // Schedule retry
      const delay = this.calculateRetryDelay(retryCount, config);
      const nextRetryAt = new Date(Date.now() + delay);
      
      await storage.updateWebhookLog(webhookLog.id, {
        status: 'pending',
        retryCount,
        responseBody: errorMessage,
        lastAttemptAt: new Date(),
        nextRetryAt
      });
      
      console.log(`Webhook ${webhookLog.webhookId} failed, retry ${retryCount}/${config.maxRetries} scheduled in ${delay}ms`);
    } else {
      // Max retries exceeded
      await storage.updateWebhookLog(webhookLog.id, {
        status: 'max_retries_exceeded',
        retryCount,
        responseBody: errorMessage,
        lastAttemptAt: new Date()
      });
      
      console.error(`Webhook ${webhookLog.webhookId} failed after ${config.maxRetries} retries`);
      
      // Emit failure event
      await eventBus.emitEvent('EV201', {
        entityType: 'webhook',
        entityId: webhookLog.id,
        payload: { 
          webhookId: webhookLog.webhookId,
          url: webhookLog.url,
          error: errorMessage,
          retryCount 
        },
        source: 'webhook'
      });
    }
  }

  private calculateRetryDelay(retryCount: number, config: WebhookRetryConfig): number {
    if (config.exponentialBackoff) {
      return Math.min(1000 * Math.pow(2, retryCount - 1), 60000); // Max 1 minute
    } else {
      return config.retryDelays[retryCount - 1] || config.retryDelays[config.retryDelays.length - 1];
    }
  }

  private async processPendingWebhooks(): Promise<void> {
    try {
      const pendingWebhooks = await storage.getPendingWebhooks();
      const retryableWebhooks = pendingWebhooks.filter(webhook => 
        !webhook.nextRetryAt || webhook.nextRetryAt <= new Date()
      );

      for (const webhook of retryableWebhooks) {
        try {
          await this.executeWebhook(webhook, this.defaultRetryConfig);
        } catch (error) {
          console.error(`Failed to retry webhook ${webhook.webhookId}:`, error);
        }
      }
    } catch (error) {
      console.error("Failed to process pending webhooks:", error);
    }
  }

  private async markWebhookSuccess(webhookId: string, response: string): Promise<void> {
    try {
      const logs = await storage.getPendingWebhooks();
      const webhook = logs.find(w => w.webhookId === webhookId);
      
      if (webhook) {
        await storage.updateWebhookLog(webhook.id, {
          status: 'success',
          responseStatus: 200,
          responseBody: response,
          lastAttemptAt: new Date()
        });
      }
    } catch (error) {
      console.error("Failed to mark webhook success:", error);
    }
  }

  private async markWebhookFailed(webhookId: string, error: string): Promise<void> {
    try {
      const logs = await storage.getPendingWebhooks();
      const webhook = logs.find(w => w.webhookId === webhookId);
      
      if (webhook) {
        await this.handleWebhookFailure(webhook, error, this.defaultRetryConfig);
      }
    } catch (error) {
      console.error("Failed to mark webhook failed:", error);
    }
  }

  private generateWebhookId(type: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type}_${timestamp}_${random}`;
  }

  // Webhook management methods
  async getWebhookStats(): Promise<any> {
    const logs = await storage.getPendingWebhooks();
    
    return {
      total: logs.length,
      pending: logs.filter(w => w.status === 'pending').length,
      success: logs.filter(w => w.status === 'success').length,
      failed: logs.filter(w => w.status === 'max_retries_exceeded').length,
      retrying: logs.filter(w => w.status === 'pending' && w.retryCount > 0).length
    };
  }

  // Event-driven webhook sending for order status updates
  async setupOrderStatusWebhooks(): Promise<void> {
    // Listen for order events and send webhooks to source systems
    eventBus.onOrderEvent(async (eventData) => {
      await this.handleOrderStatusUpdate(eventData);
    });
  }

  private async handleOrderStatusUpdate(eventData: any): Promise<void> {
    try {
      const order = await storage.getOrder(eventData.entityId);
      if (!order) return;

      const webhookPayload = {
        order_id: order.sourceOrderNumber,
        saylogix_order_id: order.saylogixNumber,
        status: order.status,
        tracking_number: order.trackingNumber,
        timestamp: new Date().toISOString(),
        event_type: eventData.eventType
      };

      // Send webhook based on source channel
      switch (order.sourceChannel) {
        case 'shopify':
          await this.sendShopifyStatusUpdate(order, webhookPayload);
          break;
        case 'zid':
          await this.sendZidStatusUpdate(order, webhookPayload);
          break;
        default:
          console.log(`No webhook handler for channel: ${order.sourceChannel}`);
      }
    } catch (error) {
      console.error("Failed to handle order status update:", error);
    }
  }

  private async sendShopifyStatusUpdate(order: any, payload: any): Promise<void> {
    const shopifyWebhookUrl = process.env.SHOPIFY_WEBHOOK_URL;
    if (!shopifyWebhookUrl) return;

    await this.sendWebhook(shopifyWebhookUrl, payload, {
      headers: {
        'X-Shopify-Shop-Domain': process.env.SHOPIFY_STORE_URL || '',
        'X-Saylogix-Source': 'status_update'
      },
      eventType: 'shopify_status_update'
    });
  }

  private async sendZidStatusUpdate(order: any, payload: any): Promise<void> {
    const zidWebhookUrl = process.env.ZID_WEBHOOK_URL;
    if (!zidWebhookUrl) return;

    await this.sendWebhook(zidWebhookUrl, payload, {
      headers: {
        'Authorization': `Bearer ${process.env.ZID_API_KEY}`,
        'X-Saylogix-Source': 'status_update'
      },
      eventType: 'zid_status_update'
    });
  }
}

export const webhookService = new WebhookService();
