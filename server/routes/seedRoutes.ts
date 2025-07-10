import { Express } from "express";
import { seedMockData, clearMockData } from "../seedMockData";
import { seedBasicData } from "../seedBasicData";
import { seedMockDataComprehensive, clearMockDataComprehensive } from "../seedMockDataComprehensive";

export function registerSeedRoutes(app: Express) {
  // Seed mock data endpoint
  app.post("/api/admin/seed-mock-data", async (req, res) => {
    try {
      // Check for admin authorization (you can add proper auth here)
      const adminKey = req.headers["x-admin-key"];
      if (adminKey !== process.env.ADMIN_KEY && process.env.NODE_ENV === "production") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await seedMockDataComprehensive();
      res.json({ 
        success: true, 
        message: "Comprehensive mock data seeded successfully for all 28+ tables",
        tip: "To clear mock data, use DELETE /api/admin/clear-mock-data"
      });
    } catch (error) {
      console.error("Error seeding mock data:", error);
      if (error.message && error.message.includes('endpoint is disabled')) {
        res.status(503).json({ 
          error: "Database connection unavailable", 
          message: "Cannot seed data while database is offline" 
        });
      } else {
        res.status(500).json({ error: "Failed to seed mock data" });
      }
    }
  });

  // Clear mock data endpoint
  app.delete("/api/admin/clear-mock-data", async (req, res) => {
    try {
      // Check for admin authorization
      const adminKey = req.headers["x-admin-key"];
      if (adminKey !== process.env.ADMIN_KEY && process.env.NODE_ENV === "production") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await clearMockDataComprehensive();
      res.json({ 
        success: true, 
        message: "Mock data cleared successfully" 
      });
    } catch (error) {
      console.error("Error clearing mock data:", error);
      if (error.message && error.message.includes('endpoint is disabled')) {
        res.status(503).json({ 
          error: "Database connection unavailable", 
          message: "Cannot clear data while database is offline" 
        });
      } else {
        res.status(500).json({ error: "Failed to clear mock data" });
      }
    }
  });

  // Get mock data status
  app.get("/api/admin/mock-data-status", async (req, res) => {
    try {
      const { db } = await import("../db");
      const { 
        orders, orderItems, inventory,
        manifests, manifestItems, routes, routeStops,
        purchaseOrders, purchaseOrderItems, goodsReceiptNotes, grnItems, putawayTasks, putawayItems,
        pickTasks, packTasks,
        inventoryAdjustments, cycleCountTasks, cycleCountItems, productExpiry,
        addressVerifications, events, webhookLogs, nasLookups,
        integrations, warehouseZones, staffRoles, toteCartTypes
      } = await import("@shared/schema");
      const { like, sql, eq } = await import("drizzle-orm");

      // Count mock records in each table
      const mockCounts = {
        // Core Business
        orders: await db.select({ count: sql<number>`count(*)` })
          .from(orders)
          .where(like(orders.sourceOrderNumber, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        orderItems: await db.select({ count: sql<number>`count(*)` })
          .from(orderItems)
          .where(like(orderItems.sku, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        inventory: await db.select({ count: sql<number>`count(*)` })
          .from(inventory)
          .where(like(inventory.sku, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
          
        // WMS Operations
        pickTasks: await db.select({ count: sql<number>`count(*)` })
          .from(pickTasks)
          .where(like(pickTasks.toteId, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        packTasks: await db.select({ count: sql<number>`count(*)` })
          .from(packTasks)
          .where(like(packTasks.toteId, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        manifests: await db.select({ count: sql<number>`count(*)` })
          .from(manifests)
          .where(like(manifests.manifestNumber, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        manifestItems: await db.select({ count: sql<number>`count(*)` })
          .from(manifestItems)
          .then(r => r[0]?.count || 0),
        routes: await db.select({ count: sql<number>`count(*)` })
          .from(routes)
          .where(like(routes.routeNumber, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        routeStops: await db.select({ count: sql<number>`count(*)` })
          .from(routeStops)
          .then(r => r[0]?.count || 0),
          
        // Inbound
        purchaseOrders: await db.select({ count: sql<number>`count(*)` })
          .from(purchaseOrders)
          .where(like(purchaseOrders.poNumber, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        goodsReceiptNotes: await db.select({ count: sql<number>`count(*)` })
          .from(goodsReceiptNotes)
          .where(like(goodsReceiptNotes.grnNumber, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        putawayTasks: await db.select({ count: sql<number>`count(*)` })
          .from(putawayTasks)
          .where(like(putawayTasks.grnNumber, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
          
        // Inventory Control
        inventoryAdjustments: await db.select({ count: sql<number>`count(*)` })
          .from(inventoryAdjustments)
          .where(like(inventoryAdjustments.adjustmentNumber, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        cycleCountTasks: await db.select({ count: sql<number>`count(*)` })
          .from(cycleCountTasks)
          .where(like(cycleCountTasks.taskNumber, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        productExpiry: await db.select({ count: sql<number>`count(*)` })
          .from(productExpiry)
          .then(r => r[0]?.count || 0),
          
        // System & Events
        addressVerifications: await db.select({ count: sql<number>`count(*)` })
          .from(addressVerifications)
          .where(like(addressVerifications.verificationMethod, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        events: await db.select({ count: sql<number>`count(*)` })
          .from(events)
          .where(eq(events.sourceSystem, "MOCK_SaylogixOS"))
          .then(r => r[0]?.count || 0),
        webhookLogs: await db.select({ count: sql<number>`count(*)` })
          .from(webhookLogs)
          .where(like(webhookLogs.webhookId, "WH%"))
          .then(r => r[0]?.count || 0),
        nasLookups: await db.select({ count: sql<number>`count(*)` })
          .from(nasLookups)
          .where(like(nasLookups.nasCode, "MOCK%"))
          .then(r => r[0]?.count || 0),
          
        // Configurations
        integrations: await db.select({ count: sql<number>`count(*)` })
          .from(integrations)
          .where(like(integrations.name, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        warehouseZones: await db.select({ count: sql<number>`count(*)` })
          .from(warehouseZones)
          .where(like(warehouseZones.name, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        staffRoles: await db.select({ count: sql<number>`count(*)` })
          .from(staffRoles)
          .where(like(staffRoles.title, "MOCK\\_%"))
          .then(r => r[0]?.count || 0),
        toteCartTypes: await db.select({ count: sql<number>`count(*)` })
          .from(toteCartTypes)
          .where(like(toteCartTypes.name, "MOCK\\_%"))
          .then(r => r[0]?.count || 0)
      };

      const totalMockRecords = Object.values(mockCounts).reduce((sum, count) => sum + count, 0);

      res.json({
        hasMockData: totalMockRecords > 0,
        totalMockRecords,
        breakdown: mockCounts
      });
    } catch (error) {
      console.error("Error checking mock data status:", error);
      res.status(500).json({ error: "Failed to check mock data status" });
    }
  });

  // Basic seed data endpoint (always works)
  app.post("/api/admin/seed-basic-data", async (req, res) => {
    try {
      const adminKey = req.headers["x-admin-key"];
      if (adminKey !== process.env.ADMIN_KEY && process.env.NODE_ENV === "production") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await seedBasicData();
      res.json({ 
        success: true, 
        message: "Basic mock data seeded successfully",
        note: "This creates core data for testing basic functionality"
      });
    } catch (error) {
      console.error("Error seeding basic mock data:", error);
      res.status(500).json({ error: "Failed to seed basic mock data" });
    }
  });
}