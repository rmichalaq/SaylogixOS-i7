import {
  users, orders, orderItems, inventory, events, addressVerifications,
  nasLookups, pickTasks, packTasks, manifests, manifestItems,
  routes, routeStops, webhookLogs, integrations, warehouseZones, 
  staffRoles, toteCartTypes, purchaseOrders, purchaseOrderItems,
  goodsReceiptNotes, grnItems, putawayTasks, putawayItems,
  inventoryAdjustments, cycleCountTasks, cycleCountItems, productExpiry,
  type User, type InsertUser, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type Inventory, type InsertInventory,
  type Event, type InsertEvent, type AddressVerification, type InsertAddressVerification,
  type NasLookup, type InsertNasLookup, type PickTask, type InsertPickTask,
  type PackTask, type InsertPackTask, type Manifest, type InsertManifest,
  type ManifestItem, type InsertManifestItem, type Route, type InsertRoute,
  type RouteStop, type InsertRouteStop, type WebhookLog, type InsertWebhookLog,
  type Integration, type InsertIntegration, type WarehouseZone, type InsertWarehouseZone,
  type StaffRole, type InsertStaffRole, type ToteCartType, type InsertToteCartType,
  type PurchaseOrder, type InsertPurchaseOrder, type PurchaseOrderItem, type InsertPurchaseOrderItem,
  type GoodsReceiptNote, type InsertGoodsReceiptNote, type GrnItem, type InsertGrnItem,
  type PutawayTask, type InsertPutawayTask, type PutawayItem, type InsertPutawayItem,
  type InventoryAdjustment, type InsertInventoryAdjustment, type CycleCountTask, type InsertCycleCountTask,
  type CycleCountItem, type InsertCycleCountItem, type ProductExpiry, type InsertProductExpiry
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql, count, sum } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  getOrderBySourceNumber(sourceNumber: string, channel: string): Promise<Order | undefined>;
  getRecentOrders(limit?: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<void>;

  // Order Items
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;

  // Inventory
  getInventoryBySku(sku: string): Promise<Inventory | undefined>;
  getInventoryById(id: number): Promise<Inventory | undefined>;
  updateInventory(sku: string, updates: Partial<InsertInventory>): Promise<void>;
  updateInventoryById(id: number, updates: Partial<InsertInventory>): Promise<void>;
  createInventory(item: InsertInventory): Promise<Inventory>;
  getAllInventory(): Promise<Inventory[]>;

  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getEvents(entityType?: string, entityId?: number): Promise<Event[]>;

  // Address Verifications
  createAddressVerification(verification: InsertAddressVerification): Promise<AddressVerification>;
  updateAddressVerification(id: number, updates: Partial<InsertAddressVerification>): Promise<void>;
  getNasLookup(nasCode: string): Promise<NasLookup | undefined>;

  // Pick Tasks
  createPickTask(task: InsertPickTask): Promise<PickTask>;
  getPickTasks(orderId?: number): Promise<PickTask[]>;
  updatePickTask(id: number, updates: Partial<InsertPickTask>): Promise<void>;

  // Pack Tasks
  createPackTask(task: InsertPackTask): Promise<PackTask>;
  getPackTasks(orderId?: number): Promise<PackTask[]>;
  updatePackTask(id: number, updates: Partial<InsertPackTask>): Promise<void>;

  // Manifests
  createManifest(manifest: InsertManifest): Promise<Manifest>;
  getManifests(): Promise<Manifest[]>;
  addManifestItem(item: InsertManifestItem): Promise<ManifestItem>;

  // Routes
  createRoute(route: InsertRoute): Promise<Route>;
  getRoutes(): Promise<Route[]>;
  addRouteStop(stop: InsertRouteStop): Promise<RouteStop>;

  // Webhooks
  createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog>;
  updateWebhookLog(id: number, updates: Partial<InsertWebhookLog>): Promise<void>;
  getPendingWebhooks(): Promise<WebhookLog[]>;

  // Dashboard
  getDashboardStats(): Promise<any>;
  
  // Integrations
  getIntegration(name: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, updates: Partial<InsertIntegration>): Promise<void>;
  getAllIntegrations(): Promise<Integration[]>;
  
  // Settings
  getWarehouseZones(): Promise<WarehouseZone[]>;
  createWarehouseZone(zone: InsertWarehouseZone): Promise<WarehouseZone>;
  updateWarehouseZone(id: number, updates: Partial<InsertWarehouseZone>): Promise<void>;
  
  getStaffRoles(): Promise<StaffRole[]>;
  createStaffRole(role: InsertStaffRole): Promise<StaffRole>;
  updateStaffRole(id: number, updates: Partial<InsertStaffRole>): Promise<void>;
  
  getToteCartTypes(): Promise<ToteCartType[]>;
  createToteCartType(type: InsertToteCartType): Promise<ToteCartType>;
  updateToteCartType(id: number, updates: Partial<InsertToteCartType>): Promise<void>;
  
  // Maps and coordinates
  getOrdersForMapping(): Promise<Order[]>;
  
  // Inbound Processing
  getPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined>;
  createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: number, updates: Partial<InsertPurchaseOrder>): Promise<void>;
  
  getPurchaseOrderItems(poId: number): Promise<PurchaseOrderItem[]>;
  createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  
  getGoodsReceiptNotes(): Promise<GoodsReceiptNote[]>;
  createGoodsReceiptNote(grn: InsertGoodsReceiptNote): Promise<GoodsReceiptNote>;
  updateGoodsReceiptNote(id: number, updates: Partial<InsertGoodsReceiptNote>): Promise<void>;
  
  getGrnItems(grnId: number): Promise<GrnItem[]>;
  createGrnItem(item: InsertGrnItem): Promise<GrnItem>;
  updateGrnItem(id: number, updates: Partial<InsertGrnItem>): Promise<void>;
  
  getPutawayTasks(): Promise<PutawayTask[]>;
  createPutawayTask(task: InsertPutawayTask): Promise<PutawayTask>;
  updatePutawayTask(id: number, updates: Partial<InsertPutawayTask>): Promise<void>;
  
  getPutawayItems(taskId: number): Promise<PutawayItem[]>;
  createPutawayItem(item: InsertPutawayItem): Promise<PutawayItem>;
  updatePutawayItem(id: number, updates: Partial<InsertPutawayItem>): Promise<void>;
  
  // Inventory Management
  getInventoryAdjustments(): Promise<InventoryAdjustment[]>;
  createInventoryAdjustment(adjustment: InsertInventoryAdjustment): Promise<InventoryAdjustment>;
  updateInventoryAdjustment(id: number, updates: Partial<InsertInventoryAdjustment>): Promise<void>;
  
  getCycleCountTasks(): Promise<CycleCountTask[]>;
  createCycleCountTask(task: InsertCycleCountTask): Promise<CycleCountTask>;
  updateCycleCountTask(id: number, updates: Partial<InsertCycleCountTask>): Promise<void>;
  
  getCycleCountItems(taskId: number): Promise<CycleCountItem[]>;
  createCycleCountItem(item: InsertCycleCountItem): Promise<CycleCountItem>;
  updateCycleCountItem(id: number, updates: Partial<InsertCycleCountItem>): Promise<void>;
  
  getProductExpiry(): Promise<ProductExpiry[]>;
  createProductExpiry(expiry: InsertProductExpiry): Promise<ProductExpiry>;
  updateProductExpiry(id: number, updates: Partial<InsertProductExpiry>): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Orders
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderBySourceNumber(sourceNumber: string, channel: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders)
      .where(and(eq(orders.sourceOrderNumber, sourceNumber), eq(orders.sourceChannel, channel)));
    return order || undefined;
  }

  async getRecentOrders(limit: number = 50): Promise<Order[]> {
    return await db.select().from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(limit);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values({
      ...order,
      updatedAt: new Date()
    }).returning();
    return newOrder;
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<void> {
    await db.update(orders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(orders.id, id));
  }

  // Order Items
  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [orderItem] = await db.insert(orderItems).values(item).returning();
    return orderItem;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  // Inventory
  async getInventoryBySku(sku: string): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.sku, sku));
    return item || undefined;
  }

  async getInventoryById(id: number): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.id, id));
    return item || undefined;
  }

  async updateInventory(sku: string, updates: Partial<InsertInventory>): Promise<void> {
    await db.update(inventory)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventory.sku, sku));
  }

  async updateInventoryById(id: number, updates: Partial<InsertInventory>): Promise<void> {
    await db.update(inventory)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventory.id, id));
  }

  async createInventory(item: InsertInventory): Promise<Inventory> {
    const [newItem] = await db.insert(inventory).values({
      ...item,
      updatedAt: new Date()
    }).returning();
    return newItem;
  }

  async getAllInventory(): Promise<Inventory[]> {
    return await db.select().from(inventory);
  }

  // Events
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvents(entityType?: string, entityId?: number): Promise<Event[]> {
    if (entityType && entityId !== undefined) {
      return await db.select().from(events)
        .where(and(eq(events.entityType, entityType), eq(events.entityId, entityId)))
        .orderBy(desc(events.createdAt));
    } else if (entityType) {
      return await db.select().from(events)
        .where(eq(events.entityType, entityType))
        .orderBy(desc(events.createdAt));
    }
    return await db.select().from(events)
      .orderBy(desc(events.createdAt))
      .limit(100);
  }

  // Address Verifications
  async createAddressVerification(verification: InsertAddressVerification): Promise<AddressVerification> {
    const [newVerification] = await db.insert(addressVerifications).values(verification).returning();
    return newVerification;
  }

  async updateAddressVerification(id: number, updates: Partial<InsertAddressVerification>): Promise<void> {
    await db.update(addressVerifications)
      .set(updates)
      .where(eq(addressVerifications.id, id));
  }

  async getNasLookup(nasCode: string): Promise<NasLookup | undefined> {
    const [lookup] = await db.select().from(nasLookups).where(eq(nasLookups.nasCode, nasCode));
    return lookup || undefined;
  }

  // Pick Tasks
  async createPickTask(task: InsertPickTask): Promise<PickTask> {
    const [newTask] = await db.insert(pickTasks).values(task).returning();
    return newTask;
  }

  async getPickTasks(orderId?: number): Promise<PickTask[]> {
    if (orderId) {
      return await db.select().from(pickTasks).where(eq(pickTasks.orderId, orderId));
    }
    return await db.select().from(pickTasks)
      .orderBy(desc(pickTasks.createdAt))
      .limit(100);
  }

  async updatePickTask(id: number, updates: Partial<InsertPickTask>): Promise<void> {
    await db.update(pickTasks)
      .set(updates)
      .where(eq(pickTasks.id, id));
  }

  // Pack Tasks
  async createPackTask(task: InsertPackTask): Promise<PackTask> {
    const [newTask] = await db.insert(packTasks).values(task).returning();
    return newTask;
  }

  async getPackTasks(orderId?: number): Promise<PackTask[]> {
    if (orderId) {
      return await db.select().from(packTasks).where(eq(packTasks.orderId, orderId));
    }
    return await db.select().from(packTasks)
      .orderBy(desc(packTasks.createdAt))
      .limit(100);
  }

  async updatePackTask(id: number, updates: Partial<InsertPackTask>): Promise<void> {
    await db.update(packTasks)
      .set(updates)
      .where(eq(packTasks.id, id));
  }

  // Manifests
  async createManifest(manifest: InsertManifest): Promise<Manifest> {
    const [newManifest] = await db.insert(manifests).values(manifest).returning();
    return newManifest;
  }

  async getManifests(): Promise<Manifest[]> {
    return await db.select().from(manifests)
      .orderBy(desc(manifests.generatedAt));
  }

  async addManifestItem(item: InsertManifestItem): Promise<ManifestItem> {
    const [newItem] = await db.insert(manifestItems).values(item).returning();
    return newItem;
  }

  // Routes
  async createRoute(route: InsertRoute): Promise<Route> {
    const [newRoute] = await db.insert(routes).values(route).returning();
    return newRoute;
  }

  async getRoutes(): Promise<Route[]> {
    return await db.select().from(routes)
      .orderBy(desc(routes.createdAt));
  }

  async addRouteStop(stop: InsertRouteStop): Promise<RouteStop> {
    const [newStop] = await db.insert(routeStops).values(stop).returning();
    return newStop;
  }

  // Webhooks
  async createWebhookLog(log: InsertWebhookLog): Promise<WebhookLog> {
    const [newLog] = await db.insert(webhookLogs).values(log).returning();
    return newLog;
  }

  async updateWebhookLog(id: number, updates: Partial<InsertWebhookLog>): Promise<void> {
    await db.update(webhookLogs)
      .set(updates)
      .where(eq(webhookLogs.id, id));
  }

  async getPendingWebhooks(): Promise<WebhookLog[]> {
    return await db.select().from(webhookLogs)
      .where(or(
        eq(webhookLogs.status, 'pending'),
        eq(webhookLogs.status, 'retrying')
      ))
      .orderBy(desc(webhookLogs.createdAt));
  }

  // Dashboard
  async getDashboardStats(): Promise<any> {
    const activeOrdersQuery = db.select({ count: count() }).from(orders)
      .where(or(
        eq(orders.status, 'validated'),
        eq(orders.status, 'picking'),
        eq(orders.status, 'packing')
      ));

    const inPickingQuery = db.select({ count: count() }).from(orders)
      .where(eq(orders.status, 'picking'));

    const readyToShipQuery = db.select({ count: count() }).from(orders)
      .where(eq(orders.status, 'packed'));

    const deliveredTodayQuery = db.select({ count: count() }).from(orders)
      .where(and(
        eq(orders.status, 'delivered'),
        sql`DATE(delivered) = CURRENT_DATE`
      ));

    const [activeOrders, inPicking, readyToShip, deliveredToday] = await Promise.all([
      activeOrdersQuery,
      inPickingQuery,
      readyToShipQuery,
      deliveredTodayQuery
    ]);

    return {
      activeOrders: activeOrders[0]?.count || 0,
      inPicking: inPicking[0]?.count || 0,
      readyToShip: readyToShip[0]?.count || 0,
      deliveredToday: deliveredToday[0]?.count || 0
    };
  }

  // Integrations
  async getIntegration(name: string): Promise<Integration | undefined> {
    const [integration] = await db.select().from(integrations).where(eq(integrations.name, name));
    return integration || undefined;
  }

  async createIntegration(integration: InsertIntegration): Promise<Integration> {
    const [result] = await db.insert(integrations).values(integration).returning();
    return result;
  }

  async updateIntegration(id: number, updates: Partial<InsertIntegration>): Promise<void> {
    await db.update(integrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(integrations.id, id));
  }

  async getAllIntegrations(): Promise<Integration[]> {
    return await db.select().from(integrations).orderBy(integrations.category, integrations.name);
  }

  // Settings
  async getWarehouseZones(): Promise<WarehouseZone[]> {
    return await db.select().from(warehouseZones).orderBy(warehouseZones.name);
  }

  async createWarehouseZone(zone: InsertWarehouseZone): Promise<WarehouseZone> {
    const [result] = await db.insert(warehouseZones).values(zone).returning();
    return result;
  }

  async updateWarehouseZone(id: number, updates: Partial<InsertWarehouseZone>): Promise<void> {
    await db.update(warehouseZones).set(updates).where(eq(warehouseZones.id, id));
  }

  async getStaffRoles(): Promise<StaffRole[]> {
    return await db.select().from(staffRoles).orderBy(staffRoles.title);
  }

  async createStaffRole(role: InsertStaffRole): Promise<StaffRole> {
    const [result] = await db.insert(staffRoles).values(role).returning();
    return result;
  }

  async updateStaffRole(id: number, updates: Partial<InsertStaffRole>): Promise<void> {
    await db.update(staffRoles).set(updates).where(eq(staffRoles.id, id));
  }

  async getToteCartTypes(): Promise<ToteCartType[]> {
    return await db.select().from(toteCartTypes).orderBy(toteCartTypes.name);
  }

  async createToteCartType(type: InsertToteCartType): Promise<ToteCartType> {
    const [result] = await db.insert(toteCartTypes).values(type).returning();
    return result;
  }

  async updateToteCartType(id: number, updates: Partial<InsertToteCartType>): Promise<void> {
    await db.update(toteCartTypes).set(updates).where(eq(toteCartTypes.id, id));
  }

  // Maps and coordinates
  async getOrdersForMapping(): Promise<Order[]> {
    return await db.select().from(orders)
      .where(or(
        eq(orders.status, "ready_to_dispatch"),
        eq(orders.status, "in_delivery"),
        eq(orders.status, "dispatched")
      ))
      .orderBy(desc(orders.createdAt));
  }

  // Inbound Processing - Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | undefined> {
    const [po] = await db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id));
    return po || undefined;
  }

  async createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [result] = await db.insert(purchaseOrders).values(po).returning();
    return result;
  }

  async updatePurchaseOrder(id: number, updates: Partial<InsertPurchaseOrder>): Promise<void> {
    await db.update(purchaseOrders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, id));
  }

  async getPurchaseOrderItems(poId: number): Promise<PurchaseOrderItem[]> {
    return await db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.poId, poId));
  }

  async createPurchaseOrderItem(item: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const [result] = await db.insert(purchaseOrderItems).values(item).returning();
    return result;
  }

  // Goods Receipt Notes
  async getGoodsReceiptNotes(): Promise<GoodsReceiptNote[]> {
    return await db.select().from(goodsReceiptNotes).orderBy(desc(goodsReceiptNotes.createdAt));
  }

  async createGoodsReceiptNote(grn: InsertGoodsReceiptNote): Promise<GoodsReceiptNote> {
    const [result] = await db.insert(goodsReceiptNotes).values(grn).returning();
    return result;
  }

  async updateGoodsReceiptNote(id: number, updates: Partial<InsertGoodsReceiptNote>): Promise<void> {
    await db.update(goodsReceiptNotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(goodsReceiptNotes.id, id));
  }

  async getGrnItems(grnId: number): Promise<GrnItem[]> {
    return await db.select().from(grnItems).where(eq(grnItems.grnId, grnId));
  }

  async createGrnItem(item: InsertGrnItem): Promise<GrnItem> {
    const [result] = await db.insert(grnItems).values(item).returning();
    return result;
  }

  async updateGrnItem(id: number, updates: Partial<InsertGrnItem>): Promise<void> {
    await db.update(grnItems).set(updates).where(eq(grnItems.id, id));
  }

  // Putaway Tasks
  async getPutawayTasks(): Promise<PutawayTask[]> {
    return await db.select().from(putawayTasks).orderBy(desc(putawayTasks.createdAt));
  }

  async createPutawayTask(task: InsertPutawayTask): Promise<PutawayTask> {
    const [result] = await db.insert(putawayTasks).values(task).returning();
    return result;
  }

  async updatePutawayTask(id: number, updates: Partial<InsertPutawayTask>): Promise<void> {
    await db.update(putawayTasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(putawayTasks.id, id));
  }

  async getPutawayItems(taskId: number): Promise<PutawayItem[]> {
    return await db.select().from(putawayItems).where(eq(putawayItems.putawayTaskId, taskId));
  }

  async createPutawayItem(item: InsertPutawayItem): Promise<PutawayItem> {
    const [result] = await db.insert(putawayItems).values(item).returning();
    return result;
  }

  async updatePutawayItem(id: number, updates: Partial<InsertPutawayItem>): Promise<void> {
    await db.update(putawayItems).set(updates).where(eq(putawayItems.id, id));
  }

  // Inventory Management
  async getInventoryAdjustments(): Promise<InventoryAdjustment[]> {
    return await db.select().from(inventoryAdjustments).orderBy(desc(inventoryAdjustments.createdAt));
  }

  async createInventoryAdjustment(adjustment: InsertInventoryAdjustment): Promise<InventoryAdjustment> {
    // Generate adjustment number
    const adjustmentNumber = `ADJ-${Date.now()}`;
    
    const adjustmentWithNumber = {
      ...adjustment,
      adjustmentNumber
    };

    const [result] = await db.insert(inventoryAdjustments).values(adjustmentWithNumber).returning();
    return result;
  }

  async updateInventoryAdjustment(id: number, updates: Partial<InsertInventoryAdjustment>): Promise<void> {
    await db.update(inventoryAdjustments).set(updates).where(eq(inventoryAdjustments.id, id));
  }

  // Cycle Count Tasks
  async getCycleCountTasks(): Promise<CycleCountTask[]> {
    return await db.select().from(cycleCountTasks).orderBy(desc(cycleCountTasks.createdAt));
  }

  async createCycleCountTask(task: InsertCycleCountTask): Promise<CycleCountTask> {
    // Generate task number
    const taskNumber = `CC-${Date.now()}`;
    
    const taskWithNumber = {
      ...task,
      taskNumber
    };

    const [result] = await db.insert(cycleCountTasks).values(taskWithNumber).returning();
    return result;
  }

  async updateCycleCountTask(id: number, updates: Partial<InsertCycleCountTask>): Promise<void> {
    await db.update(cycleCountTasks).set(updates).where(eq(cycleCountTasks.id, id));
  }

  async getCycleCountItems(taskId: number): Promise<CycleCountItem[]> {
    return await db.select().from(cycleCountItems).where(eq(cycleCountItems.taskId, taskId));
  }

  async createCycleCountItem(item: InsertCycleCountItem): Promise<CycleCountItem> {
    const [result] = await db.insert(cycleCountItems).values(item).returning();
    return result;
  }

  async updateCycleCountItem(id: number, updates: Partial<InsertCycleCountItem>): Promise<void> {
    await db.update(cycleCountItems).set(updates).where(eq(cycleCountItems.id, id));
  }

  // Product Expiry
  async getProductExpiry(): Promise<ProductExpiry[]> {
    return await db.select().from(productExpiry).orderBy(productExpiry.expiryDate);
  }

  async createProductExpiry(expiry: InsertProductExpiry): Promise<ProductExpiry> {
    const [result] = await db.insert(productExpiry).values(expiry).returning();
    return result;
  }

  async updateProductExpiry(id: number, updates: Partial<InsertProductExpiry>): Promise<void> {
    await db.update(productExpiry)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(productExpiry.id, id));
  }
}

export const storage = new DatabaseStorage();
