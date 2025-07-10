import { db } from "./db";
import { 
  // Core business tables
  users, orders, orderItems, inventory, events,
  
  // Warehouse management tables
  pickTasks, packTasks, manifests, manifestItems, routes, routeStops,
  
  // Inbound management tables
  purchaseOrders, purchaseOrderItems, goodsReceiptNotes, grnItems, putawayTasks, putawayItems,
  
  // Inventory management tables
  inventoryAdjustments, cycleCountTasks, cycleCountItems, productExpiry,
  
  // Integration & system tables
  addressVerifications, nasLookups, webhookLogs,
  
  // Configuration tables
  integrations, warehouseZones, staffRoles, toteCartTypes
} from "@shared/schema";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";

// Helper functions
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);
const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

let orderCounter = 700;
const getNextOrderNumber = () => {
  const year = new Date().getFullYear() % 100;
  return `SL${year}-${String(orderCounter++).padStart(3, '0')}`;
};

export async function seedMockDataComprehensive() {
  console.log("🌱 Starting comprehensive mock data seeding for all 28+ tables...");
  
  try {
    // Clear existing mock data first using SQL
    await clearMockDataComprehensive();
    
    // 1. CONFIGURATION TABLES (seed first as they're referenced by others)
    console.log("Seeding configuration tables...");
    
    // Warehouse zones
    const zones = [
      { name: "MOCK_Zone_A", description: "Receiving and inbound area" },
      { name: "MOCK_Zone_B", description: "Fast-moving products" },
      { name: "MOCK_Zone_C", description: "Slow-moving products" },
      { name: "MOCK_Zone_D", description: "High-value items" },
      { name: "MOCK_Zone_E", description: "Hazardous materials" }
    ];
    
    for (const zone of zones) {
      await db.insert(warehouseZones).values(zone);
    }
    
    // Staff roles
    const roles = [
      { title: "MOCK_Picker", permissions: { pick: true, pack: false }, description: "Can perform picking operations", isActive: true },
      { title: "MOCK_Packer", permissions: { pick: false, pack: true }, description: "Can perform packing operations", isActive: true },
      { title: "MOCK_Supervisor", permissions: { pick: true, pack: true, manage: true }, description: "Full warehouse access", isActive: true },
      { title: "MOCK_Driver", permissions: { deliver: true }, description: "Delivery operations", isActive: true },
      { title: "MOCK_Receiver", permissions: { receive: true }, description: "Inbound operations", isActive: true }
    ];
    
    for (const role of roles) {
      await db.insert(staffRoles).values(role);
    }
    
    // Tote cart types
    const cartTypes = [
      { name: "MOCK_Small_Tote", type: "tote", capacity: 10, dimensions: { length: 40, width: 30, height: 20 }, isActive: true },
      { name: "MOCK_Medium_Tote", type: "tote", capacity: 25, dimensions: { length: 60, width: 40, height: 30 }, isActive: true },
      { name: "MOCK_Large_Tote", type: "tote", capacity: 50, dimensions: { length: 80, width: 60, height: 40 }, isActive: true },
      { name: "MOCK_Cart_A", type: "cart", capacity: 100, dimensions: { length: 120, width: 80, height: 100 }, isActive: true },
      { name: "MOCK_Cart_B", type: "cart", capacity: 150, dimensions: { length: 150, width: 100, height: 120 }, isActive: true }
    ];
    
    for (const cartType of cartTypes) {
      await db.insert(toteCartTypes).values(cartType);
    }
    
    // 2. CORE BUSINESS TABLES
    console.log("Seeding core business tables...");
    
    // Users
    const userData = [
      { username: "MOCK_admin_comp", password: "password", email: "admin@mock.com", role: "admin" },
      { username: "MOCK_picker_comp", password: "password", email: "picker@mock.com", role: "picker" },
      { username: "MOCK_packer_comp", password: "password", email: "packer@mock.com", role: "packer" },
      { username: "MOCK_driver_comp", password: "password", email: "driver@mock.com", role: "driver" },
      { username: "MOCK_supervisor_comp", password: "password", email: "supervisor@mock.com", role: "supervisor" }
    ];
    
    const createdUsers = [];
    for (const user of userData) {
      const [created] = await db.insert(users).values(user).returning();
      createdUsers.push(created);
    }
    
    // Inventory
    const inventoryData = [
      { sku: "MOCK_LAPTOP_001", productName: "MOCK_Gaming Laptop Pro", category: "Electronics", availableQty: 45, onHandQty: 50, binLocation: "MOCK_A01", weight: "2.5", dimensions: { length: 40, width: 30, height: 5 } },
      { sku: "MOCK_PHONE_001", productName: "MOCK_Smartphone X", category: "Electronics", availableQty: 120, onHandQty: 125, binLocation: "MOCK_A02", weight: "0.2", dimensions: { length: 15, width: 8, height: 1 } },
      { sku: "MOCK_SHIRT_001", productName: "MOCK_Cotton T-Shirt", category: "Clothing", availableQty: 200, onHandQty: 210, binLocation: "MOCK_B01", weight: "0.3", dimensions: { length: 30, width: 25, height: 2 } },
      { sku: "MOCK_BOOK_001", productName: "MOCK_Programming Guide", category: "Books", availableQty: 75, onHandQty: 80, binLocation: "MOCK_C01", weight: "0.8", dimensions: { length: 25, width: 20, height: 3 } },
      { sku: "MOCK_TOY_001", productName: "MOCK_Educational Toy Set", category: "Toys", availableQty: 60, onHandQty: 65, binLocation: "MOCK_D01", weight: "1.2", dimensions: { length: 35, width: 35, height: 20 } }
    ];
    
    const createdInventory = [];
    for (const item of inventoryData) {
      const [created] = await db.insert(inventory).values(item).returning();
      createdInventory.push(created);
    }
    
    // Orders
    const createdOrders = [];
    const orderStatuses = ["verified", "picked", "packed", "dispatched", "delivered"];
    
    for (let i = 0; i < 5; i++) {
      const status = orderStatuses[i];
      const [order] = await db.insert(orders).values({
        saylogixNumber: getNextOrderNumber(),
        sourceOrderNumber: `MOCK_ORD_${3000 + i}`,
        sourceChannel: "shopify",
        sourceChannelData: { id: `MOCK_${nanoid(10)}`, source: "MOCK_SHOPIFY" },
        status,
        customerName: `MOCK_Customer_${i + 1}`,
        customerPhone: `+96650000000${i}`,
        customerEmail: `mock_customer${i + 1}@test.com`,
        shippingAddress: {
          line1: `${100 + i} Mock Street`,
          city: "Riyadh",
          region: "Central",
          country: "SA",
          postal_code: `1234${i}`
        },
        billingAddress: {
          line1: `${100 + i} Mock Street`,
          city: "Riyadh",
          region: "Central",
          country: "SA",
          postal_code: `1234${i}`
        },
        coordinates: { lat: 24.7136 + (i * 0.01), lng: 46.6753 + (i * 0.01) },
        orderValue: String((199.99 + (i * 50)).toFixed(2)),
        currency: "SAR",
        nasCode: `MOCK${1234 + i}`,
        courierAssigned: ["aramex", "smsa", "naqel"][i % 3],
        trackingNumber: ["dispatched", "delivered"].includes(status) ? `MOCK_TRK_${nanoid(8)}` : null,
        orderFetched: daysAgo(10 - i),
        verifyCompleted: daysAgo(9 - i),
        pickingCompleted: ["picked", "packed", "dispatched", "delivered"].includes(status) ? daysAgo(8 - i) : null,
        packingCompleted: ["packed", "dispatched", "delivered"].includes(status) ? daysAgo(7 - i) : null,
        dispatched: ["dispatched", "delivered"].includes(status) ? daysAgo(6 - i) : null,
        delivered: status === "delivered" ? daysAgo(5 - i) : null
      }).returning();
      
      createdOrders.push(order);
      
      // Order items
      const itemCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < itemCount; j++) {
        const randomInventory = createdInventory[j % createdInventory.length];
        await db.insert(orderItems).values({
          orderId: order.id,
          sku: randomInventory.sku,
          productName: randomInventory.productName,
          quantity: Math.floor(Math.random() * 3) + 1,
          unitPrice: String((49.99 + (j * 10)).toFixed(2)),
          totalPrice: String((49.99 + (j * 10)) * 2),
          weight: randomInventory.weight,
          picked: ["picked", "packed", "dispatched", "delivered"].includes(status),
          packed: ["packed", "dispatched", "delivered"].includes(status),
          binLocation: randomInventory.binLocation
        });
      }
    }
    
    // 3. WAREHOUSE MANAGEMENT TABLES
    console.log("Seeding warehouse management tables...");
    
    // First, get all order items
    const allOrderItems = await db.select().from(orderItems).where(sql`order_id IN ${sql.raw(`(${createdOrders.map(o => o.id).join(',')})`)}`);;

    // Pick tasks
    for (const order of createdOrders.filter(o => ["verified", "picked", "packed", "dispatched", "delivered"].includes(o.status))) {
      const picker = createdUsers.find(u => u.role === "picker");
      const orderItemsForOrder = allOrderItems.filter(item => item.orderId === order.id);
      
      for (const item of orderItemsForOrder) {
        const inventoryItem = createdInventory.find(inv => inv.sku === item.sku);
        if (inventoryItem) {
          await db.insert(pickTasks).values({
            orderId: order.id,
            orderItemId: item.id,
            inventoryId: inventoryItem.id,
            sku: item.sku,
            binLocation: inventoryItem.binLocation,
            saylogixNumber: order.saylogixNumber,
            status: ["picked", "packed", "dispatched", "delivered"].includes(order.status) ? "completed" : "assigned",
            priority: "normal",
            assignedTo: picker?.username || "MOCK_picker_comp",
            quantity: item.quantity,
            toteId: `MOCK_TOTE_${nanoid(4)}`,
            cartId: `MOCK_CART_${nanoid(3)}`,
            startedAt: ["picked", "packed", "dispatched", "delivered"].includes(order.status) ? daysAgo(8) : null,
            completedAt: ["picked", "packed", "dispatched", "delivered"].includes(order.status) ? daysAgo(7) : null
          });
        }
      }
    }
    
    // Pack tasks
    for (const order of createdOrders.filter(o => ["picked", "packed", "dispatched", "delivered"].includes(o.status))) {
      const packer = createdUsers.find(u => u.role === "packer");
      await db.insert(packTasks).values({
        orderId: order.id,
        saylogixNumber: order.saylogixNumber,
        status: ["packed", "dispatched", "delivered"].includes(order.status) ? "completed" : "in_progress",
        assignedTo: packer?.username || "MOCK_packer_comp",
        toteId: `MOCK_TOTE_${nanoid(4)}`,
        packingStation: `MOCK_STATION_${Math.floor(Math.random() * 5) + 1}`,
        boxSize: ["small", "medium", "large"][Math.floor(Math.random() * 3)],
        packingMaterials: { bubble_wrap: true, packing_peanuts: false },
        startedAt: daysAgo(7),
        completedAt: ["packed", "dispatched", "delivered"].includes(order.status) ? daysAgo(6) : null
      });
    }
    
    // Manifests
    const manifestData = [];
    for (let i = 0; i < 3; i++) {
      const courier = ["aramex", "smsa", "naqel"][i];
      const [manifest] = await db.insert(manifests).values({
        manifestNumber: `MOCK_MAN_${new Date().getFullYear()}_${String(i + 1).padStart(4, '0')}`,
        courierName: courier,
        status: i === 0 ? "handed_over" : "generated",
        orderCount: 2,
        generatedBy: "MOCK_supervisor_comp",
        handedOverTo: i === 0 ? "MOCK_Courier_Driver" : null,
        handedOverAt: i === 0 ? daysAgo(5) : null
      }).returning();
      
      manifestData.push(manifest);
      
      // Manifest items
      const ordersForManifest = createdOrders.filter(o => o.courierAssigned === courier).slice(0, 2);
      for (const order of ordersForManifest) {
        await db.insert(manifestItems).values({
          manifestId: manifest.id,
          orderId: order.id,
          saylogixNumber: order.saylogixNumber,
          trackingNumber: order.trackingNumber || `MOCK_TRK_${nanoid(8)}`,
          awbNumber: `MOCK_AWB_${nanoid(10)}`
        });
      }
    }
    
    // Routes
    for (let i = 0; i < 3; i++) {
      const driver = createdUsers.find(u => u.role === "driver");
      const status = i === 0 ? "completed" : i === 1 ? "in_progress" : "planned";
      const [route] = await db.insert(routes).values({
        routeNumber: `MOCK_ROUTE_${new Date().getFullYear()}_${String(i + 1).padStart(3, '0')}`,
        driverId: driver?.id || 1,
        driverName: driver?.username || "MOCK_driver_comp",
        vehicleId: `MOCK_VEH_${i + 1}`,
        status,
        plannedStops: 3,
        completedStops: status === "completed" ? 3 : status === "in_progress" ? 1 : 0,
        startTime: status !== "planned" ? daysAgo(2) : null,
        endTime: status === "completed" ? daysAgo(1) : null,
        totalDistance: "45.5",
        estimatedDuration: 180
      }).returning();
      
      // Route stops
      for (let j = 0; j < 3; j++) {
        const stopStatus = status === "completed" ? "delivered" : 
                          status === "in_progress" && j === 0 ? "delivered" : "pending";
        await db.insert(routeStops).values({
          routeId: route.id,
          orderId: createdOrders[j].id,
          stopSequence: j + 1,
          address: createdOrders[j].shippingAddress || { line1: "Mock address" },
          coordinates: createdOrders[j].coordinates,
          status: stopStatus,
          estimatedArrival: daysAgo(1),
          actualArrival: stopStatus === "delivered" ? daysAgo(1) : null,
          deliveryNotes: stopStatus === "delivered" ? "MOCK_Delivered successfully" : null
        });
      }
    }
    
    // 4. INBOUND MANAGEMENT TABLES
    console.log("Seeding inbound management tables...");
    
    // Purchase orders
    for (let i = 0; i < 5; i++) {
      const status = ["pending", "confirmed", "in_transit", "arrived", "unloaded"][i];
      const [po] = await db.insert(purchaseOrders).values({
        poNumber: `MOCK_PO_${new Date().getFullYear()}_${String(i + 1).padStart(4, '0')}`,
        supplier: `MOCK_Supplier_${String.fromCharCode(65 + i)}`,
        status,
        expectedDate: daysFromNow(10 - (i * 2)),
        actualArrivalDate: ["arrived", "unloaded"].includes(status) ? daysAgo(i) : null,
        itemCount: 3,
        totalValue: String((1000 + (i * 500)).toFixed(2)),
        currency: "SAR",
        trackingNumber: ["in_transit", "arrived", "unloaded"].includes(status) ? `MOCK_TRACK_${nanoid(8)}` : null,
        asnReceived: ["confirmed", "in_transit", "arrived", "unloaded"].includes(status),
        gateEntry: ["arrived", "unloaded"].includes(status),
        gateEntryTime: ["arrived", "unloaded"].includes(status) ? daysAgo(i) : null,
        dockAssignment: ["arrived", "unloaded"].includes(status) ? `MOCK_DOCK_${i + 1}` : null,
        unloaded: status === "unloaded",
        unloadingComments: status === "unloaded" ? `MOCK_Unloading completed for PO ${i + 1}` : null,
        unloadingTime: status === "unloaded" ? daysAgo(i - 1) : null
      }).returning();
      
      // Purchase order items
      for (let j = 0; j < 3; j++) {
        const randomInventory = createdInventory[j % createdInventory.length];
        await db.insert(purchaseOrderItems).values({
          poId: po.id,
          sku: randomInventory.sku,
          description: randomInventory.productName,
          expectedQuantity: 50 + (j * 10),
          receivedQuantity: ["arrived", "unloaded"].includes(status) ? 50 + (j * 10) : 0,
          unitCost: String((10 + (j * 5)).toFixed(2)),
          totalCost: String((10 + (j * 5)) * (50 + (j * 10)))
        });
      }
      
      // GRNs for arrived/unloaded POs
      if (["arrived", "unloaded"].includes(status)) {
        const receiver = createdUsers.find(u => u.username.includes("receiver")) || createdUsers[0];
        const [grn] = await db.insert(goodsReceiptNotes).values({
          grnNumber: `MOCK_GRN_${new Date().getFullYear()}_${String(i + 1).padStart(4, '0')}`,
          poId: po.id,
          poNumber: po.poNumber,
          supplier: po.supplier,
          status: status === "unloaded" ? "completed" : "in_progress",
          processedBy: receiver.username,
          processingStarted: daysAgo(i),
          processingCompleted: status === "unloaded" ? daysAgo(i - 1) : null,
          discrepancyNotes: null
        }).returning();
        
        // Putaway tasks
        const [putawayTask] = await db.insert(putawayTasks).values({
          grnId: grn.id,
          grnNumber: grn.grnNumber,
          status: status === "unloaded" ? "completed" : "staged",
          assignedTo: receiver.username,
          assignedAt: daysAgo(i),
          startedAt: status === "unloaded" ? daysAgo(i - 1) : null,
          completedAt: status === "unloaded" ? daysAgo(i - 1) : null,
          cartId: `MOCK_CT${nanoid(3)}`,
          notes: `MOCK_Putaway for ${grn.grnNumber}`
        }).returning();
      }
    }
    
    // 5. INVENTORY MANAGEMENT TABLES
    console.log("Seeding inventory management tables...");
    
    // Inventory adjustments
    const adjustmentTypes = [
      { reason: "MOCK_Damage", type: "decrease", details: "Items damaged during handling" },
      { reason: "MOCK_Found", type: "increase", details: "Additional items found" },
      { reason: "MOCK_Loss", type: "decrease", details: "Items missing" },
      { reason: "MOCK_Return", type: "increase", details: "Customer return" },
      { reason: "MOCK_Expiry", type: "decrease", details: "Expired products" }
    ];
    
    for (let i = 0; i < 5; i++) {
      const randomInventory = createdInventory[i % createdInventory.length];
      const adjustment = adjustmentTypes[i];
      const supervisor = createdUsers.find(u => u.role === "supervisor");
      
      await db.insert(inventoryAdjustments).values({
        adjustmentNumber: `MOCK_ADJ_${String(i + 1).padStart(3, '0')}`,
        sku: randomInventory.sku,
        binLocation: randomInventory.binLocation,
        adjustmentType: adjustment.type as "increase" | "decrease",
        reason: adjustment.reason,
        reasonDetails: adjustment.details,
        beforeQty: 50,
        adjustmentQty: adjustment.type === "increase" ? 5 : -5,
        afterQty: adjustment.type === "increase" ? 55 : 45,
        status: i < 3 ? "approved" : "pending",
        requestedBy: createdUsers[i % createdUsers.length].username,
        approvedBy: i < 3 ? supervisor?.username : null,
        approvedAt: i < 3 ? daysAgo(i) : null,
        appliedAt: i < 3 ? daysAgo(i) : null
      });
    }
    
    // Cycle count tasks
    for (let i = 0; i < 3; i++) {
      const zone = zones[i];
      const counter = createdUsers[i % createdUsers.length];
      const [task] = await db.insert(cycleCountTasks).values({
        taskNumber: `MOCK_CC_${String(i + 1).padStart(3, '0')}`,
        countType: "zone",
        criteria: { zone: zone.name },
        status: i === 0 ? "completed" : i === 1 ? "in_progress" : "created",
        assignedTo: counter.username,
        expectedItemCount: 10,
        completedItemCount: i === 0 ? 10 : i === 1 ? 5 : 0,
        discrepancyCount: i === 0 ? 2 : 0,
        startedAt: i < 2 ? daysAgo(i) : null,
        completedAt: i === 0 ? daysAgo(0) : null,
        dueDate: daysFromNow(7),
        notes: `MOCK_Cycle count for ${zone.name}`
      }).returning();
      
      // Cycle count items
      if (i < 2) {
        for (let j = 0; j < 3; j++) {
          const randomInventory = createdInventory[j];
          await db.insert(cycleCountItems).values({
            taskId: task.id,
            sku: randomInventory.sku,
            binLocation: randomInventory.binLocation,
            systemQty: 50,
            countedQty: i === 0 ? (j === 0 ? 48 : 50) : null,
            discrepancy: i === 0 && j === 0 ? -2 : 0,
            status: i === 0 ? "completed" : "pending",
            countedBy: i === 0 ? counter.username : null,
            countedAt: i === 0 ? daysAgo(0) : null,
            adjustmentCreated: i === 0 && j === 0
          });
        }
      }
    }
    
    // Product expiry
    for (let i = 0; i < 5; i++) {
      const randomInventory = createdInventory[i % createdInventory.length];
      const daysToExpiry = i === 0 ? -5 : i === 1 ? 0 : i === 2 ? 3 : i === 3 ? 15 : 60;
      
      await db.insert(productExpiry).values({
        sku: randomInventory.sku,
        batchNumber: `MOCK_BT${nanoid(4)}`,
        binLocation: randomInventory.binLocation,
        quantity: 20 + (i * 5),
        expiryDate: daysFromNow(daysToExpiry),
        status: daysToExpiry < 0 ? "expired" : daysToExpiry <= 7 ? "near_expiry" : "active",
        daysToExpiry,
        alertLevel: daysToExpiry < 0 ? "red" : daysToExpiry <= 7 ? "yellow" : "green"
      });
    }
    
    // 6. INTEGRATION & SYSTEM TABLES
    console.log("Seeding integration & system tables...");
    
    // Integrations
    const integrationData = [
      { name: "MOCK_Shopify_Store", type: "shopify", category: "ecommerce", isEnabled: true, config: { store_url: "mock-store.myshopify.com" }, lastSyncAt: hoursAgo(2), successCount: 100, failureCount: 2 },
      { name: "MOCK_Aramex_API", type: "aramex", category: "courier", isEnabled: true, config: { api_key: "mock_key" }, lastSyncAt: hoursAgo(1), successCount: 50, failureCount: 0 },
      { name: "MOCK_WhatsApp_Business", type: "whatsapp", category: "messaging", isEnabled: false, config: {}, lastSyncAt: null, successCount: 0, failureCount: 0 },
      { name: "MOCK_Google_Maps", type: "google_maps", category: "maps", isEnabled: true, config: { api_key: "mock_maps_key" }, lastSyncAt: hoursAgo(0.5), successCount: 200, failureCount: 1 },
      { name: "MOCK_Stripe_Payments", type: "stripe", category: "payments", isEnabled: false, config: {}, lastSyncAt: null, successCount: 0, failureCount: 0 }
    ];
    
    for (const integration of integrationData) {
      await db.insert(integrations).values(integration);
    }
    
    // Address verifications
    for (const order of createdOrders) {
      await db.insert(addressVerifications).values({
        orderId: order.id,
        originalAddress: order.shippingAddress || { line1: "Mock address" },
        verifiedAddress: order.shippingAddress ? { ...order.shippingAddress, verified: true } : null,
        status: "verified",
        verificationMethod: "MOCK_SPL",
        nasCode: order.nasCode,
        whatsappMessageId: null,
        customerResponse: null,
        verifiedAt: order.verifyCompleted
      });
    }
    
    // NAS lookups
    const saudiCities = ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"];
    for (let i = 0; i < 5; i++) {
      await db.insert(nasLookups).values({
        nasCode: `MOCK${5000 + i}`,
        address: `MOCK_${100 + i} King Fahd Road, District ${String.fromCharCode(65 + i)}`,
        city: saudiCities[i],
        district: `MOCK_District_${String.fromCharCode(65 + i)}`,
        postalCode: `${12340 + i}`,
        coordinates: { lat: 24.7136 + (i * 0.1), lng: 46.6753 + (i * 0.1) },
        verified: true,
        lastVerified: daysAgo(30 - i)
      });
    }
    
    // Events
    const eventTypes = [
      { eventId: "EV001", type: "order_created", entity: "order" },
      { eventId: "EV002", type: "order_verified", entity: "order" },
      { eventId: "EV003", type: "pick_completed", entity: "pick_task" },
      { eventId: "EV004", type: "pack_completed", entity: "pack_task" },
      { eventId: "EV005", type: "manifest_created", entity: "manifest" }
    ];
    
    for (let i = 0; i < 5; i++) {
      const eventType = eventTypes[i];
      await db.insert(events).values({
        eventId: `MOCK_${eventType.eventId}_${nanoid(6)}`,
        eventType: eventType.type,
        entityType: eventType.entity,
        entityId: createdOrders[i % createdOrders.length].id,
        description: `MOCK_${eventType.type.replace('_', ' ')} for ${eventType.entity}`,
        status: "success",
        triggeredBy: "MOCK_system",
        sourceSystem: "MOCK_SaylogixOS",
        eventData: { mock: true, timestamp: new Date().toISOString() },
        previousState: { status: "previous" },
        newState: { status: "current" },
        metadata: { version: "1.0" },
        errorMessage: null
      });
    }
    
    // Webhook logs
    for (let i = 0; i < 5; i++) {
      const status = i < 3 ? "completed" : i === 3 ? "failed" : "pending";
      await db.insert(webhookLogs).values({
        webhookId: `WH${nanoid(6)}`,
        url: `https://mock-api.example.com/webhook/${i}`,
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Mock": "true" },
        payload: { event: "order.updated", orderId: `MOCK_${1000 + i}` },
        status,
        responseStatus: status === "completed" ? 200 : status === "failed" ? 500 : null,
        responseBody: status === "completed" ? '{"success":true}' : status === "failed" ? '{"error":"Server error"}' : null,
        retryCount: status === "failed" ? 2 : 0,
        maxRetries: 3,
        nextRetryAt: status === "failed" ? daysFromNow(1) : null,
        lastAttemptAt: status !== "pending" ? daysAgo(i) : null
      });
    }
    
    console.log("\n🎉 COMPREHENSIVE MOCK DATA SEEDING COMPLETED!");
    console.log("📊 Successfully populated all 28+ database tables with rich test data");
    console.log("💡 All mock data uses MOCK_ prefixes for easy identification");
    console.log("🧹 To remove all mock data, use the 'Clear All Mock Data' button");
    
  } catch (error) {
    console.error("❌ Error during comprehensive mock data seeding:", error);
    throw error;
  }
}

// Clear function using raw SQL to avoid LIKE issues
export async function clearMockDataComprehensive() {
  console.log("🧹 Clearing existing comprehensive mock data...");
  
  try {
    // Use raw SQL for clearing to avoid LIKE syntax issues
    await db.execute(sql`DELETE FROM webhook_logs WHERE url LIKE '%mock%'`);
    await db.execute(sql`DELETE FROM events WHERE source_system = 'MOCK_SaylogixOS'`);
    await db.execute(sql`DELETE FROM address_verifications WHERE verification_method LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM nas_lookups WHERE nas_code LIKE 'MOCK%'`);
    
    await db.execute(sql`DELETE FROM product_expiry WHERE batch_number LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM cycle_count_items`);
    await db.execute(sql`DELETE FROM cycle_count_tasks WHERE task_number LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM inventory_adjustments WHERE adjustment_number LIKE 'MOCK_%'`);
    
    await db.execute(sql`DELETE FROM putaway_items`);
    await db.execute(sql`DELETE FROM putaway_tasks WHERE cart_id LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM grn_items`);
    await db.execute(sql`DELETE FROM goods_receipt_notes WHERE grn_number LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM purchase_order_items`);
    await db.execute(sql`DELETE FROM purchase_orders WHERE po_number LIKE 'MOCK_%'`);
    
    await db.execute(sql`DELETE FROM route_stops`);
    await db.execute(sql`DELETE FROM routes WHERE route_number LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM manifest_items`);
    await db.execute(sql`DELETE FROM manifests WHERE manifest_number LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM pack_tasks WHERE tote_id LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM pick_tasks WHERE tote_id LIKE 'MOCK_%'`);
    
    await db.execute(sql`DELETE FROM order_items WHERE sku LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM orders WHERE source_order_number LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM inventory WHERE sku LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM users WHERE username LIKE 'MOCK_%'`);
    
    await db.execute(sql`DELETE FROM integrations WHERE name LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM tote_cart_types WHERE name LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM staff_roles WHERE title LIKE 'MOCK_%'`);
    await db.execute(sql`DELETE FROM warehouse_zones WHERE name LIKE 'MOCK_%'`);
    
    console.log("✅ Mock data cleared successfully");
  } catch (error) {
    console.error("Error clearing mock data:", error);
    throw error;
  }
}