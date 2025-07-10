
# Inventory Screen – Replit Implementation Prompt

## 🎯 Objective

Enable in-place product editing on the Inventory screen. When a user clicks a product row from the table, a drawer should slide in from the right, allowing editing of the product details.

---

## 📦 Scope of Changes

### 1. Interactive Row Behavior
- Each product row in the `All Products` table should be clickable.
- Clicking a row opens a drawer on the right side of the screen.
- Only one drawer is visible at a time.

---

### 2. Drawer UI – Product Editor
- Title: **Edit Product**
- Form fields include (minimum set):
  - Product Name
  - Category
  - Barcode(s)
  - SKU Code
  - Description
  - Inventory Status (active, low_stock, etc.)
  - Dimensions (optional but future-ready: weight, size)
- Include **Save** and **Cancel** buttons.

---

## 🧩 Component Behavior

- Drawer should auto-fill with the selected product's existing data.
- Any edits can be saved and reflected in the table immediately.
- Edits should update state and persist through API (or mock API for MVP).
- “Cancel” closes the drawer without changes.

---

## 🧪 UX Expectations

- Drawer slides smoothly and overlays main content.
- Edits should not trigger a full page reload.
- Errors (e.g., empty required fields) should be shown in-line.
- On success, drawer closes and product row updates live.

---

## ✅ Acceptance Criteria

- [ ] Clicking any product opens a drawer with editable fields.
- [ ] Drawer preloads existing product data.
- [ ] Form updates are saved and visible immediately.
- [ ] Drawer closes cleanly on Save or Cancel.
- [ ] UI remains responsive and consistent with Saylogix design.
