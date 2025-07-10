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
  shippingAddress: jsonb("shipping_address"),
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
  status: varchar("status", { length: 20 }).default("pending"), // pending, verified, failed
  verificationMethod: varchar("verification_method", { length: 50 }), // parsed, manual, whatsapp
  nasCode: varchar("nas_code", { length: 10 }),
  whatsappMessageId: varchar("whatsapp_message_id", { length: 100 }),
  customerResponse: text("customer_response"),
  verificationAttempts: jsonb("verification_attempts").default([]), // Array of attempt objects
  usedAddressType: varchar("used_address_type", { length: 20 }), // verified, original
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Verified Addresses Database (SPL API responses)
export const verifiedAddresses = pgTable("verified_addresses", {
  id: serial("id").primaryKey(),
  nasCode: varchar("nas_code", { length: 10 }).notNull().unique(),
  fullAddress: text("full_address").notNull(),
  postalCode: varchar("postal_code", { length: 10 }),
  additionalCode: varchar("additional_code", { length: 10 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  city: varchar("city", { length: 100 }),
  district: varchar("district", { length: 100 }),
  street: varchar("street", { length: 200 }),
  buildingNumber: varchar("building_number", { length: 20 }),
  isActive: boolean("is_active").default(true),
  lastVerified: timestamp("last_verified").defaultNow(),
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
  toteId: varchar("tote_id", { length: 50 }),
  status: varchar("status", { length: 20 }).default("pending"),
  assignedTo: varchar("assigned_to", { length: 100 }),
  boxType: varchar("box_type", { length: 50 }),
  weight: decimal("weight", { precision: 8, scale: 3 }),
  dimensions: varchar("dimensions", { length: 50 }),
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
  completedStops: integer("completed_stops").default(0),
  status: varchar("status", { length: 20 }).default("planned"),
  zone: varchar("zone", { length: 100 }),
  lastScan: timestamp("last_scan"),
  estimatedDuration: integer("estimated_duration"), // in hours
  actualDuration: integer("actual_duration"), // in minutes
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

// Purchase Orders
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  poNumber: varchar("po_number", { length: 100 }).notNull().unique(),
  supplier: text("supplier").notNull(),
  eta: timestamp("eta"),
  status: varchar("status", { length: 50 }).default("pending"),
  asnReceived: boolean("asn_received").default(false),
  asnNumbers: jsonb("asn_numbers"), // Array of airway bill numbers
  gateEntry: boolean("gate_entry").default(false),
  gateEntryTime: timestamp("gate_entry_time"),
  dockAssignment: varchar("dock_assignment", { length: 20 }),
  unloaded: boolean("unloaded").default(false),
  unloadingComments: text("unloading_comments"),
  unloadingTime: timestamp("unloading_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Purchase Order Items
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  poId: integer("po_id").notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  description: text("description").notNull(),
  expectedQuantity: integer("expected_quantity").notNull(),
  receivedQuantity: integer("received_quantity").default(0),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
});

// Goods Receipt Notes
export const goodsReceiptNotes = pgTable("goods_receipt_notes", {
  id: serial("id").primaryKey(),
  grnNumber: varchar("grn_number", { length: 100 }).notNull().unique(),
  poId: integer("po_id").notNull(),
  poNumber: varchar("po_number", { length: 100 }).notNull(),
  supplier: text("supplier").notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  processedBy: varchar("processed_by", { length: 100 }),
  processingStarted: timestamp("processing_started"),
  processingCompleted: timestamp("processing_completed"),
  discrepancyNotes: text("discrepancy_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// GRN Items
export const grnItems = pgTable("grn_items", {
  id: serial("id").primaryKey(),
  grnId: integer("grn_id").notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  description: text("description").notNull(),
  expectedQuantity: integer("expected_quantity").notNull(),
  receivedQuantity: integer("received_quantity").notNull(),
  discrepancy: text("discrepancy"),
  binLocation: varchar("bin_location", { length: 20 }),
  scanStatus: varchar("scan_status", { length: 20 }).default("pending"),
});

// Putaway Tasks
export const putawayTasks = pgTable("putaway_tasks", {
  id: serial("id").primaryKey(),
  grnId: integer("grn_id").notNull(),
  grnNumber: varchar("grn_number", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).default("staged"),
  assignedTo: varchar("assigned_to", { length: 100 }),
  assignedAt: timestamp("assigned_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  cartId: varchar("cart_id", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Putaway Items
export const putawayItems = pgTable("putaway_items", {
  id: serial("id").primaryKey(),
  putawayTaskId: integer("putaway_task_id").notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  binLocation: varchar("bin_location", { length: 20 }),
  scanStatus: varchar("scan_status", { length: 20 }).default("pending"),
  scannedAt: timestamp("scanned_at"),
  placedAt: timestamp("placed_at"),
});

// Settings Tables
export const warehouses = pgTable("warehouses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  city: text("city").notNull(),
  type: text("type").notNull(), // 'hub' | 'fulfillment'
  isActive: boolean("is_active").default(true),
  address: text("address"),
  coordinates: jsonb("coordinates"), // {lat: number, lng: number}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  source: text("source").default("LIVE"),
});

export const warehouseZones = pgTable("warehouse_zones", {
  id: serial("id").primaryKey(),
  warehouseId: integer("warehouse_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  source: text("source").default("LIVE"),
});

export const staffRoles = pgTable("staff_roles", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull().unique(),
  description: text("description"),
  permissions: jsonb("permissions"), // Array of permission strings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemUsers = pgTable("system_users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  roleId: integer("role_id").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  source: text("source").default("LIVE"),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contractStart: timestamp("contract_start"),
  contractEnd: timestamp("contract_end"),
  slaTemplate: text("sla_template"),
  integrationRules: jsonb("integration_rules"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  source: text("source").default("LIVE"),
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

export const insertWarehouseSchema = createInsertSchema(warehouses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWarehouseZoneSchema = createInsertSchema(warehouseZones).omit({
  id: true,
  createdAt: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStaffRoleSchema = createInsertSchema(staffRoles).omit({
  id: true,
  createdAt: true,
});

export const insertSystemUserSchema = createInsertSchema(systemUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertToteCartTypeSchema = createInsertSchema(toteCartTypes).omit({
  id: true,
  createdAt: true,
});

// Inbound schemas
export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({
  id: true,
});

export const insertGoodsReceiptNoteSchema = createInsertSchema(goodsReceiptNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGrnItemSchema = createInsertSchema(grnItems).omit({
  id: true,
});

export const insertPutawayTaskSchema = createInsertSchema(putawayTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPutawayItemSchema = createInsertSchema(putawayItems).omit({
  id: true,
});

// Inbound relations
export const purchaseOrdersRelations = relations(purchaseOrders, ({ many }) => ({
  items: many(purchaseOrderItems),
  grns: many(goodsReceiptNotes),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.poId],
    references: [purchaseOrders.id],
  }),
}));

export const goodsReceiptNotesRelations = relations(goodsReceiptNotes, ({ one, many }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [goodsReceiptNotes.poId],
    references: [purchaseOrders.id],
  }),
  items: many(grnItems),
  putawayTasks: many(putawayTasks),
}));

export const grnItemsRelations = relations(grnItems, ({ one }) => ({
  grn: one(goodsReceiptNotes, {
    fields: [grnItems.grnId],
    references: [goodsReceiptNotes.id],
  }),
}));

export const putawayTasksRelations = relations(putawayTasks, ({ one, many }) => ({
  grn: one(goodsReceiptNotes, {
    fields: [putawayTasks.grnId],
    references: [goodsReceiptNotes.id],
  }),
  items: many(putawayItems),
}));

export const putawayItemsRelations = relations(putawayItems, ({ one }) => ({
  putawayTask: one(putawayTasks, {
    fields: [putawayItems.putawayTaskId],
    references: [putawayTasks.id],
  }),
}));

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
export type Warehouse = typeof warehouses.$inferSelect;
export type InsertWarehouse = z.infer<typeof insertWarehouseSchema>;
export type WarehouseZone = typeof warehouseZones.$inferSelect;
export type InsertWarehouseZone = z.infer<typeof insertWarehouseZoneSchema>;
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type StaffRole = typeof staffRoles.$inferSelect;
export type InsertStaffRole = z.infer<typeof insertStaffRoleSchema>;
export type SystemUser = typeof systemUsers.$inferSelect;
export type InsertSystemUser = z.infer<typeof insertSystemUserSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type ToteCartType = typeof toteCartTypes.$inferSelect;
export type InsertToteCartType = z.infer<typeof insertToteCartTypeSchema>;

// Inbound types
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type GoodsReceiptNote = typeof goodsReceiptNotes.$inferSelect;
export type InsertGoodsReceiptNote = z.infer<typeof insertGoodsReceiptNoteSchema>;
export type GrnItem = typeof grnItems.$inferSelect;
export type InsertGrnItem = z.infer<typeof insertGrnItemSchema>;
export type PutawayTask = typeof putawayTasks.$inferSelect;
export type InsertPutawayTask = z.infer<typeof insertPutawayTaskSchema>;
export type PutawayItem = typeof putawayItems.$inferSelect;
export type InsertPutawayItem = z.infer<typeof insertPutawayItemSchema>;

// Inventory Adjustments
export const inventoryAdjustments = pgTable("inventory_adjustments", {
  id: serial("id").primaryKey(),
  adjustmentNumber: varchar("adjustment_number", { length: 50 }).notNull().unique(),
  sku: varchar("sku", { length: 100 }).notNull(),
  binLocation: varchar("bin_location", { length: 20 }).notNull(),
  adjustmentType: varchar("adjustment_type", { length: 20 }).notNull(), // 'increase', 'decrease', 'set'
  reason: varchar("reason", { length: 100 }).notNull(),
  reasonDetails: text("reason_details"),
  beforeQty: integer("before_qty").notNull(),
  adjustmentQty: integer("adjustment_qty").notNull(),
  afterQty: integer("after_qty").notNull(),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'approved', 'rejected'
  requestedBy: varchar("requested_by", { length: 100 }).notNull(),
  approvedBy: varchar("approved_by", { length: 100 }),
  approvedAt: timestamp("approved_at"),
  appliedAt: timestamp("applied_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cycle Count Tasks
export const cycleCountTasks = pgTable("cycle_count_tasks", {
  id: serial("id").primaryKey(),
  taskNumber: varchar("task_number", { length: 50 }).notNull().unique(),
  countType: varchar("count_type", { length: 20 }).notNull(), // 'zone', 'sku', 'location', 'discrepancy'
  criteria: jsonb("criteria"), // Zone, SKU list, location range, etc.
  status: varchar("status", { length: 20 }).default("created"), // 'created', 'assigned', 'in_progress', 'completed', 'cancelled'
  assignedTo: varchar("assigned_to", { length: 100 }),
  expectedItemCount: integer("expected_item_count").default(0),
  completedItemCount: integer("completed_item_count").default(0),
  discrepancyCount: integer("discrepancy_count").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Cycle Count Items
export const cycleCountItems = pgTable("cycle_count_items", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  sku: varchar("sku", { length: 100 }).notNull(),
  binLocation: varchar("bin_location", { length: 20 }).notNull(),
  systemQty: integer("system_qty").notNull(),
  countedQty: integer("counted_qty"),
  discrepancy: integer("discrepancy").default(0),
  status: varchar("status", { length: 20 }).default("pending"), // 'pending', 'counted', 'verified'
  countedBy: varchar("counted_by", { length: 100 }),
  countedAt: timestamp("counted_at"),
  notes: text("notes"),
  adjustmentCreated: boolean("adjustment_created").default(false),
});

// Product Expiry
export const productExpiry = pgTable("product_expiry", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 100 }).notNull(),
  batchNumber: varchar("batch_number", { length: 50 }).notNull(),
  binLocation: varchar("bin_location", { length: 20 }).notNull(),
  quantity: integer("quantity").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  status: varchar("status", { length: 20 }).default("active"), // 'active', 'near_expiry', 'expired', 'disposed'
  daysToExpiry: integer("days_to_expiry"),
  alertLevel: varchar("alert_level", { length: 20 }), // 'green', 'yellow', 'red'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Inventory Adjustments Schema
export const insertInventoryAdjustmentSchema = createInsertSchema(inventoryAdjustments).omit({
  id: true,
  adjustmentNumber: true,
  createdAt: true,
});

// Cycle Count Schemas
export const insertCycleCountTaskSchema = createInsertSchema(cycleCountTasks).omit({
  id: true,
  taskNumber: true,
  createdAt: true,
});

export const insertCycleCountItemSchema = createInsertSchema(cycleCountItems).omit({
  id: true,
});

// Product Expiry Schema
export const insertProductExpirySchema = createInsertSchema(productExpiry).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Inventory types
export type InventoryAdjustment = typeof inventoryAdjustments.$inferSelect;
export type InsertInventoryAdjustment = z.infer<typeof insertInventoryAdjustmentSchema>;
export type CycleCountTask = typeof cycleCountTasks.$inferSelect;
export type InsertCycleCountTask = z.infer<typeof insertCycleCountTaskSchema>;
export type CycleCountItem = typeof cycleCountItems.$inferSelect;
export type InsertCycleCountItem = z.infer<typeof insertCycleCountItemSchema>;
export type ProductExpiry = typeof productExpiry.$inferSelect;
export type InsertProductExpiry = z.infer<typeof insertProductExpirySchema>;
