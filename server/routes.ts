import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { shopifyService, ShopifyService } from "./services/shopify";
import { nasService } from "./services/nasService";
import * as splService from "./services/splService";
import { whatsappService } from "./services/whatsappService";
import { webhookService } from "./services/webhookService";
import { courierService } from "./services/courierService";
import { eventBus } from "./services/eventBus";
import { insertOrderSchema, insertOrderItemSchema, insertInventorySchema } from "@shared/schema";
import webhookRoutes from "./routes/webhooks";
import integrationRoutes from "./routes/integrations";
import settingsRoutes from "./routes/settings";
import { registerSeedRoutes } from "./routes/seedRoutes";

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

      // System alerts disabled per user requirements
      // All alerts now handled silently in background
      res.json([]);
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
      // Return empty activity feed - no events to display
      res.json([]);
    } catch (error) {
      console.error("Failed to get activity:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Integration, webhook and settings routes
  app.use("/api/webhooks", webhookRoutes);
  app.use("/api/integrations", integrationRoutes);
  app.use("/api/settings", settingsRoutes);

  // Orders API
  app.get("/api/orders", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const status = req.query.status as string;
      let orders = await storage.getRecentOrders(limit);
      
      // Filter by status if provided
      if (status) {
        orders = orders.filter(order => order.status === status);
      }
      
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

  // Update order status
  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const updates = req.body;
      
      await storage.updateOrder(orderId, updates);
      
      // Create event for status change
      if (updates.status) {
        await storage.createEvent({
          entityType: 'order',
          entityId: orderId,
          eventType: `order.status.changed.${updates.status}`,
          description: `Order status changed to ${updates.status}`,
          status: 'completed'
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update order with verified address
  app.patch("/api/orders/:id/verify", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const verificationData = req.body;
      
      // Update order with verified address data
      await storage.updateOrder(orderId, {
        addressVerified: verificationData.addressVerified,
        verifiedAddress: verificationData.verifiedAddress,
        verifiedNAS: verificationData.verifiedNAS,
        coordinates: verificationData.coordinates,
        addressVerifiedAt: verificationData.verificationTimestamp
      });
      
      // Create event for address verification
      await storage.createEvent({
        eventId: `EV_ADDR_VERIFY_${orderId}_${Date.now()}`,
        entityType: 'order',
        entityId: orderId,
        eventType: 'order.address.verified',
        description: `Order address verified with NAS code: ${verificationData.verifiedNAS}`,
        status: 'completed'
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update order verification:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/orders/by-sku/:sku", async (req, res) => {
    try {
      const sku = req.params.sku;
      const status = req.query.status as string;
      
      // Get all orders with requested status
      let orders = await storage.getRecentOrders();
      if (status) {
        orders = orders.filter(order => order.status === status);
      }
      
      // Find orders containing this SKU
      const ordersWithSku = [];
      for (const order of orders) {
        const items = await storage.getOrderItems(order.id);
        const hasSku = items.some(item => 
          item.sku === sku || item.barcode === sku
        );
        if (hasSku) {
          ordersWithSku.push(order);
        }
      }
      
      // Sort by created date (oldest first)
      ordersWithSku.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      if (ordersWithSku.length === 0) {
        return res.status(404).json({ error: "No orders found with this SKU" });
      }
      
      res.json(ordersWithSku[0]); // Return oldest order
    } catch (error) {
      console.error("Failed to find order by SKU:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/orders/by-tote/:toteId", async (req, res) => {
    try {
      const toteId = req.params.toteId;
      
      // Find pick task with this tote
      const pickTasks = await storage.getPickTasks();
      const pickTask = pickTasks.find(task => task.toteId === toteId);
      
      if (!pickTask) {
        return res.status(404).json({ error: "No order assigned to this tote" });
      }
      
      const order = await storage.getOrder(pickTask.orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Failed to find order by tote:", error);
      res.status(500).json({ error: "Internal server error" });
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

  // Alternative route for order items (for consistency)
  app.get("/api/order-items/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      if (isNaN(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
      }
      
      const items = await storage.getOrderItems(orderId);
      res.json(items);
    } catch (error) {
      console.error("Failed to get order items:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Events API
  app.get("/api/events/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const id = parseInt(entityId);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid entity ID" });
      }
      
      const events = await storage.getEvents(entityType, id);
      res.json(events);
    } catch (error) {
      console.error("Failed to get events:", error);
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

  app.patch("/api/inventory/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid inventory ID" });
      }
      
      // First check if the item exists
      const existingItem = await storage.getInventoryById(id);
      if (!existingItem) {
        return res.status(404).json({ error: "Inventory item not found" });
      }
      
      // Update the item
      await storage.updateInventoryById(id, req.body);
      res.json({ success: true, message: "Inventory item updated successfully" });
    } catch (error) {
      console.error("Failed to update inventory item:", error);
      res.status(500).json({ error: "Internal server error" });
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
      const status = req.query.status as string;
      let tasks = await storage.getPackTasks(orderId);
      
      // Filter by status if provided
      if (status) {
        tasks = tasks.filter(task => task.status === status);
      }
      
      // Include order details with each task
      const tasksWithOrders = await Promise.all(
        tasks.map(async (task) => {
          const order = await storage.getOrder(task.orderId);
          return { ...task, order };
        })
      );
      
      res.json(tasksWithOrders);
    } catch (error) {
      console.error("Failed to get pack tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/pack-tasks", async (req, res) => {
    try {
      const { orderId, status, packagingType, weight, toteId } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
      }
      
      // Create pack task
      const task = await storage.createPackTask({
        orderId,
        status: status || "in_progress",
        packagingType,
        weight,
        toteId,
        completedAt: status === "completed" ? new Date() : null,
        completedBy: req.session?.user?.id || null,
      });
      
      // Generate AWB if completed
      if (status === "completed") {
        const awbNumber = `AWB${Date.now()}`; // In production, use courier API
        await storage.updatePackTask(task.id, { awbNumber });
        
        // Emit packing completed event
        eventBus.emit("EV015", { 
          type: "packing_completed", 
          orderId, 
          packTaskId: task.id,
          awbNumber 
        });
      }
      
      res.status(201).json({ ...task, awbNumber: task.awbNumber || awbNumber });
    } catch (error) {
      console.error("Failed to create pack task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/pack-tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { status, packagingType, weight, notes } = req.body;
      
      // Update pack task
      const updates: any = {};
      if (status) updates.status = status;
      if (packagingType) updates.packagingType = packagingType;
      if (weight) updates.weight = weight;
      if (notes) updates.notes = notes;
      
      if (status === "completed") {
        updates.completedAt = new Date();
        updates.completedBy = req.session?.user?.id || null;
        
        // Generate AWB number
        const awbNumber = `AWB${Date.now()}`; // In production, use courier API
        updates.awbNumber = awbNumber;
        
        // Update order status to packed
        const tasks = await storage.getPackTasks();
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          await storage.updateOrder(task.orderId, { status: "packed" });
          
          // Emit packing completed event
          eventBus.emit("EV015", { 
            type: "packing_completed", 
            orderId: task.orderId, 
            packTaskId: taskId,
            awbNumber 
          });
        }
      }
      
      await storage.updatePackTask(taskId, updates);
      
      res.json({ success: true, message: "Pack task updated successfully" });
    } catch (error) {
      console.error("Failed to update pack task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/pack-tasks/:id/reprint", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getPackTasks().then(tasks => 
        tasks.find(t => t.id === taskId)
      );
      
      if (!task) {
        return res.status(404).json({ error: "Pack task not found" });
      }
      
      if (!task.awbNumber) {
        return res.status(400).json({ error: "No AWB number available" });
      }
      
      // In production, send to printer service
      console.log(`Reprinting label for AWB: ${task.awbNumber}`);
      
      // Emit label reprint event
      eventBus.emit("EV016", { 
        type: "label_reprinted", 
        orderId: task.orderId, 
        packTaskId: task.id,
        awbNumber: task.awbNumber,
        userId: req.session?.user?.id 
      });
      
      res.json({ success: true, message: "Label sent to printer" });
    } catch (error) {
      console.error("Failed to reprint label:", error);
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
  
  // Pickup Locations - Real data from database
  app.get("/api/pickup-locations", async (req, res) => {
    try {
      // Query real fulfillment centers from warehouse settings or create from actual orders
      const packLocations = await db.execute(sql`
        SELECT 
          'FC_' || ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as id,
          COALESCE(courier_assigned, 'Unassigned') as fc_name,
          COUNT(*) as packages_ready,
          courier_assigned,
          'TBD' as pickup_window,
          CASE 
            WHEN COUNT(*) > 0 THEN 'ready'
            ELSE 'awaiting'
          END as status,
          'Warehouse Location' as address
        FROM orders 
        WHERE status IN ('packed', 'ready_to_ship') 
          AND courier_assigned IS NOT NULL
        GROUP BY courier_assigned
        HAVING COUNT(*) > 0
        
        UNION ALL
        
        -- Show awaiting status when no packages ready
        SELECT 
          'FC_Main' as id,
          'Main Fulfillment Center' as fc_name,
          0 as packages_ready,
          'Multiple' as courier_assigned,
          'N/A' as pickup_window,
          'awaiting' as status,
          'Main Warehouse' as address
        WHERE NOT EXISTS (
          SELECT 1 FROM orders 
          WHERE status IN ('packed', 'ready_to_ship') 
            AND courier_assigned IS NOT NULL
        )
      `);

      const pickupLocations = packLocations.rows.map((row: any) => ({
        id: row.id,
        fcName: row.fc_name,
        packagesReady: parseInt(row.packages_ready),
        courierAssigned: row.courier_assigned,
        pickupWindow: row.pickup_window,
        status: row.status,
        address: row.address
      }));
      res.json(pickupLocations);
    } catch (error) {
      console.error("Failed to get pickup locations:", error);
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

  // Shopify Configuration with automatic store name fetching  
  app.post("/api/integrations/shopify/simple", async (req, res) => {
    try {
      console.log("Shopify configuration:", req.body);
      const { storeUrl, adminApiKey, adminApiSecret, accessToken } = req.body;
      
      if (!storeUrl || !adminApiKey) {
        return res.status(400).json({ error: "Missing required fields: Store URL and Admin API Key" });
      }

      // Save basic config first
      const basicConfig = {
        storeName: "Connecting...",
        storeUrl,
        adminApiKey,
        adminApiSecret,
        accessToken,
        configuredAt: new Date().toISOString()
      };

      const integration = await storage.getIntegration("shopify");
      
      if (integration) {
        await storage.updateIntegration(integration.id, { config: basicConfig, isEnabled: true });
      } else {
        await storage.createIntegration({
          name: "shopify",
          type: "shopify", 
          category: "ecommerce",
          isEnabled: true,
          config: basicConfig
        });
      }

      // Respond immediately, then update store name in background
      res.json({ success: true, message: "Configuration saved. Validating connection..." });
      
      // Background process to fetch store name and register webhooks
      setTimeout(async () => {
        try {
          const testService = new ShopifyService();
          testService.configure(basicConfig);
          
          // Fetch real store name
          const shopInfo = await testService.makeRequest("shop.json");
          const storeName = shopInfo.shop.name;
          
          // Update with real store name
          const finalConfig = { ...basicConfig, storeName };
          const updatedIntegration = await storage.getIntegration("shopify");
          if (updatedIntegration) {
            await storage.updateIntegration(updatedIntegration.id, { 
              config: finalConfig,
              lastSyncAt: new Date(),
              lastError: null
            });
          }
          
          // Register webhooks
          await testService.registerWebhooks();
          console.log(`Shopify store "${storeName}" successfully configured with webhooks`);
          
        } catch (bgError) {
          console.error("Background Shopify setup failed:", bgError);
          const failedIntegration = await storage.getIntegration("shopify");
          if (failedIntegration) {
            await storage.updateIntegration(failedIntegration.id, {
              lastError: `Connection failed: ${bgError.message}`,
              isEnabled: false
            });
          }
        }
      }, 500);
      
    } catch (error) {
      console.error("Shopify config failed:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Shopify Configuration
  app.post("/api/integrations/shopify/configure", async (req, res) => {
    try {
      console.log("Shopify configuration request body:", req.body);
      const { storeUrl, adminApiKey, adminApiSecret, accessToken } = req.body;
      
      if (!storeUrl || !adminApiKey) {
        return res.status(400).json({ error: "Missing required fields: Store URL and Admin API Key" });
      }

      // Create config object for saving
      const config = {
        storeName: "Test Store", // Will be updated after connection test
        storeUrl,
        adminApiKey,
        adminApiSecret,
        accessToken,
        configuredAt: new Date().toISOString()
      };

      console.log("Saving integration config:", { ...config, adminApiKey: "***", adminApiSecret: "***", accessToken: "***" });

      // Save configuration to integration first  
      const integration = await storage.getIntegration("shopify");
      
      if (integration) {
        await storage.updateIntegration(integration.id, { config, isEnabled: true });
        console.log("Updated existing integration");
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
        console.log("Created new integration");
      }

      // Test connection and fetch store name in background (non-blocking)
      setTimeout(async () => {
        try {
          const testService = new ShopifyService();
          testService.configure(config);
          const shopInfo = await testService.makeRequest("shop.json");
          const storeName = shopInfo.shop.name;
          
          // Update with real store name
          const updatedIntegration = await storage.getIntegration("shopify");
          if (updatedIntegration) {
            await storage.updateIntegration(updatedIntegration.id, { 
              config: { ...config, storeName },
              lastSyncAt: new Date()
            });
          }
          
          // Register webhooks
          await testService.registerWebhooks();
          console.log(`Store "${storeName}" configured and webhooks registered`);
        } catch (error) {
          console.error("Background Shopify setup failed:", error);
        }
      }, 100);

      res.json({ 
        success: true, 
        message: "Shopify configuration saved successfully. Store validation in progress..." 
      });
    } catch (error) {
      console.error("Failed to configure Shopify - Full error:", error);
      res.status(500).json({ error: `Configuration failed: ${error.message}` });
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

  // SPL Address Verification API
  app.post("/api/address/verify/spl", async (req, res) => {
    try {
      const { shortcode } = req.body;
      
      if (!shortcode) {
        return res.status(400).json({ error: "Shortcode is required" });
      }

      const result = await splService.fetchAddressFromSPL(shortcode);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error("SPL address verification failed:", error);
      res.status(500).json({ 
        error: "Address verification failed",
        details: error.message 
      });
    }
  });

  // Batch SPL Address Validation
  app.post("/api/address/verify/spl/batch", async (req, res) => {
    try {
      const { shortcodes } = req.body;
      
      if (!Array.isArray(shortcodes) || shortcodes.length === 0) {
        return res.status(400).json({ error: "Array of shortcodes is required" });
      }

      const results = await splService.batchValidateAddresses(shortcodes);
      res.json({
        success: true,
        data: results
      });
    } catch (error) {
      console.error("SPL batch verification failed:", error);
      res.status(500).json({ 
        error: "Batch verification failed",
        details: error.message 
      });
    }
  });

  // Address validation endpoint (checks both SPL and NAS)
  app.post("/api/address/validate", async (req, res) => {
    try {
      const { shortcode } = req.body;
      
      if (!shortcode) {
        return res.status(400).json({ error: "Shortcode is required" });
      }

      const result = await nasService.verifyNasCode(shortcode);
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error("Address validation failed:", error);
      res.status(500).json({ 
        error: "Address validation failed",
        details: error.message 
      });
    }
  });

  // Address verification status and pending verifications
  app.get("/api/address/pending", async (req, res) => {
    try {
      const events = await storage.getEvents();
      const pendingVerifications = events.filter(event => 
        event.eventType.includes('address') && event.status === 'pending'
      );
      res.json(pendingVerifications);
    } catch (error) {
      console.error("Failed to get pending verifications:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Address verification statistics
  app.get("/api/address/stats", async (req, res) => {
    try {
      const stats = await nasService.getVerificationStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to get verification stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // SPL verification endpoint
  app.post("/api/address/verify/spl", async (req, res) => {
    try {
      const { shortcode } = req.body;
      
      if (!shortcode) {
        return res.status(400).json({ error: 'Missing shortcode' });
      }

      const { fetchAddressFromSPL } = await import('./services/splService.js');
      const result = await fetchAddressFromSPL(shortcode);
      
      res.json({ success: true, data: result });
    } catch (error) {
      console.error('SPL verification error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Unified address validation (SPL + NAS fallback)
  app.post("/api/address/validate", async (req, res) => {
    try {
      const { shortcode } = req.body;
      
      if (!shortcode) {
        return res.status(400).json({ error: 'Missing shortcode' });
      }

      let result = null;

      // Try SPL first
      try {
        const { fetchAddressFromSPL } = await import('./services/splService.js');
        const splResult = await fetchAddressFromSPL(shortcode);
        result = {
          found: true,
          verified: true,
          address: {
            address: splResult.fullAddress,
            city: splResult.fullAddress.split(', ')[3] || '',
            district: splResult.fullAddress.split(', ')[2] || '',
            postalCode: splResult.postalCode
          },
          coordinates: splResult.coordinates,
          source: 'SPL'
        };
      } catch (splError) {
        console.log('SPL failed, trying NAS fallback:', splError.message);
        
        // Fallback to NAS verification if exists
        try {
          const nasLookup = await storage.getNasLookup(shortcode);
          if (nasLookup) {
            result = {
              found: true,
              verified: true,
              address: {
                address: nasLookup.fullAddress,
                city: nasLookup.city || '',
                district: nasLookup.district || '',
                postalCode: nasLookup.postalCode || ''
              },
              coordinates: {
                lat: parseFloat(nasLookup.latitude || '0'),
                lng: parseFloat(nasLookup.longitude || '0')
              },
              source: 'NAS'
            };
          } else {
            result = {
              found: false,
              verified: false,
              source: 'none'
            };
          }
        } catch (nasError) {
          console.error('NAS fallback failed:', nasError);
          result = {
            found: false,
            verified: false,
            source: 'none'
          };
        }
      }

      res.json(result);
    } catch (error) {
      console.error('Address validation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Order verification endpoint
  app.post("/api/verify/:orderId", async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Extract NAS code from shipping address
      const extractNasCode = (address: any): string | null => {
        if (!address) return null;
        
        const addressText = typeof address === 'string' ? address : 
          `${address.address1 || ''} ${address.address2 || ''} ${address.city || ''} ${address.zip || ''}`;
        
        const nasPattern = /\b[A-Z]{4}[0-9]{4}\b/g;
        const matches = addressText.match(nasPattern);
        return matches ? matches[0] : null;
      };

      const nasCode = extractNasCode(order.shippingAddress);
      
      if (!nasCode) {
        return res.status(400).json({ error: 'No NAS code found in shipping address' });
      }

      // Verify using SPL
      const { fetchAddressFromSPL } = await import('./services/splService.js');
      try {
        const splResult = await fetchAddressFromSPL(nasCode);
        
        // Update order with verified address
        await storage.updateOrder(orderId, {
          shippingAddress: typeof order.shippingAddress === 'string' 
            ? splResult.fullAddress 
            : { ...order.shippingAddress, address1: splResult.fullAddress },
          addressVerified: true
        });

        // Create address verification record
        await storage.createAddressVerification({
          orderId,
          originalAddress: typeof order.shippingAddress === 'string' 
            ? order.shippingAddress 
            : JSON.stringify(order.shippingAddress),
          verifiedAddress: splResult.fullAddress,
          nasCode,
          isVerified: true,
          verificationSource: 'SPL',
          latitude: splResult.coordinates.lat?.toString(),
          longitude: splResult.coordinates.lng?.toString()
        });

        res.json({ 
          success: true, 
          verifiedAddress: splResult.fullAddress,
          source: 'SPL'
        });
      } catch (error) {
        console.error('Order verification failed:', error);
        res.status(500).json({ error: error.message });
      }
    } catch (error) {
      console.error('Order verification error:', error);
      res.status(500).json({ error: error.message });
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

  // Inbound Processing API
  
  // Purchase Orders
  app.get("/api/inbound/purchase-orders", async (req, res) => {
    try {
      const orders = await storage.getPurchaseOrders();
      
      // Attach items to each PO
      const ordersWithItems = await Promise.all(
        orders.map(async (po) => ({
          ...po,
          items: await storage.getPurchaseOrderItems(po.id)
        }))
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Failed to get purchase orders:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/inbound/purchase-orders", async (req, res) => {
    try {
      const po = await storage.createPurchaseOrder(req.body);
      res.json(po);
    } catch (error) {
      console.error("Failed to create purchase order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/inbound/purchase-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Handle special updates with timestamps
      if (updates.gateEntry && !updates.gateEntryTime) {
        updates.gateEntryTime = new Date();
      }
      if (updates.unloaded && !updates.unloadingTime) {
        updates.unloadingTime = new Date();
      }
      
      await storage.updatePurchaseOrder(id, updates);
      
      // If unloading is confirmed, create GRN
      if (updates.unloaded) {
        const po = await storage.getPurchaseOrder(id);
        if (po) {
          const grnNumber = `GRN-${po.poNumber}-${Date.now()}`;
          await storage.createGoodsReceiptNote({
            grnNumber,
            poId: po.id,
            poNumber: po.poNumber,
            supplier: po.supplier,
            status: 'pending'
          });
          
          eventBus.emit("EV020", { 
            type: "grn_created", 
            poId: po.id, 
            grnNumber,
            source: "inbound_processing" 
          });
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update purchase order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Goods Receipt Notes
  app.get("/api/inbound/grns", async (req, res) => {
    try {
      const grns = await storage.getGoodsReceiptNotes();
      
      // Attach items to each GRN
      const grnsWithItems = await Promise.all(
        grns.map(async (grn) => ({
          ...grn,
          items: await storage.getGrnItems(grn.id)
        }))
      );
      
      res.json(grnsWithItems);
    } catch (error) {
      console.error("Failed to get GRNs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/inbound/grns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      if (updates.status === 'completed') {
        updates.processingCompleted = new Date();
        
        // Create putaway task when GRN is completed
        const grn = await storage.getGoodsReceiptNotes().then(grns => grns.find(g => g.id === id));
        if (grn) {
          await storage.createPutawayTask({
            grnId: grn.id,
            grnNumber: grn.grnNumber,
            status: 'staged'
          });
          
          eventBus.emit("EV021", { 
            type: "putaway_created", 
            grnId: grn.id, 
            grnNumber: grn.grnNumber,
            source: "grn_completion" 
          });
        }
      }
      
      await storage.updateGoodsReceiptNote(id, updates);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update GRN:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Putaway Tasks
  app.get("/api/inbound/putaway", async (req, res) => {
    try {
      const tasks = await storage.getPutawayTasks();
      
      // Attach items to each task
      const tasksWithItems = await Promise.all(
        tasks.map(async (task) => ({
          ...task,
          items: await storage.getPutawayItems(task.id)
        }))
      );
      
      res.json(tasksWithItems);
    } catch (error) {
      console.error("Failed to get putaway tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/inbound/putaway/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      if (updates.status === 'completed') {
        updates.completedAt = new Date();
        
        eventBus.emit("EV022", { 
          type: "putaway_completed", 
          taskId: id,
          source: "putaway_completion" 
        });
      }
      
      await storage.updatePutawayTask(id, updates);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update putaway task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Inventory Management API
  
  // Inventory Adjustments
  app.get("/api/inventory/adjustments", async (req, res) => {
    try {
      const adjustments = await storage.getInventoryAdjustments();
      res.json(adjustments);
    } catch (error) {
      console.error("Failed to get inventory adjustments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/inventory/adjustments", async (req, res) => {
    try {
      // Calculate before/after quantities based on current inventory
      const currentInventory = await storage.getInventoryBySku(req.body.sku);
      const beforeQty = currentInventory?.availableQty || 0;
      
      let afterQty: number;
      if (req.body.adjustmentType === "set") {
        afterQty = req.body.adjustmentQty;
      } else if (req.body.adjustmentType === "increase") {
        afterQty = beforeQty + req.body.adjustmentQty;
      } else {
        afterQty = beforeQty - req.body.adjustmentQty;
      }

      const adjustmentData = {
        ...req.body,
        beforeQty,
        afterQty
      };

      const adjustment = await storage.createInventoryAdjustment(adjustmentData);
      res.json(adjustment);
    } catch (error) {
      console.error("Failed to create inventory adjustment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/inventory/adjustments/:id/approve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateInventoryAdjustment(id, {
        status: "approved",
        approvedBy: "System Admin",
        approvedAt: new Date(),
        appliedAt: new Date()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to approve adjustment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/inventory/adjustments/:id/reject", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateInventoryAdjustment(id, {
        status: "rejected",
        approvedBy: "System Admin",
        approvedAt: new Date()
      });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to reject adjustment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Cycle Count Tasks
  app.get("/api/inventory/cycle-count", async (req, res) => {
    try {
      const tasks = await storage.getCycleCountTasks();
      
      // Attach items to each task
      const tasksWithItems = await Promise.all(
        tasks.map(async (task) => ({
          ...task,
          items: await storage.getCycleCountItems(task.id)
        }))
      );
      
      res.json(tasksWithItems);
    } catch (error) {
      console.error("Failed to get cycle count tasks:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/inventory/cycle-count", async (req, res) => {
    try {
      const task = await storage.createCycleCountTask(req.body);
      res.json(task);
    } catch (error) {
      console.error("Failed to create cycle count task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.patch("/api/inventory/cycle-count/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateCycleCountTask(id, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update cycle count task:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Product Expiry
  app.get("/api/inventory/expiry", async (req, res) => {
    try {
      const expiryData = await storage.getProductExpiry();
      res.json(expiryData);
    } catch (error) {
      console.error("Failed to get product expiry data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/inventory/expiry", async (req, res) => {
    try {
      const expiry = await storage.createProductExpiry(req.body);
      res.json(expiry);
    } catch (error) {
      console.error("Failed to create product expiry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Register admin seed routes
  registerSeedRoutes(app);

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
