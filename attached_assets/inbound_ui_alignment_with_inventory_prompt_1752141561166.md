
# Inbound Screen – Full UI Alignment with Inventory Tab (Replit Prompt)

## 🎯 Objective

Update the **Inbound tab UI** to fully match the Inventory tab’s structure and experience. This includes visual layout, interaction patterns, filters/sorting behavior, and consistency in card/tabs/button usage.

---

## 🔧 Fix Instructions

### 1. Layout & Spacing
- Match header placement and spacing exactly with Inventory.
- Use identical margins, padding, and component spacing for:
  - Page title and breadcrumb
  - KPI cards
  - Sub-tabs (Purchase Orders / GRNs / Putaway Tasks)
  - Search bar and actions button alignment

---

### 2. Actions Button
- Position the Actions button **top right** in line with Inventory.
- Use same button styling (`ghost`, spacing, icon placement).
- Actions should reflect context of selected tab (e.g., Purchase Orders → Create PO / Upload ASN)

---

### 3. Tabs Styling
- Tab bar for Purchase Orders / GRNs / Putaway Tasks must use the **exact styling** from Inventory:
  - Active tab highlight
  - Rounded buttons
  - Hover behavior and spacing

---

### 4. Table Section Consistency
- Column headers must support:
  - Click-to-sort (with arrow indicators)
  - Three-dot (⋮) filter icon per column — not funnel icon
  - Pop-up with searchable input for filters

- Table spacing, row height, padding, and typography must follow Inventory tab layout.

---

### 5. Row Behavior
- Clicking any row opens a right-side drawer with full PO details.
- Drawer design must match other modules in layout and spacing.
- Allow inline edits if relevant.

---

## ✅ Acceptance Criteria

- [ ] Page spacing, header, and table structure match Inventory 1:1
- [ ] Actions button is correctly styled and positioned
- [ ] Sorting and filtering behaviors mirror Inventory
- [ ] Tabs and table match Inventory in visual and interactive logic
- [ ] Drawer behavior on row click is consistent with platform standards
