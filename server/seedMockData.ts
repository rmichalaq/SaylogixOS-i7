import { db } from "./db";
import { 
  orders, 
  orderItems, 
  events, 
  pickTasks, 
  packTasks, 
  manifests, 
  manifestItems,
  routes,
  routeStops,
  purchaseOrders,
  purchaseOrderItems,
  goodsReceiptNotes,
  grnItems,
  putawayTasks,
  inventory,
  inventoryAdjustments,
  cycleCountTasks,
  cycleCountItems,
  productExpiry
} from "@shared/schema";
import { nanoid } from "nanoid";

// Helper to generate dates
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

// Helper to generate order numbers
let orderCounter = 500; // Start from 500 to avoid conflicts with existing orders
const getNextOrderNumber = () => {
  const year = new Date().getFullYear() % 100;
  return `SL${year}-${String(orderCounter++).padStart(3, '0')}`;
};

export async function seedMockData() {
  console.log("🌱 Starting mock data seeding...");

  try {
    // 1. Seed mock orders with different statuses
    const mockOrderStatuses = [
      { status: "picked", count: 2, priority: "normal" },
      { status: "packed", count: 2, priority: "high" },
      { status: "dispatched", count: 2, priority: "normal" },
      { status: "delivered", count: 2, priority: "low" },
      { status: "cancelled", count: 2, priority: "normal" },
      { status: "exception", count: 2, priority: "urgent" }
    ];

    const createdOrders = [];
    
    for (const { status, count, priority } of mockOrderStatuses) {
      for (let i = 0; i < count; i++) {
        const orderData = {
          saylogixNumber: getNextOrderNumber(),
          sourceOrderNumber: `MOCK_${1000 + orderCounter}`,
          sourceChannel: "manual",
          sourceChannelData: { 
            id: `MOCK_${nanoid(10)}`, 
            source: "MOCK",
            total_price: (Math.random() * 2000 + 100).toFixed(2)
          },
          status,
          customerName: `Mock Customer ${orderCounter}`,
          customerPhone: `+966${Math.floor(Math.random() * 900000000 + 100000000)}`,
          customerEmail: `customer${orderCounter}@example.com`,
          shippingAddress: {
            line1: `${Math.floor(Math.random() * 999) + 1} Mock Street`,
            city: ["Riyadh", "Jeddah", "Dammam"][Math.floor(Math.random() * 3)],
            region: ["Central", "Western", "Eastern"][Math.floor(Math.random() * 3)],
            country: "SA",
            source: "MOCK"
          },
          orderValue: (Math.random() * 2000 + 100).toFixed(2),
          currency: "SAR",
          nasCode: `MOCK_${Math.floor(Math.random() * 9000) + 1000}`,
          nasVerified: true,
          courierAssigned: ["aramex", "smsa", "naqel"][Math.floor(Math.random() * 3)],
          trackingNumber: status === "dispatched" || status === "delivered" ? `MOCK_TRK_${nanoid(8)}` : null,
          priority,
          createdAt: daysAgo(Math.floor(Math.random() * 10) + 1),
          orderFetched: daysAgo(Math.floor(Math.random() * 10) + 1),
          pickingStarted: ["picked", "packed", "dispatched", "delivered"].includes(status) ? daysAgo(Math.floor(Math.random() * 5)) : null,
          pickingCompleted: ["packed", "dispatched", "delivered"].includes(status) ? daysAgo(Math.floor(Math.random() * 4)) : null,
          packingCompleted: ["dispatched", "delivered"].includes(status) ? daysAgo(Math.floor(Math.random() * 3)) : null,
          dispatched: ["dispatched", "delivered"].includes(status) ? daysAgo(Math.floor(Math.random() * 2)) : null,
          delivered: status === "delivered" ? daysAgo(Math.floor(Math.random() * 1)) : null
        };

        const [order] = await db.insert(orders).values(orderData).returning();
        createdOrders.push(order);

        // Add order items
        const itemCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < itemCount; j++) {
          await db.insert(orderItems).values({
            orderId: order.id,
            sku: `MOCK_SKU_${Math.floor(Math.random() * 100)}`,
            productName: `Mock Product ${j + 1}`,
            quantity: Math.floor(Math.random() * 5) + 1,
            unitPrice: (Math.random() * 500 + 50).toFixed(2),
            totalPrice: (Math.random() * 1000 + 100).toFixed(2),
            weight: (Math.random() * 5 + 0.1).toFixed(3),
            picked: ["picked", "packed", "dispatched", "delivered"].includes(status),
            packed: ["packed", "dispatched", "delivered"].includes(status),
            binLocation: `MOCK_BIN_${Math.floor(Math.random() * 100)}`
          });
        }

        // Log event
        await db.insert(events).values({
          eventId: `EV_MOCK_${nanoid(8)}`,
          eventType: `order_${status}`,
          entityType: "order",
          entityId: order.id,
          description: `Mock order ${order.saylogixNumber} set to ${status}`,
          status: "success",
          triggeredBy: "mock_seeder",
          sourceSystem: "MOCK",
          eventData: { source: "MOCK" },
          createdAt: new Date()
        });
      }
    }

    console.log(`✅ Created ${createdOrders.length} mock orders`);

    // 2. Seed Returns
    const returnReasons = [
      { reason: "damaged_item", description: "Item arrived damaged" },
      { reason: "customer_refused", description: "Customer refused delivery" },
      { reason: "wrong_product", description: "Wrong product delivered" }
    ];

    for (const { reason, description } of returnReasons) {
      const order = createdOrders.find(o => o.status === "delivered");
      if (order) {
        // Note: We'll need to add a returns table to the schema
        console.log(`⚠️  Returns table not in schema - would create return for order ${order.saylogixNumber} with reason: ${reason}`);
      }
    }

    // 3. Seed Dispatch Manifests
    const manifestData = [
      { status: "ready_for_pickup", scheduledDate: new Date() },
      { status: "ready_for_pickup", scheduledDate: new Date() },
      { status: "scheduled", scheduledDate: daysFromNow(1) },
      { status: "scheduled", scheduledDate: daysFromNow(1) }
    ];

    for (const { status, scheduledDate } of manifestData) {
      const manifestNumber = `MOCK_MAN_${daysFromNow(0).getFullYear()}_${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
      
      const manifestResult = await db.insert(manifests).values({
        manifestNumber,
        courierName: ["aramex", "smsa", "naqel"][Math.floor(Math.random() * 3)],
        totalPackages: Math.floor(Math.random() * 20) + 5,
        status,
        generatedAt: daysAgo(Math.floor(Math.random() * 3))
      }).returning();
      
      const manifest = manifestResult[0];

      // Add some orders to manifest
      const packedOrders = createdOrders.filter(o => o.status === "packed").slice(0, 3);
      for (const order of packedOrders) {
        await db.insert(manifestItems).values({
          manifestId: manifest.id,
          orderId: order.id,
          trackingNumber: `MOCK_TRK_${nanoid(8)}`,
          status: "staged",
          scannedAt: new Date()
        });
      }
    }

    console.log("✅ Created mock manifests");

    // 4. Seed Inbound - Purchase Orders
    const poData = [
      { status: "in_transit", eta: daysFromNow(3) },
      { status: "arrived", eta: new Date() }
    ];

    for (let i = 0; i < poData.length; i++) {
      const { status, eta } = poData[i];
      
      const poResult = await db.insert(purchaseOrders).values({
        poNumber: `MOCK_PO_${new Date().getFullYear()}_${String(i + 100).padStart(4, '0')}`,
        supplier: `Mock Supplier ${i + 1}`,
        status,
        eta,
        asnReceived: status !== "pending",
        dockAssignment: status === "arrived" ? `MOCK_DOCK_${i + 1}` : null,
        createdAt: daysAgo(Math.floor(Math.random() * 7))
      }).returning();
      
      const po = poResult[0];

      // Create GRN for arrived POs
      if (status === "arrived") {
        const grnResult = await db.insert(goodsReceiptNotes).values({
          grnNumber: `MOCK_GRN_${new Date().getFullYear()}_${String(i + 100).padStart(4, '0')}`,
          poId: po.id,
          poNumber: po.poNumber,
          supplier: po.supplier,
          status: "in_progress",
          processedBy: "Mock Receiver",
          createdAt: new Date()
        }).returning();
        
        const grn = grnResult[0];

        // Add GRN items
        for (let j = 0; j < 3; j++) {
          await db.insert(grnItems).values({
            grnId: grn.id,
            sku: `MOCK_SKU_${Math.floor(Math.random() * 100)}`,
            description: `Mock Inbound Product ${j + 1}`,
            expectedQuantity: Math.floor(Math.random() * 20) + 5,
            receivedQuantity: Math.floor(Math.random() * 20) + 5,
            discrepancy: null,
            binLocation: `MOCK_BIN_${Math.floor(Math.random() * 100)}`,
            scanStatus: "completed"
          });
        }

        // Create putaway tasks
        await db.insert(putawayTasks).values({
          grnId: grn.id,
          grnNumber: grn.grnNumber,
          status: "staged",
          assignedTo: null,
          createdAt: new Date()
        });
      }
    }

    console.log("✅ Created mock purchase orders and GRNs");

    // 5. Seed Inventory - Add expiry items
    const expiryItems = [
      { daysUntilExpiry: 5, status: "near_expiry" },
      { daysUntilExpiry: -2, status: "expired" }
    ];

    for (let i = 0; i < expiryItems.length; i++) {
      const { daysUntilExpiry, status } = expiryItems[i];
      
      await db.insert(productExpiry).values({
        sku: `MOCK_EXP_SKU_${i + 1}`,
        batchNumber: `MOCK_BATCH_${nanoid(6)}`,
        expiryDate: daysFromNow(daysUntilExpiry),
        quantity: Math.floor(Math.random() * 50) + 10,
        binLocation: `MOCK_BIN_${Math.floor(Math.random() * 100)}`,
        status,
        daysToExpiry: daysUntilExpiry,
        alertLevel: daysUntilExpiry <= 0 ? "red" : daysUntilExpiry <= 7 ? "yellow" : "green",
        createdAt: new Date()
      });
    }

    console.log("✅ Created mock expiry items");

    // 6. Seed Packing Queue
    const packingOrders = createdOrders.filter(o => o.status === "picked").slice(0, 3);
    
    for (const order of packingOrders) {
      await db.insert(packTasks).values({
        orderId: order.id,
        status: "pending",
        assignedTo: null,
        boxType: null,
        createdAt: new Date()
      });
    }

    console.log("✅ Created mock packing tasks");

    // 7. Seed Picking Tasks
    const pickingStatuses = [
      { status: "in_progress", pickedQty: 2 },
      { status: "completed", pickedQty: 5 },
      { status: "completed", pickedQty: 3 }
    ];

    for (let i = 0; i < pickingStatuses.length; i++) {
      const { status, pickedQty } = pickingStatuses[i];
      const order = createdOrders[i];
      
      if (order) {
        await db.insert(pickTasks).values({
          orderId: order.id,
          orderItemId: 1, // Mock item ID
          sku: `MOCK_SKU_${Math.floor(Math.random() * 100)}`,
          quantity: pickedQty,
          binLocation: `MOCK_BIN_${Math.floor(Math.random() * 100)}`,
          status,
          assignedTo: `MOCK_PICKER_${i + 1}`,
          pickPath: String.fromCharCode(65 + i), // A, B, C
          pickedQty: status === "completed" ? pickedQty : Math.floor(pickedQty / 2),
          pickedAt: status === "completed" ? hoursAgo(Math.floor(Math.random() * 5)) : null,
          toteId: `MOCK_TOTE_${Math.floor(Math.random() * 100)}`,
          createdAt: hoursAgo(Math.floor(Math.random() * 8))
        });
      }
    }

    console.log("✅ Created mock picking tasks");

    // 8. Keep existing Last Mile routes (already have MOCK_ prefix)
    console.log("✅ Last Mile routes already seeded with MOCK_ prefix");

    console.log("\n🎉 Mock data seeding completed successfully!");
    console.log("💡 To remove all mock data, run: clearMockData()");

  } catch (error) {
    console.error("❌ Error seeding mock data:", error);
    throw error;
  }
}

// Function to clear all mock data
export async function clearMockData() {
  console.log("🧹 Clearing all mock data...");

  try {
    // Clear events with MOCK source
    await db.delete(events).where(eq(events.sourceSystem, "MOCK"));
    
    // Clear orders and related data
    const mockOrders = await db.select().from(orders)
      .where(like(orders.sourceOrderNumber, "MOCK_%"));
    
    for (const order of mockOrders) {
      await db.delete(orderItems).where(eq(orderItems.orderId, order.id));
      await db.delete(pickTasks).where(eq(pickTasks.orderId, order.id));
      await db.delete(packTasks).where(eq(packTasks.orderId, order.id));
      await db.delete(manifestItems).where(eq(manifestItems.orderId, order.id));
    }
    
    await db.delete(orders).where(like(orders.sourceOrderNumber, "MOCK_%"));
    
    // Clear manifests
    await db.delete(manifests).where(like(manifests.manifestNumber, "MOCK_%"));
    
    // Clear purchase orders and related
    const mockPOs = await db.select().from(purchaseOrders)
      .where(like(purchaseOrders.poNumber, "MOCK_%"));
    
    for (const po of mockPOs) {
      const mockGRNs = await db.select().from(goodsReceiptNotes).where(eq(goodsReceiptNotes.poId, po.id));
      for (const grn of mockGRNs) {
        await db.delete(grnItems).where(eq(grnItems.grnId, grn.id));
        await db.delete(putawayTasks).where(eq(putawayTasks.grnId, grn.id));
      }
      await db.delete(goodsReceiptNotes).where(eq(goodsReceiptNotes.poId, po.id));
    }
    
    await db.delete(purchaseOrders).where(like(purchaseOrders.poNumber, "MOCK_%"));
    
    // Clear inventory expiry
    await db.delete(productExpiry).where(like(productExpiry.sku, "MOCK_%"));
    
    // Clear routes and stops
    const mockRoutes = await db.select().from(routes)
      .where(like(routes.routeNumber, "MOCK_%"));
    
    for (const route of mockRoutes) {
      await db.delete(routeStops).where(eq(routeStops.routeId, route.id));
    }
    
    await db.delete(routes).where(like(routes.routeNumber, "MOCK_%"));

    console.log("✅ All mock data cleared successfully!");
    
  } catch (error) {
    console.error("❌ Error clearing mock data:", error);
    throw error;
  }
}

// Add necessary imports that were missing
import { eq, like } from "drizzle-orm";