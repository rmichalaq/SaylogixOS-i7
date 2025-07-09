## 🧱 Visual and UI Consistency Update Prompt

### 🧭 Global Layout Standardization

- Every screen should follow this layout order:
  - Title bar (with page name and breadcrumb navigation)
  - Functional tab navigation (just below title)
  - Core view area with content, tables, or cards
  - Action buttons (Export, Filter, etc.) aligned to top-right in a single row

### 🧩 Drawer Behavior

- All drawers (order view, integration config, etc.) must open from the right
- Drawers must be scrollable or auto-resizing to fit viewport height
- Avoid information cutoff in drawers on smaller screens

---

## 🧾 Orders Module Enhancements

### Visual Cleanup

- Remove duplicated title: `Orders Management`
- Merge filters and export into the top search row (next to search bar)
- Replace order status filter with horizontal **status tabs**:
  - All, Fetched, Picked, Packed, Dispatched, Delivered, Cancelled

### Order Drawer Enhancements

- Must show all info: internal ID, Shopify ID, order value, created date
- Section layout:
  - Order Summary
  - Customer Info
  - Delivery Address
  - Fulfillment & Courier
  - SKU Details (line items with qty, price, SKU name)
- Action Buttons:
  - `Edit Order`, `Change Status`, `Cancel Order`
- Must scroll if drawer height exceeds screen


## 📦 Inventory Sync Fixes

### Inventory View:

- Synced SKUs from integrations (e.g., Shopify) must auto-create SKUs in DB
- These SKUs must appear in Inventory > All Products view
- View per integration via `View SKUs` on connector card

---

## 🛠 Integrations Enhancements Summary

### Marketplace Tab:

- All integrations show small **logo**, **name**, **description**, and `Configure` button
- Configure opens a drawer
- Cards must not change size regardless of config state

### Connected Tab:

- Each live integration has a card (fixed size)
- Show:
  - Integration name and icon
  - Orders synced count
  - SKUs synced count
  - Last sync time
  - Actions: `Configure`,  `Test`, `Disconnect`

### Configure button opens Drawer:

Two tabs: Configuration & Logs

- Show multiple store connections

- Credentials editable per store

- Logs: show recent sync status

- Allow adding more stores

---

## ✅ Acceptance Criteria Recap

- All drawers scroll or auto-resize
- No visual duplication (e.g., duplicate titles)
- Tabs instead of filters wherever logical
- Address verification tied into fetched orders
- Inventory automatically receives synced SKUs
- Sync metrics and visual hierarchy applied consistently

