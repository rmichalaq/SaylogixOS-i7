# 🛠️ Upgrade Mock Data Seeding and Status Reporting in Admin Panel

## 🎯 Goal
Ensure the “Seed Mock Data” button fully populates **all system tables** with mock data (5 records each), and the **Mock Data Status** panel reflects every module/table correctly — not just a few.

---

## ✅ Fix Instructions

### 1. Seed Every Database Table
Update the seeding backend to insert mock data into **all 28+ key tables** from the schema:

#### 📦 Core
- users
- orders
- order_items
- inventory

#### 🏭 WMS Operations
- pick_tasks
- pack_tasks
- manifests
- manifest_items
- routes
- route_stops

#### 🚚 Inbound
- purchase_orders
- purchase_order_items
- goods_receipt_notes
- grn_items
- putaway_tasks
- putaway_items

#### 🧾 Inventory Control
- inventory_adjustments
- cycle_count_tasks
- cycle_count_items
- product_expiry

#### 🔁 System & Events
- address_verifications
- events
- webhook_logs
- nas_lookups

#### ⚙️ Configurations
- integrations
- warehouse_zones
- staff_roles
- tote_cart_types

> 🔁 Each table should be seeded with **up to 5 records**, using MOCK_ prefixes.

---

### 2. Update UI Status Panel
Enhance the **Mock Data Status** display to include all seeded modules:

#### Suggested Status Tiles:
- Mock Orders
- Mock Order Items
- Mock Inventory
- Mock Pick Tasks
- Mock Pack Tasks
- Mock Manifests
- Mock Manifest Items
- Mock Routes
- Mock Route Stops
- Mock POs
- Mock GRNs
- Mock Putaway Tasks
- Mock Putaway Items
- Mock Cycle Counts
- Mock Expiry Records
- Mock Configs (Integrations, Roles, Zones)
- Mock NAS Lookups / Verifications

> Use counts from actual tables (e.g., `SELECT COUNT(*) FROM pick_tasks WHERE ...`) to populate the tiles.

---

### 3. Consistent Cleanup
Ensure “Clear All Mock Data”:
- Deletes from all tables seeded
- Uses `WHERE saylogix_number LIKE 'MOCK_%'` or similar pattern
- Deletes respecting FK constraints (order: child → parent)

---

## 🔍 Visual Feedback
After fix:
- No “0” counts on status panel unless table intentionally skipped
- UI screens across OMS, WMS, DMS, Inbound, Tracking **should not be empty**
- Clear visual indicators that mock data is active

---

## 📋 Final Checklist
- [ ] All tables seeded with max 5 MOCK_ records
- [ ] Admin panel status shows all seeded parts
- [ ] One-click removal deletes everything
- [ ] No blank pages in app UI due to empty DB

---

> 🎯 This makes the Admin Panel a **true mock simulator** of real operations, usable for demo, testing, and onboarding validation.