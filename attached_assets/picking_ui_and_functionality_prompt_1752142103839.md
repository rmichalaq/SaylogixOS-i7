
# Picking Screen – UI Alignment and Functional Specification (Replit Prompt)

## 🎯 Objective

Transform the Picking tab into a consistent, functional, and visually aligned experience that mirrors the **Inventory tab UI**. Add clear tab structure, KPI cards, filtering/sorting, and table behaviors to manage pick task visibility and execution efficiently.

---

## 🧩 Layout Requirements

### 1. Header KPIs (Inventory-style cards)
Add 4 cards at the top of the Picking page, consistent with Inventory UI:
- **Pending Tasks** – e.g., 24 (Ready to pick)
- **In Progress** – e.g., 8 (Being picked now)
- **Picked Today** – e.g., 120 items
- **Exceptions** – e.g., 2 issues (stockouts, blocked bins)

Use the same font size, padding, border-radius, and icon positioning as the Inventory tab.

---

### 2. Functional Tabs (Sub-navigation bar)

Add 3 horizontal tabs, styled exactly like Inventory’s “All Products / Stock on Hand”:

- `Available to Pick`
  - Unassigned orders that passed OMS validation
  - Columns: Order ID, SLA, SKU Count, Zone, Strategy

- `In Progress`
  - Assigned picks grouped by Tote or Picker
  - Columns: Tote ID, Assigned Picker, Zone, Progress, Started At

- `Completed`
  - Finished pick tasks for the day
  - Columns: Tote ID, Picker, Completion Time, Exception Flag

---

### 3. Table Behavior (Matches Inventory)

Apply the following to all data tables under each tab:
- Clickable **column headers for sorting** (A→Z, Z→A)
- **Three-dot filter icons** for each column (replace funnel icons)
- Filter popup with:
  - Searchable input
  - (Optional) value list/checkboxes

All filters/sorts must:
- Highlight the active column
- Show chips/tags above table with `x` removal

---

### 4. Search Function

Global search bar should accept:
- SKU
- Tote ID
- Bin location

Keep same design/styling as Inventory tab search box.

---

### 5. Actions Button (Top Right)

Position an `Actions` button to the right side of the layout. Dropdown options should include:
- **Start Manual Pick Task**
- **Auto-generate Wave**
- **Assign to Picker**
- **Export Pick Plan**

---

### 6. Row & Drawer Behavior

- Row clicking should open a drawer from the right, showing full pick task or tote details.
- Drawer layout must match component style used in Inventory edit view.

---

## ✅ Acceptance Criteria

- [ ] Picking screen UI matches Inventory structure 1:1 (spacing, cards, tabs, button placement)
- [ ] Tabs: Available to Pick, In Progress, Completed
- [ ] 4 KPI cards show real or seeded data
- [ ] Table supports sort, filter, global search
- [ ] Actions button dropdown works contextually
- [ ] Clicking row opens drawer with consistent layout
