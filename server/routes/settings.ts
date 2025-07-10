import { Router } from "express";
import { storage } from "../storage";
import { 
  insertWarehouseSchema, 
  insertWarehouseZoneSchema, 
  insertRoleSchema, 
  insertStaffRoleSchema, 
  insertSystemUserSchema, 
  insertClientSchema,
  insertToteCartTypeSchema 
} from "@shared/schema";

const router = Router();

// Warehouses
router.get("/warehouses", async (req, res) => {
  try {
    const warehouses = await storage.getWarehouses();
    res.json(warehouses);
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    res.status(500).json({ error: "Failed to fetch warehouses" });
  }
});

router.post("/warehouses", async (req, res) => {
  try {
    const data = insertWarehouseSchema.parse(req.body);
    const warehouse = await storage.createWarehouse(data);
    res.json(warehouse);
  } catch (error) {
    console.error("Error creating warehouse:", error);
    res.status(400).json({ error: "Failed to create warehouse" });
  }
});

// Roles
router.get("/roles", async (req, res) => {
  try {
    const roles = await storage.getRoles();
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});

router.post("/roles", async (req, res) => {
  try {
    const data = insertRoleSchema.parse(req.body);
    const role = await storage.createRole(data);
    res.json(role);
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(400).json({ error: "Failed to create role" });
  }
});

// System Users
router.get("/system-users", async (req, res) => {
  try {
    const users = await storage.getSystemUsers();
    res.json(users);
  } catch (error) {
    console.error("Error fetching system users:", error);
    res.status(500).json({ error: "Failed to fetch system users" });
  }
});

router.post("/system-users", async (req, res) => {
  try {
    const data = insertSystemUserSchema.parse(req.body);
    const user = await storage.createSystemUser(data);
    res.json(user);
  } catch (error) {
    console.error("Error creating system user:", error);
    res.status(400).json({ error: "Failed to create system user" });
  }
});

// Clients
router.get("/clients", async (req, res) => {
  try {
    const clients = await storage.getClients();
    res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

router.post("/clients", async (req, res) => {
  try {
    const data = insertClientSchema.parse(req.body);
    const client = await storage.createClient(data);
    res.json(client);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(400).json({ error: "Failed to create client" });
  }
});

// Warehouse Zones
router.get("/warehouse-zones", async (req, res) => {
  try {
    const zones = await storage.getWarehouseZones();
    res.json(zones);
  } catch (error) {
    console.error("Error fetching warehouse zones:", error);
    res.status(500).json({ error: "Failed to fetch warehouse zones" });
  }
});

router.post("/warehouse-zones", async (req, res) => {
  try {
    const data = insertWarehouseZoneSchema.parse(req.body);
    const zone = await storage.createWarehouseZone(data);
    res.json(zone);
  } catch (error) {
    console.error("Error creating warehouse zone:", error);
    res.status(400).json({ error: "Failed to create warehouse zone" });
  }
});

router.patch("/warehouse-zones/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    await storage.updateWarehouseZone(id, updates);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating warehouse zone:", error);
    res.status(500).json({ error: "Failed to update warehouse zone" });
  }
});

// Staff Roles
router.get("/staff-roles", async (req, res) => {
  try {
    const roles = await storage.getStaffRoles();
    res.json(roles);
  } catch (error) {
    console.error("Error fetching staff roles:", error);
    res.status(500).json({ error: "Failed to fetch staff roles" });
  }
});

router.post("/staff-roles", async (req, res) => {
  try {
    const data = insertStaffRoleSchema.parse(req.body);
    const role = await storage.createStaffRole(data);
    res.json(role);
  } catch (error) {
    console.error("Error creating staff role:", error);
    res.status(400).json({ error: "Failed to create staff role" });
  }
});

router.patch("/staff-roles/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    await storage.updateStaffRole(id, updates);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating staff role:", error);
    res.status(500).json({ error: "Failed to update staff role" });
  }
});

// Tote Cart Types
router.get("/tote-cart-types", async (req, res) => {
  try {
    const types = await storage.getToteCartTypes();
    res.json(types);
  } catch (error) {
    console.error("Error fetching tote cart types:", error);
    res.status(500).json({ error: "Failed to fetch tote cart types" });
  }
});

router.post("/tote-cart-types", async (req, res) => {
  try {
    const data = insertToteCartTypeSchema.parse(req.body);
    const type = await storage.createToteCartType(data);
    res.json(type);
  } catch (error) {
    console.error("Error creating tote cart type:", error);
    res.status(400).json({ error: "Failed to create tote cart type" });
  }
});

router.patch("/tote-cart-types/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    await storage.updateToteCartType(id, updates);
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating tote cart type:", error);
    res.status(500).json({ error: "Failed to update tote cart type" });
  }
});

export default router;