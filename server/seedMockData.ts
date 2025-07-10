import { db } from "./db";
import { 
  // Core business tables
  users,
  orders, 
  orderItems, 
  inventory,
  events,
  
  // Warehouse management tables
  pickTasks, 
  packTasks, 
  manifests, 
  manifestItems,
  routes,
  routeStops,
  
  // Inbound management tables
  purchaseOrders,
  purchaseOrderItems,
  goodsReceiptNotes,
  grnItems,
  putawayTasks,
  putawayItems,
  
  // Inventory management tables
  inventoryAdjustments,
  cycleCountTasks,
  cycleCountItems,
  productExpiry,
  
  // Integration & system tables
  addressVerifications,
  nasLookups,
  webhookLogs,
  
  // Configuration tables
  integrations,
  warehouseZones,
  staffRoles,
  toteCartTypes
} from "@shared/schema";
import { nanoid } from "nanoid";
import { eq, like } from "drizzle-orm";

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
  console.log("🌱 Starting comprehensive mock data seeding for all 28 tables...");

  try {
    // Clear existing mock data first to avoid duplicates
    await clearMockData();
    
    // Store created records for foreign key relationships
    const createdRecords = {
      users: [],
      orders: [],
      orderItems: [],
      inventory: [],
      pickTasks: [],
      packTasks: [],
      manifests: [],
      routes: [],
      purchaseOrders: [],
      goodsReceiptNotes: [],
      putawayTasks: [],
      cycleCountTasks: [],
      warehouseZones: [],
      staffRoles: [],
      toteCartTypes: [],
      integrations: []
    };

    // 1. CORE BUSINESS TABLES
    
    // 1.1 Users - Create staff members with different roles
    console.log("Seeding users...");
    const userRoles = [
      { username: "MOCK_admin", role: "admin", email: "admin@mock.com" },
      { username: "MOCK_picker_1", role: "picker", email: "picker1@mock.com" },
      { username: "MOCK_picker_2", role: "picker", email: "picker2@mock.com" },
      { username: "MOCK_packer_1", role: "packer", email: "packer1@mock.com" },
      { username: "MOCK_packer_2", role: "packer", email: "packer2@mock.com" },
      { username: "MOCK_dispatcher", role: "dispatcher", email: "dispatcher@mock.com" },
      { username: "MOCK_receiver", role: "receiver", email: "receiver@mock.com" },
      { username: "MOCK_driver_1", role: "driver", email: "driver1@mock.com" },
      { username: "MOCK_driver_2", role: "driver", email: "driver2@mock.com" },
      { username: "MOCK_supervisor", role: "supervisor", email: "supervisor@mock.com" }
    ];

    for (const userData of userRoles) {
      const [user] = await db.insert(users).values({
        ...userData,
        password: "mock_password_hash"
      }).returning();
      createdRecords.users.push(user);
    }

    // 1.2 Inventory - Create SKUs with different statuses
    console.log("Seeding inventory...");
    const skuCategories = [
      { category: "Electronics", prefix: "ELEC", count: 8 },
      { category: "Clothing", prefix: "CLOT", count: 6 },
      { category: "Home & Garden", prefix: "HOME", count: 4 },
      { category: "Health & Beauty", prefix: "HEAL", count: 2 }
    ];

    for (const { category, prefix, count } of skuCategories) {
      for (let i = 1; i <= count; i++) {
        const sku = `MOCK_${prefix}_${String(i).padStart(3, '0')}`;
        const [inventoryItem] = await db.insert(inventory).values({
          sku,
          productName: `MOCK_${category} Product ${i}`,
          category: `MOCK_${category}`,
          availableQty: Math.floor(Math.random() * 100) + 10,
          reservedQty: Math.floor(Math.random() * 20),
          onHandQty: Math.floor(Math.random() * 120) + 15,
          reorderLevel: Math.floor(Math.random() * 20) + 5,
          binLocation: `MOCK_${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
          status: Math.random() > 0.1 ? "active" : "discontinued"
        }).returning();
        createdRecords.inventory.push(inventoryItem);
      }
    }

    // 1.3 Orders - Create orders with different statuses
    console.log("Seeding orders...");
    const mockOrderStatuses = [
      { status: "fetched", count: 2 },
      { status: "verified", count: 2 },
      { status: "picked", count: 3 },
      { status: "packed", count: 3 },
      { status: "dispatched", count: 2 },
      { status: "delivered", count: 2 },
      { status: "cancelled", count: 1 }
    ];

    for (const { status, count } of mockOrderStatuses) {
      for (let i = 0; i < count; i++) {
        const orderNumber = getNextOrderNumber();
        const mockCity = ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina"][Math.floor(Math.random() * 5)];
        
        const [order] = await db.insert(orders).values({
          saylogixNumber: orderNumber,
          sourceOrderNumber: `MOCK_ORD_${1000 + orderCounter}`,
          sourceChannel: "shopify",
          sourceChannelData: { 
            id: `MOCK_${nanoid(10)}`, 
            source: "MOCK_SHOPIFY",
            total_price: (Math.random() * 2000 + 100).toFixed(2)
          },
          status,
          customerName: `MOCK_Customer_${orderCounter}`,
          customerPhone: `+966${Math.floor(Math.random() * 900000000 + 100000000)}`,
          customerEmail: `mock.customer${orderCounter}@test.com`,
          shippingAddress: {
            line1: `MOCK_${Math.floor(Math.random() * 999) + 1} King Fahd Road`,
            city: mockCity,
            region: mockCity === "Riyadh" ? "Central" : mockCity === "Jeddah" ? "Western" : "Eastern",
            country: "SA",
            postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
            source: "MOCK"
          },
          billingAddress: {
            line1: `MOCK_${Math.floor(Math.random() * 999) + 1} King Fahd Road`,
            city: mockCity,
            region: mockCity === "Riyadh" ? "Central" : mockCity === "Jeddah" ? "Western" : "Eastern",
            country: "SA",
            postal_code: `${Math.floor(Math.random() * 90000) + 10000}`,
            source: "MOCK"
          },
          coordinates: {
            lat: 24.7136 + (Math.random() - 0.5) * 0.1,
            lng: 46.6753 + (Math.random() - 0.5) * 0.1
          },
          orderValue: (Math.random() * 2000 + 100).toFixed(2),
          currency: "SAR",
          nasCode: `MOCK${Math.floor(Math.random() * 9000) + 1000}`,
          nasVerified: Math.random() > 0.2,
          courierAssigned: ["aramex", "smsa", "naqel"][Math.floor(Math.random() * 3)],
          trackingNumber: ["dispatched", "delivered"].includes(status) ? `MOCK_TRK_${nanoid(8)}` : null,
          priority: ["normal", "high", "urgent", "low"][Math.floor(Math.random() * 4)],
          orderFetched: daysAgo(Math.floor(Math.random() * 10) + 1),
          verifyCompleted: ["verified", "picked", "packed", "dispatched", "delivered"].includes(status) ? daysAgo(Math.floor(Math.random() * 8)) : null,
          pickingStarted: ["picked", "packed", "dispatched", "delivered"].includes(status) ? daysAgo(Math.floor(Math.random() * 5)) : null,
          pickingCompleted: ["packed", "dispatched", "delivered"].includes(status) ? daysAgo(Math.floor(Math.random() * 4)) : null,
          packingCompleted: ["dispatched", "delivered"].includes(status) ? daysAgo(Math.floor(Math.random() * 3)) : null,
          dispatched: ["dispatched", "delivered"].includes(status) ? daysAgo(Math.floor(Math.random() * 2)) : null,
          delivered: status === "delivered" ? daysAgo(Math.floor(Math.random() * 1)) : null
        }).returning();
        
        createdRecords.orders.push(order);
        orderCounter++;

        // 1.4 Order Items - Add items to each order
        const itemCount = Math.floor(Math.random() * 4) + 1;
        for (let j = 0; j < itemCount; j++) {
          const randomInventory = createdRecords.inventory[Math.floor(Math.random() * createdRecords.inventory.length)];
          const quantity = Math.floor(Math.random() * 3) + 1;
          const unitPrice = Math.random() * 500 + 50;
          
          const [orderItem] = await db.insert(orderItems).values({
            orderId: order.id,
            sku: randomInventory.sku,
            productName: randomInventory.productName,
            quantity,
            unitPrice: unitPrice.toFixed(2),
            totalPrice: (unitPrice * quantity).toFixed(2),
            weight: (Math.random() * 2 + 0.5).toFixed(3),
            picked: ["picked", "packed", "dispatched", "delivered"].includes(status),
            packed: ["packed", "dispatched", "delivered"].includes(status),
            binLocation: randomInventory.binLocation
          }).returning();
          
          createdRecords.orderItems.push(orderItem);
        }
      }
    }

    // 2. CONFIGURATION TABLES
    
    // 2.1 Warehouse Zones
    console.log("Seeding warehouse zones...");
    const zoneData = [
      { name: "MOCK_Zone_A", description: "MOCK_Receiving and staging area" },
      { name: "MOCK_Zone_B", description: "MOCK_Fast-moving products" },
      { name: "MOCK_Zone_C", description: "MOCK_Slow-moving products" },
      { name: "MOCK_Zone_D", description: "MOCK_Hazardous materials" },
      { name: "MOCK_Zone_E", description: "MOCK_Returns processing" }
    ];

    for (const zone of zoneData) {
      const [createdZone] = await db.insert(warehouseZones).values(zone).returning();
      createdRecords.warehouseZones.push(createdZone);
    }

    // 2.2 Staff Roles
    console.log("Seeding staff roles...");
    const roleData = [
      { 
        title: "MOCK_Warehouse_Picker", 
        description: "MOCK_Responsible for picking orders from inventory",
        permissions: ["pick_orders", "scan_items", "update_quantities"]
      },
      { 
        title: "MOCK_Warehouse_Packer", 
        description: "MOCK_Responsible for packing orders for shipment",
        permissions: ["pack_orders", "generate_labels", "scan_packages"]
      },
      { 
        title: "MOCK_Dispatch_Manager", 
        description: "MOCK_Manages dispatch operations and manifests",
        permissions: ["create_manifests", "assign_routes", "manage_couriers"]
      },
      { 
        title: "MOCK_Inventory_Manager", 
        description: "MOCK_Manages inventory levels and adjustments",
        permissions: ["adjust_inventory", "create_cycle_counts", "manage_expiry"]
      },
      { 
        title: "MOCK_System_Admin", 
        description: "MOCK_Full system access and configuration",
        permissions: ["admin_panel", "user_management", "system_config", "reports"]
      }
    ];

    for (const role of roleData) {
      const [createdRole] = await db.insert(staffRoles).values(role).returning();
      createdRecords.staffRoles.push(createdRole);
    }

    // 2.3 Tote Cart Types
    console.log("Seeding tote cart types...");
    const toteCartData = [
      { 
        name: "MOCK_Small_Tote", 
        type: "tote", 
        capacity: 20,
        dimensions: { length: 40, width: 30, height: 20 }
      },
      { 
        name: "MOCK_Medium_Tote", 
        type: "tote", 
        capacity: 40,
        dimensions: { length: 60, width: 40, height: 30 }
      },
      { 
        name: "MOCK_Large_Tote", 
        type: "tote", 
        capacity: 80,
        dimensions: { length: 80, width: 60, height: 40 }
      },
      { 
        name: "MOCK_Pick_Cart", 
        type: "cart", 
        capacity: 200,
        dimensions: { length: 120, width: 80, height: 100 }
      },
      { 
        name: "MOCK_Pack_Cart", 
        type: "cart", 
        capacity: 150,
        dimensions: { length: 100, width: 70, height: 90 }
      }
    ];

    for (const equipment of toteCartData) {
      const [created] = await db.insert(toteCartTypes).values(equipment).returning();
      createdRecords.toteCartTypes.push(created);
    }

    // 2.4 Integrations
    console.log("Seeding integrations...");
    const integrationData = [
      {
        name: "MOCK_Shopify_Store",
        type: "shopify",
        category: "ecommerce",
        isEnabled: true,
        config: {
          store_url: "mock-store.myshopify.com",
          api_key: "MOCK_API_KEY",
          webhook_url: "https://mock.webhook.url"
        },
        lastSyncAt: daysAgo(1),
        successCount: 145,
        failureCount: 3
      },
      {
        name: "MOCK_Aramex_API",
        type: "aramex",
        category: "courier",
        isEnabled: true,
        config: {
          account_number: "MOCK_123456",
          api_key: "MOCK_ARAMEX_KEY"
        },
        lastSyncAt: hoursAgo(2),
        successCount: 89,
        failureCount: 1
      },
      {
        name: "MOCK_Google_Maps",
        type: "google_maps",
        category: "maps",
        isEnabled: true,
        config: {
          api_key: "MOCK_MAPS_KEY"
        },
        lastSyncAt: hoursAgo(6),
        successCount: 234,
        failureCount: 0
      },
      {
        name: "MOCK_WhatsApp_Business",
        type: "whatsapp",
        category: "messaging",
        isEnabled: false,
        config: {
          phone_number_id: "MOCK_WA_PHONE",
          access_token: "MOCK_WA_TOKEN"
        },
        lastSyncAt: null,
        successCount: 0,
        failureCount: 0
      }
    ];

    for (const integration of integrationData) {
      const [created] = await db.insert(integrations).values(integration).returning();
      createdRecords.integrations.push(created);
    }

    // 3. WAREHOUSE MANAGEMENT TABLES
    
    // 3.1 Pick Tasks - Create picking tasks for orders that need picking
    console.log("Seeding pick tasks...");
    const ordersNeedingPicks = createdRecords.orders.filter(o => 
      ["verified", "picked", "packed", "dispatched", "delivered"].includes(o.status)
    );

    for (const order of ordersNeedingPicks) {
      const orderItems = createdRecords.orderItems.filter(item => item.orderId === order.id);
      
      for (const orderItem of orderItems) {
        const assignedPicker = Math.random() > 0.3 ? 
          createdRecords.users.find(u => u.role === "picker") : null;
          
        const [pickTask] = await db.insert(pickTasks).values({
          orderId: order.id,
          orderItemId: orderItem.id,
          sku: orderItem.sku,
          quantity: orderItem.quantity,
          binLocation: orderItem.binLocation,
          status: order.status === "verified" ? "pending" : 
                 order.status === "picked" ? "completed" : "completed",
          assignedTo: assignedPicker?.username || null,
          pickPath: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
          pickedQty: order.status === "verified" ? 0 : orderItem.quantity,
          pickedAt: order.status !== "verified" ? daysAgo(Math.floor(Math.random() * 3)) : null,
          toteId: order.status !== "verified" ? `T${nanoid(4)}` : null
        }).returning();
        
        createdRecords.pickTasks.push(pickTask);
      }
    }

    // 3.2 Pack Tasks - Create packing tasks for picked orders
    console.log("Seeding pack tasks...");
    const ordersNeedingPacking = createdRecords.orders.filter(o => 
      ["picked", "packed", "dispatched", "delivered"].includes(o.status)
    );

    for (const order of ordersNeedingPacking) {
      const assignedPacker = Math.random() > 0.3 ? 
        createdRecords.users.find(u => u.role === "packer") : null;
      const toteId = `T${nanoid(4)}`;
      
      const [packTask] = await db.insert(packTasks).values({
        orderId: order.id,
        toteId,
        status: order.status === "picked" ? "pending" : "completed",
        assignedTo: assignedPacker?.username || null,
        boxType: ["Small", "Medium", "Large"][Math.floor(Math.random() * 3)],
        weight: (Math.random() * 5 + 0.5).toFixed(3),
        dimensions: `${Math.floor(Math.random() * 30 + 20)}x${Math.floor(Math.random() * 20 + 15)}x${Math.floor(Math.random() * 15 + 10)}`,
        labelGenerated: order.status !== "picked",
        trackingNumber: order.trackingNumber,
        packedAt: order.status === "picked" ? null : daysAgo(Math.floor(Math.random() * 2))
      }).returning();
      
      createdRecords.packTasks.push(packTask);
    }

    // 3.3 Manifests - Create courier manifests
    console.log("Seeding manifests...");
    const couriers = ["aramex", "smsa", "naqel"];
    
    for (let i = 0; i < 4; i++) {
      const courier = couriers[i % couriers.length];
      const manifestStatus = i < 2 ? "pending" : i === 2 ? "generated" : "handed_over";
      
      const [manifest] = await db.insert(manifests).values({
        manifestNumber: `MOCK_MAN_${new Date().getFullYear()}_${String(Date.now() + i).slice(-6)}`,
        courierName: courier,
        totalPackages: Math.floor(Math.random() * 25) + 5,
        status: manifestStatus,
        generatedAt: daysAgo(Math.floor(Math.random() * 3)),
        handedOverAt: manifestStatus === "handed_over" ? daysAgo(1) : null,
        handedOverTo: manifestStatus === "handed_over" ? `MOCK_${courier}_Representative` : null
      }).returning();
      
      createdRecords.manifests.push(manifest);

      // 3.4 Manifest Items - Add orders to manifests
      const packedOrders = createdRecords.orders.filter(o => 
        ["packed", "dispatched", "delivered"].includes(o.status) && o.courierAssigned === courier
      ).slice(0, 3);
      
      for (const order of packedOrders) {
        await db.insert(manifestItems).values({
          manifestId: manifest.id,
          orderId: order.id,
          trackingNumber: order.trackingNumber || `MOCK_TRK_${nanoid(8)}`,
          status: manifestStatus === "handed_over" ? "collected" : "staged",
          scannedAt: manifestStatus !== "pending" ? daysAgo(1) : null
        });
      }
    }

    // 3.5 Routes - Create delivery routes
    console.log("Seeding routes...");
    const routeStatuses = ["planned", "assigned", "in_progress", "completed"];
    
    for (let i = 0; i < 5; i++) {
      const status = routeStatuses[i % routeStatuses.length];
      const driver = createdRecords.users.find(u => u.role === "driver");
      const zone = createdRecords.warehouseZones[Math.floor(Math.random() * createdRecords.warehouseZones.length)];
      
      const [route] = await db.insert(routes).values({
        routeNumber: `MOCK_RT_${new Date().getFullYear()}_${String(Date.now() + i).slice(-6)}`,
        driverId: driver?.id.toString() || null,
        driverName: driver?.username || null,
        vehicleNumber: `VH${String(i + 1).padStart(3, '0')}`,
        totalStops: Math.floor(Math.random() * 15) + 5,
        completedStops: status === "completed" ? Math.floor(Math.random() * 15) + 5 : 
                       status === "in_progress" ? Math.floor(Math.random() * 10) : 0,
        status,
        zone: zone?.name || "Zone_A",
        lastScan: status !== "planned" ? hoursAgo(Math.floor(Math.random() * 12)) : null,
        estimatedDuration: Math.floor(Math.random() * 6) + 4,
        actualDuration: status === "completed" ? Math.floor(Math.random() * 300) + 180 : null,
        startedAt: status !== "planned" ? daysAgo(Math.floor(Math.random() * 2)) : null,
        completedAt: status === "completed" ? daysAgo(Math.floor(Math.random() * 1)) : null
      }).returning();
      
      createdRecords.routes.push(route);

      // 3.6 Route Stops - Add delivery stops to routes
      const dispatchedOrders = createdRecords.orders.filter(o => 
        ["dispatched", "delivered"].includes(o.status)
      ).slice(0, Math.floor(Math.random() * 5) + 2);
      
      for (let stopIndex = 0; stopIndex < dispatchedOrders.length; stopIndex++) {
        const order = dispatchedOrders[stopIndex];
        const stopStatus = status === "completed" ? "delivered" : 
                          status === "in_progress" && stopIndex < route.completedStops ? "delivered" : "pending";
        
        await db.insert(routeStops).values({
          routeId: route.id,
          orderId: order.id,
          stopSequence: stopIndex + 1,
          address: order.shippingAddress,
          coordinates: order.coordinates,
          status: stopStatus,
          attemptCount: stopStatus === "delivered" ? 1 : 0,
          deliveredAt: stopStatus === "delivered" ? daysAgo(Math.floor(Math.random() * 1)) : null,
          failureReason: null
        });
      }
    }

    // 4. INBOUND MANAGEMENT TABLES
    
    // 4.1 Purchase Orders
    console.log("Seeding purchase orders...");
    const poStatuses = ["pending", "in_transit", "arrived", "unloaded"];
    
    for (let i = 0; i < 5; i++) {
      const status = poStatuses[i % poStatuses.length];
      
      const [po] = await db.insert(purchaseOrders).values({
        poNumber: `MOCK_PO_${new Date().getFullYear()}_${String(Date.now() + i).slice(-6)}`,
        supplier: `MOCK_Supplier_${String.fromCharCode(65 + i)}`,
        eta: status === "pending" ? daysFromNow(Math.floor(Math.random() * 10) + 3) : 
             status === "in_transit" ? daysFromNow(Math.floor(Math.random() * 3) + 1) : 
             daysAgo(Math.floor(Math.random() * 5)),
        status,
        asnReceived: status !== "pending",
        asnNumbers: status !== "pending" ? [`MOCK_ASN_${nanoid(8)}`, `MOCK_ASN_${nanoid(8)}`] : null,
        gateEntry: ["arrived", "unloaded"].includes(status),
        gateEntryTime: ["arrived", "unloaded"].includes(status) ? daysAgo(Math.floor(Math.random() * 3)) : null,
        dockAssignment: ["arrived", "unloaded"].includes(status) ? `DOCK_${i + 1}` : null,
        unloaded: status === "unloaded",
        unloadingComments: status === "unloaded" ? `MOCK_Unloading completed for PO ${i + 1}` : null,
        unloadingTime: status === "unloaded" ? daysAgo(Math.floor(Math.random() * 2)) : null
      }).returning();
      
      createdRecords.purchaseOrders.push(po);

      // 4.2 Purchase Order Items
      const itemCount = Math.floor(Math.random() * 5) + 2;
      for (let j = 0; j < itemCount; j++) {
        const randomInventory = createdRecords.inventory[Math.floor(Math.random() * createdRecords.inventory.length)];
        const expectedQty = Math.floor(Math.random() * 50) + 10;
        const receivedQty = ["arrived", "unloaded"].includes(status) ? 
          expectedQty + Math.floor(Math.random() * 10) - 5 : 0;
        
        await db.insert(purchaseOrderItems).values({
          poId: po.id,
          sku: randomInventory.sku,
          description: randomInventory.productName,
          expectedQuantity: expectedQty,
          receivedQuantity: receivedQty,
          unitCost: (Math.random() * 100 + 10).toFixed(2),
          totalCost: ((Math.random() * 100 + 10) * expectedQty).toFixed(2)
        });
      }
    }

    // 4.3 Goods Receipt Notes - For arrived/unloaded POs
    console.log("Seeding goods receipt notes...");
    const arrivedPOs = createdRecords.purchaseOrders.filter(po => 
      ["arrived", "unloaded"].includes(po.status)
    );

    for (const po of arrivedPOs) {
      const receiver = createdRecords.users.find(u => u.role === "receiver");
      
      const [grn] = await db.insert(goodsReceiptNotes).values({
        grnNumber: `MOCK_GRN_${new Date().getFullYear()}_${String(Date.now() + po.id).slice(-6)}`,
        poId: po.id,
        poNumber: po.poNumber,
        supplier: po.supplier,
        status: po.status === "unloaded" ? "completed" : "in_progress",
        processedBy: receiver?.username || "MOCK_Receiver",
        processingStarted: daysAgo(Math.floor(Math.random() * 2)),
        processingCompleted: po.status === "unloaded" ? daysAgo(Math.floor(Math.random() * 1)) : null,
        discrepancyNotes: Math.random() > 0.7 ? `MOCK_Minor discrepancy in quantities` : null
      }).returning();
      
      createdRecords.goodsReceiptNotes.push(grn);

      // 4.4 GRN Items
      const poItems = await db.select().from(purchaseOrderItems).where({ poId: po.id });
      
      for (const poItem of poItems) {
        await db.insert(grnItems).values({
          grnId: grn.id,
          sku: poItem.sku,
          description: poItem.description,
          expectedQuantity: poItem.expectedQuantity,
          receivedQuantity: poItem.receivedQuantity,
          discrepancy: poItem.receivedQuantity !== poItem.expectedQuantity ? 
            `MOCK_Qty difference: ${poItem.receivedQuantity - poItem.expectedQuantity}` : null,
          binLocation: `MOCK_${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${String(Math.floor(Math.random() * 20) + 1).padStart(2, '0')}`,
          scanStatus: po.status === "unloaded" ? "completed" : "pending"
        });
      }

      // 4.5 Putaway Tasks
      const [putawayTask] = await db.insert(putawayTasks).values({
        grnId: grn.id,
        grnNumber: grn.grnNumber,
        status: po.status === "unloaded" ? "completed" : "staged",
        assignedTo: receiver?.username || null,
        assignedAt: daysAgo(Math.floor(Math.random() * 2)),
        startedAt: po.status === "unloaded" ? daysAgo(Math.floor(Math.random() * 1)) : null,
        completedAt: po.status === "unloaded" ? daysAgo(Math.floor(Math.random() * 1)) : null,
        cartId: `CT${nanoid(3)}`,
        notes: `MOCK_Putaway for ${grn.grnNumber}`
      }).returning();
      
      createdRecords.putawayTasks.push(putawayTask);

      // 4.6 Putaway Items
      const grnItems = await db.select().from(grnItems).where({ grnId: grn.id });
      
      for (const grnItem of grnItems) {
        await db.insert(putawayItems).values({
          putawayTaskId: putawayTask.id,
          sku: grnItem.sku,
          description: grnItem.description,
          quantity: grnItem.receivedQuantity,
          binLocation: grnItem.binLocation,
          scanStatus: po.status === "unloaded" ? "completed" : "pending",
          scannedAt: po.status === "unloaded" ? daysAgo(Math.floor(Math.random() * 1)) : null,
          placedAt: po.status === "unloaded" ? daysAgo(Math.floor(Math.random() * 1)) : null
        });
      }
    }

    // 5. INVENTORY MANAGEMENT TABLES
    
    // 5.1 Inventory Adjustments
    console.log("Seeding inventory adjustments...");
    const adjustmentReasons = [
      { reason: "MOCK_Damage", type: "decrease", details: "Items damaged during handling" },
      { reason: "MOCK_Found", type: "increase", details: "Additional items found during cycle count" },
      { reason: "MOCK_Loss", type: "decrease", details: "Items lost/missing" },
      { reason: "MOCK_Return", type: "increase", details: "Customer return processed" }
    ];

    for (let i = 0; i < 6; i++) {
      const randomInventory = createdRecords.inventory[Math.floor(Math.random() * createdRecords.inventory.length)];
      const adjustment = adjustmentReasons[i % adjustmentReasons.length];
      const beforeQty = Math.floor(Math.random() * 50) + 10;
      const adjustmentQty = Math.floor(Math.random() * 10) + 1;
      const afterQty = adjustment.type === "increase" ? beforeQty + adjustmentQty : beforeQty - adjustmentQty;
      const supervisor = createdRecords.users.find(u => u.role === "supervisor");
      
      await db.insert(inventoryAdjustments).values({
        adjustmentNumber: `MOCK_ADJ_${String(i + 1).padStart(3, '0')}`,
        sku: randomInventory.sku,
        binLocation: randomInventory.binLocation,
        adjustmentType: adjustment.type,
        reason: adjustment.reason,
        reasonDetails: adjustment.details,
        beforeQty,
        adjustmentQty: adjustment.type === "increase" ? adjustmentQty : -adjustmentQty,
        afterQty,
        status: i < 4 ? "approved" : "pending",
        requestedBy: createdRecords.users[Math.floor(Math.random() * createdRecords.users.length)].username,
        approvedBy: i < 4 ? supervisor?.username || "MOCK_Supervisor" : null,
        approvedAt: i < 4 ? daysAgo(Math.floor(Math.random() * 3)) : null,
        appliedAt: i < 4 ? daysAgo(Math.floor(Math.random() * 2)) : null
      });
    }

    // 5.2 Cycle Count Tasks
    console.log("Seeding cycle count tasks...");
    const countTypes = ["zone", "sku", "location", "discrepancy"];
    
    for (let i = 0; i < 4; i++) {
      const countType = countTypes[i];
      const counter = createdRecords.users.find(u => u.role === "picker");
      const status = i < 2 ? "completed" : i === 2 ? "in_progress" : "created";
      
      const [cycleCountTask] = await db.insert(cycleCountTasks).values({
        taskNumber: `MOCK_CC_${String(i + 1).padStart(3, '0')}`,
        countType,
        criteria: {
          type: countType,
          zone: countType === "zone" ? `MOCK_Zone_${String.fromCharCode(65 + i)}` : null,
          sku_list: countType === "sku" ? [`MOCK_ELEC_001`, `MOCK_ELEC_002`] : null,
          location_range: countType === "location" ? "MOCK_A01-A10" : null
        },
        status,
        assignedTo: counter?.username || null,
        expectedItemCount: Math.floor(Math.random() * 20) + 5,
        completedItemCount: status === "completed" ? Math.floor(Math.random() * 20) + 5 : 
                          status === "in_progress" ? Math.floor(Math.random() * 10) : 0,
        discrepancyCount: status === "completed" ? Math.floor(Math.random() * 3) : 0,
        startedAt: status !== "created" ? daysAgo(Math.floor(Math.random() * 5)) : null,
        completedAt: status === "completed" ? daysAgo(Math.floor(Math.random() * 2)) : null,
        dueDate: daysFromNow(Math.floor(Math.random() * 7) + 1),
        notes: `MOCK_Cycle count for ${countType} criteria`
      }).returning();
      
      createdRecords.cycleCountTasks.push(cycleCountTask);

      // 5.3 Cycle Count Items
      const itemsToCount = Math.floor(Math.random() * 8) + 3;
      for (let j = 0; j < itemsToCount; j++) {
        const randomInventory = createdRecords.inventory[Math.floor(Math.random() * createdRecords.inventory.length)];
        const systemQty = Math.floor(Math.random() * 50) + 10;
        const countedQty = status === "completed" ? systemQty + Math.floor(Math.random() * 6) - 3 : 
                          status === "in_progress" && j < cycleCountTask.completedItemCount ? systemQty + Math.floor(Math.random() * 4) - 2 : null;
        
        await db.insert(cycleCountItems).values({
          taskId: cycleCountTask.id,
          sku: randomInventory.sku,
          binLocation: randomInventory.binLocation,
          systemQty,
          countedQty,
          discrepancy: countedQty ? countedQty - systemQty : 0,
          status: countedQty !== null ? "counted" : "pending",
          countedBy: countedQty !== null ? counter?.username || null : null,
          countedAt: countedQty !== null ? daysAgo(Math.floor(Math.random() * 2)) : null,
          notes: countedQty && Math.abs(countedQty - systemQty) > 2 ? "MOCK_Significant discrepancy found" : null,
          adjustmentCreated: countedQty && Math.abs(countedQty - systemQty) > 2 ? true : false
        });
      }
    }

    // 5.4 Product Expiry
    console.log("Seeding product expiry...");
    const expiryStatuses = ["active", "near_expiry", "expired"];
    const alertLevels = ["green", "yellow", "red"];
    
    for (let i = 0; i < 8; i++) {
      const randomInventory = createdRecords.inventory[Math.floor(Math.random() * createdRecords.inventory.length)];
      const daysToExpiry = i < 2 ? Math.floor(Math.random() * 30) + 30 : // green
                          i < 5 ? Math.floor(Math.random() * 7) + 1 : // yellow
                          -(Math.floor(Math.random() * 10) + 1); // red (expired)
      
      const status = daysToExpiry > 7 ? "active" : daysToExpiry > 0 ? "near_expiry" : "expired";
      const alertLevel = daysToExpiry > 7 ? "green" : daysToExpiry > 0 ? "yellow" : "red";
      
      await db.insert(productExpiry).values({
        sku: randomInventory.sku,
        batchNumber: `BT${nanoid(4)}`,
        binLocation: randomInventory.binLocation,
        quantity: Math.floor(Math.random() * 30) + 5,
        expiryDate: daysFromNow(daysToExpiry),
        status,
        daysToExpiry,
        alertLevel
      });
    }

    // 6. INTEGRATION & SYSTEM TABLES
    
    // 6.1 Address Verifications
    console.log("Seeding address verifications...");
    const verificationOrders = createdRecords.orders.slice(0, 8);
    
    for (const order of verificationOrders) {
      const verificationMethods = ["SPL", "NAS", "WhatsApp", "Manual"];
      const method = verificationMethods[Math.floor(Math.random() * verificationMethods.length)];
      const isVerified = Math.random() > 0.2;
      
      await db.insert(addressVerifications).values({
        orderId: order.id,
        originalAddress: order.shippingAddress,
        verifiedAddress: isVerified ? {
          ...order.shippingAddress,
          verified: true,
          method: `MOCK_${method}`,
          timestamp: new Date().toISOString()
        } : null,
        status: isVerified ? "verified" : "pending",
        verificationMethod: `MOCK_${method}`,
        nasCode: order.nasCode,
        whatsappMessageId: method === "WhatsApp" ? `WA${nanoid(6)}` : null,
        customerResponse: method === "WhatsApp" && isVerified ? "MOCK_Customer confirmed address" : null,
        verifiedAt: isVerified ? daysAgo(Math.floor(Math.random() * 5)) : null
      });
    }

    // 6.2 NAS Lookups
    console.log("Seeding NAS lookups...");
    const saudiCities = ["Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Taif", "Tabuk", "Buraidah"];
    
    for (let i = 0; i < 10; i++) {
      const city = saudiCities[Math.floor(Math.random() * saudiCities.length)];
      const district = `MOCK_District_${String.fromCharCode(65 + Math.floor(Math.random() * 10))}`;
      
      await db.insert(nasLookups).values({
        nasCode: `MOCK${Math.floor(Math.random() * 9000) + 1000}`,
        address: `MOCK_${Math.floor(Math.random() * 999) + 1} King Fahd Road, ${district}, ${city}`,
        city,
        district,
        postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
        coordinates: {
          lat: 24.7136 + (Math.random() - 0.5) * 2,
          lng: 46.6753 + (Math.random() - 0.5) * 3
        },
        verified: Math.random() > 0.1,
        lastVerified: daysAgo(Math.floor(Math.random() * 30))
      });
    }

    // 6.3 Events - Create comprehensive system events
    console.log("Seeding system events...");
    const eventTypes = [
      { id: "EV001", type: "order_created", entity: "order" },
      { id: "EV002", type: "order_verified", entity: "order" },
      { id: "EV003", type: "inventory_adjusted", entity: "inventory" },
      { id: "EV004", type: "pick_completed", entity: "pick_task" },
      { id: "EV005", type: "pack_completed", entity: "pack_task" },
      { id: "EV006", type: "manifest_generated", entity: "manifest" },
      { id: "EV007", type: "route_started", entity: "route" },
      { id: "EV008", type: "delivery_completed", entity: "order" },
      { id: "EV009", type: "po_received", entity: "purchase_order" },
      { id: "EV010", type: "cycle_count_started", entity: "cycle_count" }
    ];

    for (let i = 0; i < 20; i++) {
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const relatedOrders = createdRecords.orders;
      const relatedOrder = relatedOrders[Math.floor(Math.random() * relatedOrders.length)];
      
      await db.insert(events).values({
        eventId: `MOCK_${eventType.id}_${nanoid(6)}`,
        eventType: eventType.type,
        entityType: eventType.entity,
        entityId: relatedOrder.id,
        description: `MOCK_${eventType.type.replace('_', ' ')} for ${eventType.entity} ${relatedOrder.id}`,
        status: Math.random() > 0.05 ? "success" : "error",
        triggeredBy: "MOCK_system",
        sourceSystem: "MOCK_SaylogixOS",
        eventData: {
          source: "MOCK",
          entity_id: relatedOrder.id,
          timestamp: new Date().toISOString()
        },
        previousState: { status: "previous_state" },
        newState: { status: "new_state" },
        metadata: { version: "1.0", source: "MOCK" },
        errorMessage: Math.random() > 0.95 ? "MOCK_Sample error message" : null
      });
    }

    // 6.4 Webhook Logs
    console.log("Seeding webhook logs...");
    const webhookEndpoints = [
      "https://mock-shopify.myshopify.com/webhooks/orders",
      "https://mock-api.aramex.com/webhooks/tracking",
      "https://mock-whatsapp.business.com/webhooks/messages"
    ];

    for (let i = 0; i < 12; i++) {
      const endpoint = webhookEndpoints[i % webhookEndpoints.length];
      const status = i < 9 ? "completed" : i === 9 ? "failed" : "pending";
      const responseStatus = status === "completed" ? 200 : status === "failed" ? 500 : null;
      
      await db.insert(webhookLogs).values({
        webhookId: `WH${nanoid(6)}`,
        url: endpoint,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Webhook-Source": "MOCK",
          "Authorization": "Bearer MOCK_TOKEN"
        },
        payload: {
          event_type: "order.updated",
          order_id: `MOCK_${i + 1000}`,
          timestamp: new Date().toISOString(),
          data: { source: "MOCK" }
        },
        status,
        responseStatus,
        responseBody: status === "completed" ? '{"success": true}' : 
                     status === "failed" ? '{"error": "Internal server error"}' : null,
        retryCount: status === "failed" ? Math.floor(Math.random() * 3) + 1 : 0,
        maxRetries: 3,
        nextRetryAt: status === "failed" ? daysFromNow(1) : null,
        lastAttemptAt: status !== "pending" ? daysAgo(Math.floor(Math.random() * 5)) : null
      });
    }

    console.log("\n🎉 COMPREHENSIVE MOCK DATA SEEDING COMPLETED!");
    console.log("📊 Successfully populated all 28 database tables with linked mock data:");
    console.log("   ✅ Core Business: users, orders, order_items, inventory");
    console.log("   ✅ Warehouse Management: pick_tasks, pack_tasks, manifests, manifest_items, routes, route_stops");
    console.log("   ✅ Inbound Management: purchase_orders, purchase_order_items, goods_receipt_notes, grn_items, putaway_tasks, putaway_items");
    console.log("   ✅ Inventory Management: inventory_adjustments, cycle_count_tasks, cycle_count_items, product_expiry");
    console.log("   ✅ Configuration: warehouse_zones, staff_roles, tote_cart_types, integrations");
    console.log("   ✅ Integration & System: address_verifications, nas_lookups, events, webhook_logs");
    console.log("\n💡 All mock data uses MOCK_ prefixes for easy identification and cleanup");
    console.log("🧹 To remove all mock data, use the 'Clear All Mock Data' button in Admin Panel");

  } catch (error) {
    console.error("❌ Error during comprehensive mock data seeding:", error);
    throw error;
  }
}

// Function to clear all comprehensive mock data
export async function clearMockData() {
  console.log("🧹 Clearing all comprehensive mock data from 28 tables...");

  try {
    // 1. Clear integration & system tables
    console.log("Clearing integration & system tables...");
    await db.delete(webhookLogs).where(like(webhookLogs.webhookId, "MOCK_%"));
    await db.delete(events).where(eq(events.sourceSystem, "MOCK_SaylogixOS"));
    await db.delete(addressVerifications).where(like(addressVerifications.nasCode, "MOCK%"));
    await db.delete(nasLookups).where(like(nasLookups.nasCode, "MOCK%"));

    // 2. Clear warehouse management tables with proper foreign key handling
    console.log("Clearing warehouse management tables...");
    
    // Clear route stops first, then routes
    const mockRoutes = await db.select().from(routes)
      .where(like(routes.routeNumber, "MOCK_%"));
    
    for (const route of mockRoutes) {
      await db.delete(routeStops).where(eq(routeStops.routeId, route.id));
    }
    await db.delete(routes).where(like(routes.routeNumber, "MOCK_%"));

    // Clear manifest items first, then manifests  
    const mockManifests = await db.select().from(manifests)
      .where(like(manifests.manifestNumber, "MOCK_%"));
      
    for (const manifest of mockManifests) {
      await db.delete(manifestItems).where(eq(manifestItems.manifestId, manifest.id));
    }
    await db.delete(manifests).where(like(manifests.manifestNumber, "MOCK_%"));

    // 3. Clear orders and related data
    console.log("Clearing orders and related tables...");
    const mockOrders = await db.select().from(orders)
      .where(like(orders.sourceOrderNumber, "MOCK_%"));
    
    for (const order of mockOrders) {
      await db.delete(orderItems).where(eq(orderItems.orderId, order.id));
      await db.delete(pickTasks).where(eq(pickTasks.orderId, order.id));
      await db.delete(packTasks).where(eq(packTasks.orderId, order.id));
    }
    await db.delete(orders).where(like(orders.sourceOrderNumber, "MOCK_%"));

    // 4. Clear inbound management tables
    console.log("Clearing inbound management tables...");
    const mockPOs = await db.select().from(purchaseOrders)
      .where(like(purchaseOrders.poNumber, "MOCK_%"));
    
    for (const po of mockPOs) {
      // Get GRNs for this PO
      const mockGRNs = await db.select().from(goodsReceiptNotes)
        .where(eq(goodsReceiptNotes.poId, po.id));
      
      for (const grn of mockGRNs) {
        // Clear putaway items first
        const mockPutawayTasks = await db.select().from(putawayTasks)
          .where(eq(putawayTasks.grnId, grn.id));
          
        for (const putawayTask of mockPutawayTasks) {
          await db.delete(putawayItems).where(eq(putawayItems.putawayTaskId, putawayTask.id));
        }
        
        // Clear putaway tasks and GRN items
        await db.delete(putawayTasks).where(eq(putawayTasks.grnId, grn.id));
        await db.delete(grnItems).where(eq(grnItems.grnId, grn.id));
      }
      
      // Clear GRNs and PO items
      await db.delete(goodsReceiptNotes).where(eq(goodsReceiptNotes.poId, po.id));
      await db.delete(purchaseOrderItems).where(eq(purchaseOrderItems.poId, po.id));
    }
    await db.delete(purchaseOrders).where(like(purchaseOrders.poNumber, "MOCK_%"));

    // 5. Clear inventory management tables
    console.log("Clearing inventory management tables...");
    
    // Clear cycle count items first, then tasks
    const mockCycleCounts = await db.select().from(cycleCountTasks)
      .where(like(cycleCountTasks.taskNumber, "MOCK_%"));
      
    for (const cycleCount of mockCycleCounts) {
      await db.delete(cycleCountItems).where(eq(cycleCountItems.taskId, cycleCount.id));
    }
    await db.delete(cycleCountTasks).where(like(cycleCountTasks.taskNumber, "MOCK_%"));
    
    // Clear other inventory tables
    await db.delete(inventoryAdjustments).where(like(inventoryAdjustments.adjustmentNumber, "MOCK_%"));
    await db.delete(productExpiry).where(like(productExpiry.batchNumber, "MOCK_%"));

    // 6. Clear core business tables
    console.log("Clearing core business tables...");
    await db.delete(inventory).where(like(inventory.sku, "MOCK_%"));
    await db.delete(users).where(like(users.username, "MOCK_%"));

    // 7. Clear configuration tables
    console.log("Clearing configuration tables...");
    await db.delete(integrations).where(like(integrations.name, "MOCK_%"));
    await db.delete(warehouseZones).where(like(warehouseZones.name, "MOCK_%"));
    await db.delete(staffRoles).where(like(staffRoles.title, "MOCK_%"));
    await db.delete(toteCartTypes).where(like(toteCartTypes.name, "MOCK_%"));

    console.log("✅ Successfully cleared all mock data from 28 database tables");
    console.log("🔄 Database is now clean and ready for authentic data or fresh mock seeding");

  } catch (error) {
    console.error("❌ Error clearing mock data:", error);
    throw error;
  }
}