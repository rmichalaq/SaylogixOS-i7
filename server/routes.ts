import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { shopifyService } from "./services/shopify";
import { nasService } from "./services/nasService";
import { whatsappService } from "./services/whatsappService";
import { webhookService } from "./services/webhookService";
import { courierService } from "./services/courierService";
import { eventBus } from "./services/eventBus";
import { insertOrderSchema, insertOrderItemSchema, insertInventorySchema } from "@shared/schema";
import webhookRoutes from "./routes/webhooks";
import integrationRoutes from "./routes/integrations";
import settingsRoutes from "./routes/settings";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard API
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to get dashboard stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard/alerts", async (req, res) => {
    try {
      const alerts = [];
      
      // Get real alerts from database
      const pendingVerifications = await storage.getEvents('order', undefined);
      const verificationAlerts = pendingVerifications.filter(event => 
        event.eventType.includes('address') && event.status === 'pending'
      );
      
      if (verificationAlerts.length > 0) {
        alerts.push({
          id: `verification-${Date.now()}`,
          type: "warning",
          message: `${verificationAlerts.length} orders require address verification`,
          count: verificationAlerts.length,
          action: "Review",
          actionLink: "/verify"
        });
      }

      const recentOrders = await storage.getRecentOrders(10);
      const unassignedOrders = recentOrders.filter(order => !order.courierName);
      
      if (unassignedOrders.length > 0) {
        alerts.push({
          id: `courier-${Date.now()}`,
          type: "info", 
          message: `${unassignedOrders.length} orders pending courier assignment`,
          count: unassignedOrders.length,
          action: "Assign",
          actionLink: "/dispatch"
        });
      }

      res.json(alerts);
    } catch (error) {
      console.error("Failed to get alerts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard/tasks", async (req, res) => {
    try {
      const tasks = [];
      
      // Get real tasks from database events and orders
      const events = await storage.getEvents();
      const recentOrders = await storage.getRecentOrders(20);
      
      // Address verification tasks
      const verificationEvents = events.filter(event => 
        event.eventType.includes('address') && event.status === 'pending'
      );
      
      for (const event of verificationEvents) {
        const order = recentOrders.find(o => o.id === event.entityId);
        if (order) {
          tasks.push({
            id: `verification-${event.id}`,
            type: "address_verification",
            title: "Verify Customer Address",
            description: `Address verification required for order ${order.saylogixNumber}`,
            priority: "high",
            orderId: order.id,
            createdAt: event.createdAt
          });
        }
      }

      // Pick task exceptions
      const pickTasks = await storage.getPickTasks();
      const errorPickTasks = pickTasks.filter(task => task.status === 'error');
      
      for (const pickTask of errorPickTasks) {
        const order = recentOrders.find(o => o.id === pickTask.orderId);
        if (order) {
          tasks.push({
            id: `pick-error-${pickTask.id}`,
            type: "picking_exception",
            title: "Picking Exception",
            description: `Picking issue for order ${order.saylogixNumber}`,
            priority: "urgent",
            orderId: order.id,
            createdAt: pickTask.createdAt
          });
        }
      }

      // Courier assignment tasks
      const unassignedOrders = recentOrders.filter(order => 
        !order.courierName && order.status === 'ready_to_ship'
      );
      
      for (const order of unassignedOrders) {
        tasks.push({
          id: `courier-${order.id}`,
          type: "courier_assignment",
          title: "Assign Courier",
          description: `Order ${order.saylogixNumber} ready for shipment`,
          priority: "medium",
          orderId: order.id,
          createdAt: order.createdAt
        });
      }

      res.json(tasks.slice(0, 10)); // Limit to 10 most recent tasks
    } catch (error) {
      console.error("Failed to get tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/dashboard/activity", async (req, res) => {
    try {
      // Get real activity from events
      const events = await storage.getEvents();
      const recentEvents = events
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20);
      
      const activity = recentEvents.map(event => ({
        id: `activity-${event.id}`,
        type: event.eventType,
        message: event.description || `Event ${event.eventType} occurred`,
        timestamp: event.createdAt,
        orderId: event.entityType === 'order' ? event.entityId : undefined
      }));

      res.json(activity);
    } catch (error) {
      console.error("Failed to get activity:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Integration, webhook and settings routes
  app.use("/api/webhooks", webhookRoutes);
  app.use("/api/integrations", integrationRoutes);
  app.use("/api", settingsRoutes);

  // Orders API
  app.get("/api/orders", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const orders = await storage.getRecentOrders(limit);
      res.json(orders);
    } catch (error) {
      console.error("Failed to get orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Failed to get order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Failed to create order:", error);
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const items = await storage.getOrderItems(orderId);
      res.json(items);
    } catch (error) {
      console.error("Failed to get order items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Inventory API
  app.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getAllInventory();
      res.json(inventory);
    } catch (error) {
      console.error("Failed to get inventory:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/inventory/:sku", async (req, res) => {
    try {
      const sku = req.params.sku;
      const item = await storage.getInventoryBySku(sku);
      if (!item) {
        return res.status(404).json({ error: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Failed to get inventory item:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventory(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Failed to create inventory item:", error);
      res.status(400).json({ error: "Invalid inventory data" });
    }
  });

  // Events API
  app.get("/api/events", async (req, res) => {
    try {
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId ? parseInt(req.query.entityId as string) : undefined;
      const events = await storage.getEvents(entityType, entityId);
      res.json(events);
    } catch (error) {
      console.error("Failed to get events:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Pick Tasks API
  app.get("/api/pick-tasks", async (req, res) => {
    try {
      const orderId = req.query.orderId ? parseInt(req.query.orderId as string) : undefined;
      const tasks = await storage.getPickTasks(orderId);
      res.json(tasks);
    } catch (error) {
      console.error("Failed to get pick tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Pack Tasks API
  app.get("/api/pack-tasks", async (req, res) => {
    try {
      const orderId = req.query.orderId ? parseInt(req.query.orderId as string) : undefined;
      const tasks = await storage.getPackTasks(orderId);
      res.json(tasks);
    } catch (error) {
      console.error("Failed to get pack tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Manifests API
  app.get("/api/manifests", async (req, res) => {
    try {
      const manifests = await storage.getManifests();
      res.json(manifests);
    } catch (error) {
      console.error("Failed to get manifests:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Routes API
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      console.error("Failed to get routes:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Shopify Integration
  app.post("/api/shopify/sync", async (req, res) => {
    try {
      const processedCount = await shopifyService.syncOrders();
      res.json({ message: `Synced ${processedCount} orders`, count: processedCount });
    } catch (error) {
      console.error("Failed to sync Shopify orders:", error);
      res.status(500).json({ error: "Failed to sync orders" });
    }
  });

  // Shopify Configuration
  app.post("/api/integrations/shopify/configure", async (req, res) => {
    try {
      const { storeUrl, adminApiKey, adminApiSecret, accessToken } = req.body;
      
      if (!storeUrl || !adminApiKey) {
        return res.status(400).json({ error: "Missing required fields: Store URL and Admin API Key" });
      }

      // Test connection and fetch store name automatically
      const testService = new ShopifyService();
      const tempConfig = { storeUrl, adminApiKey, adminApiSecret, accessToken };
      testService.configure(tempConfig);
      
      let storeName = "Unknown Store";
      try {
        const shopInfo = await testService.makeRequest("shop.json");
        storeName = shopInfo.shop.name;
      } catch (error) {
        return res.status(400).json({ error: "Failed to connect to Shopify. Please check your credentials." });
      }

      // Save configuration to integration with fetched store name
      const integration = await storage.getIntegration("shopify");
      const config = {
        storeName, // Automatically fetched from Shopify
        storeUrl,
        adminApiKey,
        adminApiSecret,
        accessToken,
        configuredAt: new Date().toISOString()
      };

      if (integration) {
        await storage.updateIntegration(integration.id, { config, isEnabled: true });
      } else {
        await storage.createIntegration({
          name: "shopify",
          type: "shopify",
          category: "ecommerce",
          isEnabled: true,
          config,
          successCount: 0,
          failureCount: 0
        });
      }

      // Auto-register webhooks after successful configuration
      try {
        const testService = new ShopifyService();
        testService.configure(config);
        await testService.registerWebhooks();
      } catch (webhookError) {
        console.warn("Failed to register webhooks:", webhookError);
        // Don't fail the configuration save if webhook registration fails
      }

      res.json({ 
        success: true, 
        message: `Shopify store "${storeName}" configured successfully and webhooks registered` 
      });
    } catch (error) {
      console.error("Failed to configure Shopify:", error);
      res.status(500).json({ error: "Failed to save configuration" });
    }
  });

  app.get("/api/integrations/shopify/test", async (req, res) => {
    try {
      const integration = await storage.getIntegration("shopify");
      if (!integration?.config) {
        return res.status(400).json({ error: "Shopify not configured" });
      }

      // Test connection by fetching shop info
      const testService = new ShopifyService();
      // Use config from database instead of env vars
      testService.configure(integration.config);
      
      const shopInfo = await testService.makeRequest("shop.json");
      
      res.json({ 
        success: true, 
        message: "Connection successful",
        shop: shopInfo.shop.name
      });
    } catch (error) {
      console.error("Shopify test failed:", error);
      res.status(500).json({ 
        success: false, 
        message: error.message || "Connection failed" 
      });
    }
  });

  app.get("/api/integrations/shopify/orders", async (req, res) => {
    try {
      const integration = await storage.getIntegration("shopify");
      if (!integration?.config || !integration.isEnabled) {
        return res.json([]);
      }

      const testService = new ShopifyService();
      testService.configure(integration.config);
      
      const orders = await testService.fetchOpenOrders();
      res.json(orders);
    } catch (error) {
      console.error("Failed to fetch Shopify orders:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  // Shopify Webhook Handler
  app.post("/webhooks/shopify", async (req, res) => {
    try {
      const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
      const body = JSON.stringify(req.body);
      const topic = req.get("X-Shopify-Topic");
      
      // For now, accept all webhooks - in production you should verify HMAC
      console.log(`Received Shopify webhook: ${topic}`);
      
      if (topic === "orders/create" || topic === "orders/updated") {
        const order = req.body;
        
        // Process the order through our system
        await shopifyService.processShopifyOrder(order);
        
        // Emit appropriate event
        if (topic === "orders/create") {
          eventBus.emit("EV001", { type: "order_received", orderId: order.id, source: "shopify_webhook" });
        } else {
          eventBus.emit("EV003", { type: "order_updated", orderId: order.id, source: "shopify_webhook" });
        }
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Failed to process Shopify webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Address Verification
  app.post("/api/verify/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      await nasService.verifyOrderAddress(orderId);
      res.json({ message: "Address verification started" });
    } catch (error) {
      console.error("Failed to start address verification:", error);
      res.status(500).json({ error: "Failed to start verification" });
    }
  });

  // Scanner API
  app.post("/api/scan", async (req, res) => {
    try {
      const { code, context } = req.body;
      
      // Process scan based on context
      let result;
      switch (context) {
        case 'sku':
          result = await storage.getInventoryBySku(code);
          break;
        case 'order':
          result = await storage.getOrderBySourceNumber(code, 'manual');
          break;
        default:
          result = { code, context, timestamp: new Date() };
      }

      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Failed to process scan:", error);
      res.status(500).json({ error: "Failed to process scan" });
    }
  });

  // Webhook endpoints
  app.post("/api/webhooks/shopify", async (req, res) => {
    try {
      await webhookService.handleShopifyWebhook(req.body, req.headers);
      res.status(200).send("OK");
    } catch (error) {
      console.error("Failed to handle Shopify webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  app.post("/api/webhooks/whatsapp", async (req, res) => {
    try {
      await webhookService.handleWhatsAppWebhook(req.body, req.headers);
      res.status(200).send("OK");
    } catch (error) {
      console.error("Failed to handle WhatsApp webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  app.post("/api/webhooks/courier", async (req, res) => {
    try {
      await webhookService.handleCourierWebhook(req.body, req.headers);
      res.status(200).send("OK");
    } catch (error) {
      console.error("Failed to handle courier webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Statistics API
  app.get("/api/stats/verification", async (req, res) => {
    try {
      const stats = await nasService.getVerificationStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to get verification stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/stats/webhooks", async (req, res) => {
    try {
      const stats = await webhookService.getWebhookStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to get webhook stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Inbound Shipments API
  app.get("/api/inbound/shipments", async (req, res) => {
    try {
      // For now, return empty array since we don't have inbound shipments table yet
      // This will be properly implemented when the inbound module is expanded
      res.json([]);
    } catch (error) {
      console.error("Failed to get inbound shipments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/inbound/items", async (req, res) => {
    try {
      // For now, return empty array since we don't have inbound items table yet
      // This will be properly implemented when the inbound module is expanded
      res.json([]);
    } catch (error) {
      console.error("Failed to get inbound items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    // Send real-time events to connected clients
    const eventHandler = (eventName: string, eventData: any) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'event',
          eventName,
          data: eventData
        }));
      }
    };

    eventBus.onAny(eventHandler);

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      eventBus.offAny(eventHandler);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
