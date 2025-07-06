import {
  users, orders, orderItems, inventory, events, addressVerifications,
  nasLookups, pickTasks, packTasks, manifests, manifestItems,
  routes, routeStops, webhookLogs,
  type User, type InsertUser, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type Inventory, type InsertInventory,
  type Event, type InsertEvent, type AddressVerification, type InsertAddressVerification,
  type NasLookup, type InsertNasLookup, type PickTask, type InsertPickTask,
  type PackTask, type InsertPackTask, type Manifest, type InsertManifest,
  type ManifestItem, type InsertManifestItem, type Route, type InsertRoute,
  type RouteStop, type InsertRouteStop, type WebhookLog, type InsertWebhookLog
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
  updateInventory(sku: string, updates: Partial<InsertInventory>): Promise<void>;
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

  async updateInventory(sku: string, updates: Partial<InsertInventory>): Promise<void> {
    await db.update(inventory)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(inventory.sku, sku));
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
}

export const storage = new DatabaseStorage();
