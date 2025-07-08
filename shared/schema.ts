import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  saylogixNumber: varchar("saylogix_number", { length: 50 }).notNull().unique(),
  sourceOrderNumber: varchar("source_order_number", { length: 100 }).notNull(),
  sourceChannel: varchar("source_channel", { length: 50 }).notNull(),
  sourceChannelData: jsonb("source_channel_data"),
  status: varchar("status", { length: 50 }).notNull().default("fetched"),
  customerName: text("customer_name").notNull(),
  customerPhone: varchar("customer_phone", { length: 20 }),
  customerEmail: text("customer_email"),
  shippingAddress: jsonb("shipping_address").notNull(),
  billingAddress: jsonb("billing_address"),
  coordinates: jsonb("coordinates"), // {lat: number, lng: number}
  orderValue: decimal("order_value", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("SAR"),
  nasCode: varchar("nas_code", { length: 10 }),
  nasVerified: boolean("nas_verified").default(false),
  courierAssigned: varchar("courier_assigned", { length: 50 }),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  priority: varchar("priority", { length: 20 }).default("normal"),
  orderFetched: timestamp("order_fetched"),
  verifyCompleted: timestamp("verify_completed"),
  pickingStarted: timestamp("picking_started"),
  pickingCompleted: timestamp("picking_completed"),
  packingCompleted: timestamp("packing_completed"),
  dispatched: timestamp("dispatched"),
  delivered: timestamp("delivered"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }),
  weight: decimal("weight", { precision: 8, scale: 3 }),
  picked: boolean("picked").default(false),
  packed: boolean("packed").default(false),
  binLocation: varchar("bin_location", { length: 20 }),
});

// Inventory
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  productName: text("product_name").notNull(),
  category: varchar("category", { length: 100 }),
  availableQty: integer("available_qty").default(0),
  reservedQty: integer("reserved_qty").default(0),
  onHandQty: integer("on_hand_qty").default(0),
  reorderLevel: integer("reorder_level").default(0),
  binLocation: varchar("bin_location", { length: 20 }),
  status: varchar("status", { length: 20 }).default("active"),
  lastAdjustment: timestamp("last_adjustment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  eventId: varchar("event_id", { length: 50 }).notNull(),
  eventType: varchar("event_type", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id").notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).default("success"),
  triggeredBy: varchar("triggered_by", { length: 100 }),
  sourceSystem: varchar("source_system", { length: 50 }),
  eventData: jsonb("event_data"),
  previousState: jsonb("previous_state"),
  newState: jsonb("new_state"),
  metadata: jsonb("metadata"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Address Verifications
export const addressVerifications = pgTable("address_verifications", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  originalAddress: jsonb("original_address").notNull(),
  verifiedAddress: jsonb("verified_address"),
  status: varchar("status", { length: 20 }).default("pending"),
  verificationMethod: varchar("verification_method", { length: 50 }),
  nasCode: varchar("nas_code", { length: 10 }),
  whatsappMessageId: varchar("whatsapp_message_id", { length: 100 }),
  customerResponse: text("customer_response"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// NAS Lookups
export const nasLookups = pgTable("nas_lookups", {
  id: serial("id").primaryKey(),
  nasCode: varchar("nas_code", { length: 10 }).notNull().unique(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  postalCode: varchar("postal_code", { length: 10 }),
  coordinates: jsonb("coordinates"),
  verified: boolean("verified").default(false),
  lastVerified: timestamp("last_verified"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pick Tasks
export const pickTasks = pgTable("pick_tasks", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  orderItemId: integer("order_item_id").notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  quantity: integer("quantity").notNull(),
  binLocation: varchar("bin_location", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  assignedTo: varchar("assigned_to", { length: 100 }),
  pickPath: varchar("pick_path", { length: 10 }),
  pickedQty: integer("picked_qty").default(0),
  pickedAt: timestamp("picked_at"),
  toteId: varchar("tote_id", { length: 50 }),
  exceptionReason: text("exception_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pack Tasks
export const packTasks = pgTable("pack_tasks", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  toteId: varchar("tote_id", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending"),
  assignedTo: varchar("assigned_to", { length: 100 }),
  boxType: varchar("box_type", { length: 50 }),
  weight: decimal("weight", { precision: 8, scale: 3 }),
  dimensions: jsonb("dimensions"),
  labelGenerated: boolean("label_generated").default(false),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  packedAt: timestamp("packed_at"),
  exceptionReason: text("exception_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Manifests
export const manifests = pgTable("manifests", {
  id: serial("id").primaryKey(),
  manifestNumber: varchar("manifest_number", { length: 50 }).notNull().unique(),
  courierName: varchar("courier_name", { length: 100 }).notNull(),
  totalPackages: integer("total_packages").default(0),
  status: varchar("status", { length: 20 }).default("pending"),
  generatedAt: timestamp("generated_at").defaultNow(),
  handedOverAt: timestamp("handed_over_at"),
  handedOverTo: varchar("handed_over_to", { length: 100 }),
});

// Manifest Items
export const manifestItems = pgTable("manifest_items", {
  id: serial("id").primaryKey(),
  manifestId: integer("manifest_id").notNull(),
  orderId: integer("order_id").notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }).notNull(),
  status: varchar("status", { length: 20 }).default("staged"),
  scannedAt: timestamp("scanned_at"),
});

// Routes
export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  routeNumber: varchar("route_number", { length: 50 }).notNull().unique(),
  driverId: varchar("driver_id", { length: 50 }),
  driverName: varchar("driver_name", { length: 100 }),
  vehicleNumber: varchar("vehicle_number", { length: 20 }),
  totalStops: integer("total_stops").default(0),
  status: varchar("status", { length: 20 }).default("planned"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Route Stops
export const routeStops = pgTable("route_stops", {
  id: serial("id").primaryKey(),
  routeId: integer("route_id").notNull(),
  orderId: integer("order_id").notNull(),
  stopSequence: integer("stop_sequence").notNull(),
  address: jsonb("address").notNull(),
  coordinates: jsonb("coordinates"),
  status: varchar("status", { length: 20 }).default("pending"),
  attemptCount: integer("attempt_count").default(0),
  deliveredAt: timestamp("delivered_at"),
  failureReason: text("failure_reason"),
});

// Webhook Logs
export const webhookLogs = pgTable("webhook_logs", {
  id: serial("id").primaryKey(),
  webhookId: varchar("webhook_id", { length: 100 }).notNull(),
  url: text("url").notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  headers: jsonb("headers"),
  payload: jsonb("payload"),
  status: varchar("status", { length: 20 }).default("pending"),
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  retryCount: integer("retry_count").default(0),
  maxRetries: integer("max_retries").default(3),
  nextRetryAt: timestamp("next_retry_at"),
  lastAttemptAt: timestamp("last_attempt_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  addressVerifications: many(addressVerifications),
  pickTasks: many(pickTasks),
  packTasks: many(packTasks),
  manifestItems: many(manifestItems),
  routeStops: many(routeStops),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
}));

export const addressVerificationsRelations = relations(addressVerifications, ({ one }) => ({
  order: one(orders, {
    fields: [addressVerifications.orderId],
    references: [orders.id],
  }),
}));

export const pickTasksRelations = relations(pickTasks, ({ one }) => ({
  order: one(orders, {
    fields: [pickTasks.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [pickTasks.orderItemId],
    references: [orderItems.id],
  }),
}));

export const packTasksRelations = relations(packTasks, ({ one }) => ({
  order: one(orders, {
    fields: [packTasks.orderId],
    references: [orders.id],
  }),
}));

export const manifestsRelations = relations(manifests, ({ many }) => ({
  items: many(manifestItems),
}));

export const manifestItemsRelations = relations(manifestItems, ({ one }) => ({
  manifest: one(manifests, {
    fields: [manifestItems.manifestId],
    references: [manifests.id],
  }),
  order: one(orders, {
    fields: [manifestItems.orderId],
    references: [orders.id],
  }),
}));

export const routesRelations = relations(routes, ({ many }) => ({
  stops: many(routeStops),
}));

export const routeStopsRelations = relations(routeStops, ({ one }) => ({
  route: one(routes, {
    fields: [routeStops.routeId],
    references: [routes.id],
  }),
  order: one(orders, {
    fields: [routeStops.orderId],
    references: [orders.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertAddressVerificationSchema = createInsertSchema(addressVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertNasLookupSchema = createInsertSchema(nasLookups).omit({
  id: true,
  createdAt: true,
});

export const insertPickTaskSchema = createInsertSchema(pickTasks).omit({
  id: true,
  createdAt: true,
});

export const insertPackTaskSchema = createInsertSchema(packTasks).omit({
  id: true,
  createdAt: true,
});

export const insertManifestSchema = createInsertSchema(manifests).omit({
  id: true,
});

export const insertManifestItemSchema = createInsertSchema(manifestItems).omit({
  id: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
});

export const insertRouteStopSchema = createInsertSchema(routeStops).omit({
  id: true,
});

export const insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({
  id: true,
  createdAt: true,
});

// Integration Configuration
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(), // shopify, google_maps, aramex, etc.
  category: varchar("category", { length: 50 }).notNull(), // ecommerce, courier, messaging, etc.
  isEnabled: boolean("is_enabled").default(false),
  config: jsonb("config"), // API keys, URLs, settings
  lastSyncAt: timestamp("last_sync_at"),
  successCount: integer("success_count").default(0),
  failureCount: integer("failure_count").default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Settings Tables
export const warehouseZones = pgTable("warehouse_zones", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const staffRoles = pgTable("staff_roles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions"), // Array of permission strings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const toteCartTypes = pgTable("tote_cart_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(), // tote, cart
  capacity: integer("capacity"),
  dimensions: jsonb("dimensions"), // {length, width, height}
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().optional(),
});

export const insertWarehouseZoneSchema = createInsertSchema(warehouseZones).omit({
  id: true,
  createdAt: true,
});

export const insertStaffRoleSchema = createInsertSchema(staffRoles).omit({
  id: true,
  createdAt: true,
});

export const insertToteCartTypeSchema = createInsertSchema(toteCartTypes).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type AddressVerification = typeof addressVerifications.$inferSelect;
export type InsertAddressVerification = z.infer<typeof insertAddressVerificationSchema>;
export type NasLookup = typeof nasLookups.$inferSelect;
export type InsertNasLookup = z.infer<typeof insertNasLookupSchema>;
export type PickTask = typeof pickTasks.$inferSelect;
export type InsertPickTask = z.infer<typeof insertPickTaskSchema>;
export type PackTask = typeof packTasks.$inferSelect;
export type InsertPackTask = z.infer<typeof insertPackTaskSchema>;
export type Manifest = typeof manifests.$inferSelect;
export type InsertManifest = z.infer<typeof insertManifestSchema>;
export type ManifestItem = typeof manifestItems.$inferSelect;
export type InsertManifestItem = z.infer<typeof insertManifestItemSchema>;
export type Route = typeof routes.$inferSelect;
export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type RouteStop = typeof routeStops.$inferSelect;
export type InsertRouteStop = z.infer<typeof insertRouteStopSchema>;
export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type WarehouseZone = typeof warehouseZones.$inferSelect;
export type InsertWarehouseZone = z.infer<typeof insertWarehouseZoneSchema>;
export type StaffRole = typeof staffRoles.$inferSelect;
export type InsertStaffRole = z.infer<typeof insertStaffRoleSchema>;
export type ToteCartType = typeof toteCartTypes.$inferSelect;
export type InsertToteCartType = z.infer<typeof insertToteCartTypeSchema>;
