import { db } from "./db";
import { 
  users, orders, orderItems, inventory, pickTasks, packTasks, 
  manifests, manifestItems, routes, warehouseZones, staffRoles, integrations
} from "@shared/schema";
import { nanoid } from "nanoid";

// Helper functions
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000);

let orderCounter = 500;
const getNextOrderNumber = () => {
  const year = new Date().getFullYear() % 100;
  return `SL${year}-${String(orderCounter++).padStart(3, '0')}`;
};

export async function seedBasicData() {
  console.log("🌱 Starting basic mock data seeding for core functionality...");
  
  const createdRecords: any = {
    users: [],
    inventory: [],
    orders: [],
    orderItems: [],
    pickTasks: [],
    packTasks: [],
    manifests: [],
    routes: [],
    warehouseZones: [],
    staffRoles: [],
    integrations: []
  };

  // 1. Users
  const userData = [
    { username: "MOCK_admin", password: "password", email: "admin@saylogix.com", role: "admin" },
    { username: "MOCK_picker", password: "password", email: "picker@saylogix.com", role: "picker" },
    { username: "MOCK_packer", password: "password", email: "packer@saylogix.com", role: "packer" },
    { username: "MOCK_driver", password: "password", email: "driver@saylogix.com", role: "driver" }
  ];

  for (const user of userData) {
    const [created] = await db.insert(users).values(user).returning();
    createdRecords.users.push(created);
  }

  // 2. Inventory
  const inventoryData = [
    { sku: "MOCK_ELEC_001", productName: "MOCK_Electronics Product 1", category: "Electronics", availableQty: 50, onHandQty: 55, binLocation: "A01" },
    { sku: "MOCK_CLOT_001", productName: "MOCK_Clothing Product 1", category: "Clothing", availableQty: 30, onHandQty: 32, binLocation: "B01" },
    { sku: "MOCK_HOME_001", productName: "MOCK_Home Product 1", category: "Home", availableQty: 25, onHandQty: 28, binLocation: "C01" }
  ];

  for (const item of inventoryData) {
    const [created] = await db.insert(inventory).values(item).returning();
    createdRecords.inventory.push(created);
  }

  // 3. Orders with proper JSON structures
  const orderStatuses = ["verified", "picked", "packed", "dispatched"];
  
  for (let i = 0; i < 4; i++) {
    const status = orderStatuses[i];
    const [order] = await db.insert(orders).values({
      saylogixNumber: getNextOrderNumber(),
      sourceOrderNumber: `MOCK_ORD_${1000 + i}`,
      sourceChannel: "shopify",
      sourceChannelData: { id: `MOCK_${nanoid(10)}`, source: "MOCK_SHOPIFY" },
      status,
      customerName: `MOCK_Customer_${i + 1}`,
      customerPhone: "+966500000000",
      customerEmail: `customer${i + 1}@test.com`,
      shippingAddress: {
        line1: "123 Main Street",
        city: "Riyadh",
        region: "Central",
        country: "SA",
        postal_code: "12345"
      },
      billingAddress: {
        line1: "123 Main Street", 
        city: "Riyadh",
        region: "Central",
        country: "SA",
        postal_code: "12345"
      },
      coordinates: { lat: 24.7136, lng: 46.6753 },
      orderValue: "199.99",
      currency: "SAR",
      nasCode: "1234",
      courierAssigned: "aramex",
      trackingNumber: ["dispatched"].includes(status) ? `TRK_${nanoid(8)}` : null,
      orderFetched: daysAgo(5),
      verifyCompleted: daysAgo(4),
      pickingCompleted: ["picked", "packed", "dispatched"].includes(status) ? daysAgo(3) : null,
      packingCompleted: ["packed", "dispatched"].includes(status) ? daysAgo(2) : null,
      dispatched: status === "dispatched" ? daysAgo(1) : null
    }).returning();
    
    createdRecords.orders.push(order);

    // Order items
    const randomInventory = createdRecords.inventory[i % createdRecords.inventory.length];
    const [orderItem] = await db.insert(orderItems).values({
      orderId: order.id,
      sku: randomInventory.sku,
      productName: randomInventory.productName,
      quantity: 2,
      unitPrice: "99.99",
      totalPrice: "199.98",
      weight: "1.500",
      picked: ["picked", "packed", "dispatched"].includes(status),
      packed: ["packed", "dispatched"].includes(status),
      binLocation: randomInventory.binLocation
    }).returning();
    
    createdRecords.orderItems.push(orderItem);
  }

  // 4. Basic warehouse zones
  const zoneData = [
    { name: "Zone_A", description: "Receiving area" },
    { name: "Zone_B", description: "Fast-moving products" }
  ];

  for (const zone of zoneData) {
    const [created] = await db.insert(warehouseZones).values(zone).returning();
    createdRecords.warehouseZones.push(created);
  }

  // 5. Basic integrations
  const [integration] = await db.insert(integrations).values({
    name: "Shopify_Store",
    type: "shopify",
    category: "ecommerce",
    isEnabled: true,
    config: { store_url: "test-store.myshopify.com", api_key: "test_key" },
    lastSyncAt: hoursAgo(1),
    successCount: 10,
    failureCount: 0
  }).returning();
  
  createdRecords.integrations.push(integration);

  console.log("✅ Basic mock data seeding completed successfully");
  console.log(`Created: ${createdRecords.orders.length} orders, ${createdRecords.inventory.length} inventory items, ${createdRecords.users.length} users`);
  
  return createdRecords;
}