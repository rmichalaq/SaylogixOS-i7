import { Express } from "express";
import { seedMockData, clearMockData } from "../seedMockData";

export function registerSeedRoutes(app: Express) {
  // Seed mock data endpoint
  app.post("/api/admin/seed-mock-data", async (req, res) => {
    try {
      // Check for admin authorization (you can add proper auth here)
      const adminKey = req.headers["x-admin-key"];
      if (adminKey !== process.env.ADMIN_KEY && process.env.NODE_ENV === "production") {
        return res.status(401).json({ error: "Unauthorized" });
      }

      await seedMockData();
      res.json({ 
        success: true, 
        message: "Mock data seeded successfully",
        tip: "To clear mock data, use DELETE /api/admin/clear-mock-data"
      });
    } catch (error) {
      console.error("Error seeding mock data:", error);
      res.status(500).json({ error: "Failed to seed mock data" });
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

      await clearMockData();
      res.json({ 
        success: true, 
        message: "Mock data cleared successfully" 
      });
    } catch (error) {
      console.error("Error clearing mock data:", error);
      res.status(500).json({ error: "Failed to clear mock data" });
    }
  });

  // Get mock data status
  app.get("/api/admin/mock-data-status", async (req, res) => {
    try {
      const { db } = await import("../db");
      const { orders, manifests, purchaseOrders, pickTasks, packTasks, routes } = await import("@shared/schema");
      const { like, sql } = await import("drizzle-orm");

      // Count mock records in each table
      const mockCounts = {
        orders: await db.select({ count: sql<number>`count(*)` })
          .from(orders)
          .where(like(orders.sourceOrderNumber, "MOCK_%"))
          .then(r => r[0]?.count || 0),
        manifests: await db.select({ count: sql<number>`count(*)` })
          .from(manifests)
          .where(like(manifests.manifestNumber, "MOCK_%"))
          .then(r => r[0]?.count || 0),
        purchaseOrders: await db.select({ count: sql<number>`count(*)` })
          .from(purchaseOrders)
          .where(like(purchaseOrders.poNumber, "MOCK_%"))
          .then(r => r[0]?.count || 0),
        pickTasks: await db.select({ count: sql<number>`count(*)` })
          .from(pickTasks)
          .where(like(pickTasks.toteId, "MOCK_%"))
          .then(r => r[0]?.count || 0),
        packTasks: await db.select({ count: sql<number>`count(*)` })
          .from(packTasks)
          .where(like(packTasks.toteId, "MOCK_%"))
          .then(r => r[0]?.count || 0),
        routes: await db.select({ count: sql<number>`count(*)` })
          .from(routes)
          .where(like(routes.routeNumber, "MOCK_%"))
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
}