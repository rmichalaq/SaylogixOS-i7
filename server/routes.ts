import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { shopifyService } from "./services/shopifyService";
import { nasService } from "./services/nasService";
import { whatsappService } from "./services/whatsappService";
import { webhookService } from "./services/webhookService";
import { courierService } from "./services/courierService";
import { eventBus } from "./services/eventBus";
import { insertOrderSchema, insertOrderItemSchema, insertInventorySchema } from "@shared/schema";

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
      res.json({ message: `Synced ${processedCount} orders` });
    } catch (error) {
      console.error("Failed to sync Shopify orders:", error);
      res.status(500).json({ error: "Failed to sync orders" });
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
