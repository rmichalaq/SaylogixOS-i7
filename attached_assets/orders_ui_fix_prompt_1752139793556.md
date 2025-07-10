
# Orders Page – UI Fixes and Feature Restoration Prompt (Replit)

## 🎯 Objective

Restore critical details and align the **Orders tab UI** with the finalized Inventory tab structure. Ensure all expected order identifiers are visible and sorting/filtering works consistently across all columns.

---

## 🔁 Fixes Required

### 1. Restore Order Identifiers in "Order Details" Column
- Show all three order references:
  - **Internal Order Number** (e.g., SL25-015)
  - **Shopify Order Number** (e.g., #1018)
  - **Unique Shopify Order ID** (e.g., 6549350875363)
- Each reference should be clearly labeled and stacked vertically.

---

### 2. Enable Full-Table Sorting
- Every column header (Order Details, Customer, Status, Value, Courier, Created) must:
  - Support click-to-sort (A→Z, Z→A)
  - Visibly show sort indicator (▲/▼)

---

### 3. Proper Filter Menu Behavior
- Replace current "funeral"-style dropdown with Inventory-style **three-dot icon** on each column.
- Clicking the icon opens a column-specific filter popup with:
  - Search input field
  - Optional: checkbox list (e.g., Status, Courier)

---

### 4. Row Click Consistency
- Allow clicking anywhere in the **entire row**, not just the first column, to open the order details drawer.

---

### 5. Filter Auto-Load Behavior
- When the page loads or a user clicks a column for filtering, filters should behave like in the Inventory tab:
  - Default filters appear inline or automatically based on context
  - Filter logic and chips are shown visibly if applied

---

## ✅ Acceptance Criteria

- [ ] All three order identifiers are visible in the first column.
- [ ] Sortable headers work consistently across all columns.
- [ ] Three-dot filter icons are consistent with Inventory tab.
- [ ] Clicking any row opens the drawer, not just the first column.
- [ ] Filter logic is identical to Inventory tab behavior.
- [ ] UI appearance and behavior is consistent across modules.
