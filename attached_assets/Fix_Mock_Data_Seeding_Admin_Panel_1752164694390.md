# ✅ Fix Mock Data Seeding via Admin Panel in SaylogixOS

## 📌 Objective
Ensure the **"Seed Mock Data"** button in the **Admin Panel → Mock Data Management** populates **all 28 database tables** defined in `database_schema_overview.md`, not just a subset.

---

## 🛠 Requirements

### 1. Seed All Database Tables
Update the seeding logic to insert identifiable mock records into **every table**, including:

#### 🧾 Core
- `users`
- `orders`
- `order_items`
- `inventory`

#### 🏭 Warehouse Operations
- `pick_tasks`
- `pack_tasks`
- `manifests`
- `manifest_items`
- `routes`
- `route_stops`

#### 🚚 Inbound & Putaway
- `purchase_orders`
- `purchase_order_items`
- `goods_receipt_notes`
- `grn_items`
- `putaway_tasks`
- `putaway_items`

#### 📦 Inventory Control
- `inventory_adjustments`
- `cycle_count_tasks`
- `cycle_count_items`
- `product_expiry`

#### 🧠 System & Tracking
- `address_verifications`
- `nas_lookups`
- `events`
- `webhook_logs`

#### ⚙️ Config Tables
- `integrations`
- `warehouse_zones`
- `staff_roles`
- `tote_cart_types`

---

### 2. Use MOCK Identifiers for Easy Cleanup
All mock data must be clearly marked:
- Prefix with `MOCK_` for all text fields
- Use codes like `MOCK_SL25-001`, `MOCK_SKU001`, `MOCK_PO001`, etc.
- Example:
  ```json
  {
    "saylogix_number": "MOCK_SL25-001",
    "sku": "MOCK_SKU001",
    "customer_name": "MOCK_Customer_1"
  }
  ```

---

### 3. Link Foreign Keys
Respect all schema relationships:
- `order_items.order_id` → `orders.id`
- `pick_tasks.order_item_id` → `order_items.id`
- `putaway_items.putaway_task_id` → `putaway_tasks.id`
- etc.

---

### 4. Populate Diverse Statuses
Seed mock data with varied statuses:
- Orders: `fetched`, `verified`, `picked`, `packed`, `dispatched`, `delivered`
- Tasks: `pending`, `in_progress`, `completed`, `exception`

---

### 5. Ensure One-Click Cleanup
The **“Clear All Mock Data”** function must:
- Delete from all tables where values start with `MOCK_`
- Handle constraints: delete child → parent
- Use cascading or ordered deletes

---

### 6. UI Visibility
After running “Seed Mock Data”:
- All modules (OMS, WMS, DMS, Tracking, Inbound) must show data
- Visual confirmation across the system for mock orders, inventory, tasks, routes, and integrations

---

## ✅ Output
- One function tied to the **Admin Panel button** that seeds full schema with relational mock data
- One function to remove all seeded records using MOCK-prefixed values

---

## 📦 Example Volumes
- 10 Orders, 20 SKUs
- 5 Users (roles: picker, packer, dispatch)
- 3 Purchase Orders
- 3 Routes
- 1 Cycle Count Task with 3 SKUs

---

### 🧪 Testing Checklist
- [ ] All 28 tables seeded
- [ ] Foreign key constraints met
- [ ] UI renders mock data across all modules
- [ ] Clear All Mock Data removes everything

---

> This ensures SaylogixOS Admin Panel supports full demo and testing workflows with realistic, complete mock data.