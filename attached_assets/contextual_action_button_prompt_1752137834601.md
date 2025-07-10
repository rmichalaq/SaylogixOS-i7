
# Global Action Button – Replit Implementation Prompt

## 🎯 Objective

Introduce a universal **contextual action button** on each primary screen (starting with Inventory) that reveals screen-specific actions via dropdown or side menu.

---

## 📦 Scope of Changes

### 1. Location
- Place the action button in the top right corner of the screen **in line with the secondary tabs** (e.g., “All Products”, “Stock on Hand”).
- Use either:
  - A single “⚙️ Actions” button
  - Or a floating icon (3 dots or plus icon) aligned to design system

---

### 2. Inventory Screen – Action Options
When the user is on the **Inventory** screen and clicks the Actions button, show:

- `➕ Create New Product` (opens drawer or modal for manual entry)
- `📤 Upload Bulk Products` (CSV or Excel template)
- `📥 Download Inventory` (export current table as Excel)

---

### 3. UX Behavior
- Clicking the button opens a dropdown menu or drawer (consistent with platform UI).
- Each action triggers the relevant modal, drawer, or file dialog.
- Keep actions contextual to the current screen only.

---

## 🔁 Extendability
Ensure the action button can be reused across:
- Orders
- Picking
- Packing
- Dispatch
- Reports
Each screen should define its own actions without altering the core button layout.

---

## ✅ Acceptance Criteria

- [ ] Button is clearly visible and always available at screen top.
- [ ] Actions reflect the current screen context.
- [ ] Inventory screen shows “Create New Product” and “Upload Bulk Products”.
- [ ] Dropdown or drawer is styled consistently with Saylogix design system.
- [ ] Button has hover and active states for visual feedback.
