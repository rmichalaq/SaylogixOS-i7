
# Dispatch (DMS) Screen – UI Alignment and Feature Specification (Replit Prompt)

## 🎯 Objective

Redesign the **Dispatch tab (DMS)** to follow the exact UI and UX standards of the Inventory tab. Implement KPI cards, consistent tab layout, action buttons, and filterable/sortable tables to manage courier handovers and manifest generation effectively.

---

## 🧩 Layout Requirements

### 1. Header KPI Cards (Inventory-style)
Add 4 Inventory-style metric cards:
- **Pending Manifests** – Awaiting pickup
- **Ready for Pickup** – Confirmed but not yet dispatched
- **Dispatched Today** – Successfully handed over to couriers
- **Total Packages** – Total packages in manifests (today)

Use exact spacing, border, and icon behavior as in Inventory.

---

### 2. Functional Tabs

Add 3 horizontal tabs styled just like Inventory:
- **All Manifests** – View all dispatch activity (default tab)
- **Ready for Pickup** – Packages grouped and ready but awaiting courier
- **Dispatched Today** – Completed courier handovers

Do not split tabs by courier integration type — use filters instead.

---

### 3. Table Behavior (per tab)

Columns to include:
- Manifest ID
- Courier Name
- # of Packages
- ETA / Scheduled Pickup Time
- Status (Pending, Ready, Dispatched)
- Handover Method (API, Real-Time, Manual)
- Created By
- Last Updated

Behaviors:
- Column **sorting** (clickable header with arrow)
- Column **filtering** via **three-dot icon (⋮)** with search input
- Active filters should display as removable chips above table

---

### 4. Global Search

Enable search by:
- Manifest ID
- Courier Name
- Package ID

Use same style and placement as Inventory search bar.

---

### 5. Actions Button (Top Right)

Right-aligned dropdown matching Inventory style:
- **Generate New Manifest**
- **Schedule Courier Pickup**
- **Assign Packages to Manifest**
- **Export Dispatch Report**

---

### 6. Row Interaction

Clicking any manifest row should open a drawer from the right:
- Manifest summary
- Package list (with counts and AWBs)
- Courier assignment
- Status & timestamps

Drawer layout must match Inventory standard components and spacing.

---

## ✅ Acceptance Criteria

- [ ] Header layout matches Inventory tab exactly
- [ ] Tabs: All Manifests, Ready for Pickup, Dispatched Today
- [ ] KPI cards show seeded or live data
- [ ] Tables are fully sortable and filterable
- [ ] Global search bar functions consistently
- [ ] Action dropdown behaves identically to Inventory
- [ ] Row click opens manifest drawer with consistent layout
