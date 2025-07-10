
# Last Mile (LMS) Screen – UI Alignment and Full Function Specification (Replit Prompt)

## 🎯 Objective

Redesign the **Last Mile tab (LMS)** to fully align with the Inventory tab UI while introducing all core features of end-to-end last mile orchestration. The screen must support pickup visibility, hub transfers, route creation, courier assignment, delivery tracking, and exception handling — all with intuitive layout, consistent styling, and operational clarity.

---

## 🧩 Layout Requirements

### 1. Header KPI Cards (Inventory-style)
Create 4 consistent metric cards at the top:
- **Planned Routes** – Routes created but not yet started
- **Active Routes** – Currently out-for-delivery
- **Completed Today** – Successfully delivered routes
- **Total Stops** – All drop-offs assigned today

Match Inventory tab for layout, spacing, hover behavior, and responsiveness.

---

### 2. Functional Tabs

Implement horizontal tab bar using Inventory-style layout:

#### a. Pickup Overview
- List and map of all fulfillment centers with packages awaiting pickup
- Columns: FC Name, Packages Ready, Courier Assigned, Pickup Window
- Optional: View as table or toggle map markers

#### b. Active Routes
- All delivery routes currently in progress
- Columns: Route ID, Driver, Vehicle, Packages, Last Scan, Zone

#### c. Completed
- All routes completed today
- Columns: Route ID, Driver, Delivery Count, Completion Time, Success %, Failed Stops

#### d. Exceptions
- Failed deliveries, returns to hub
- Columns: Package ID, Route, Status, Reason, Reassign Option

---

### 3. Map Integration
- Include Google Maps toggle to visualize:
  - Pickup locations
  - Delivery zones
  - Route heatmap or path

Add as a toggle button or sub-tab within Active/Completed routes.

---

### 4. Search & Filter Behavior

Enable global search by:
- Route ID
- Driver Name
- Vehicle ID

Table must support:
- Column **sorting** (clickable headers)
- Column **filtering** via **three-dot icon (⋮)** + searchable input
- Applied filters shown as chips above the table with `x` to remove

---

### 5. Actions Button (Top Right)

Dropdown menu with LMS-specific functions:
- **Create Route**
- **Assign Driver**
- **Reassign Failed Stops**
- **Export Route Plan**
- **Route Optimization**

Match button styling and placement from Inventory screen.

---

### 6. Row Click → Drawer

- Clicking any route row should open a drawer from the right
- Drawer contents:
  - Route ID, status, timestamps
  - Driver & vehicle assignment
  - Package list and their scan/delivery status
  - Map of stops (if available)

---

## ✅ Acceptance Criteria

- [ ] KPI cards, spacing, and font match Inventory UI
- [ ] Tabs include: Pickup Overview, Active Routes, Completed, (Optional: Exceptions, Map)
- [ ] Table UI/UX consistent with Inventory (sort, filter, drawer)
- [ ] Global search supports route/package/driver lookup
- [ ] Route drawer with contextual info
- [ ] All buttons, icons, and layout match Inventory components
