# Settings Layout Rework for Saylogix UI

## Objective
Update the Settings screen to match the visual and structural consistency of the Inventory module, while omitting KPI cards. The layout should prioritize clarity and user experience for configuration tasks.

---

## General Design Principles
- Match spacing, card structure, and font hierarchy from Inventory.
- Remove any KPI summary cards from the top.
- Use pill-style major tab navigation at the top.
- Within each major tab, display sub-tabs beneath in a secondary row.
- Maintain Replit component consistency (modals, toggles, editable fields, buttons).

---

## Primary Tabs
- Warehouse
- Users
- Clients

---

## Sub-Tabs
### 1. **Warehouse**
Display the following sub-tabs in this order:
- **Warehouses / Hubs** — View all warehouses, status toggles, address, link to map.
- **Zones** — (Existing layout; just ensure visual match with Inventory, including cards/toggles).
- **Locations** — Bin naming conventions (A-01, B-04), create/edit/delete options.
- **Packaging Material** — Add, edit, and deactivate packaging material types (e.g., polybag, carton, ice pack).
- **Dock Settings** — Add/configure dock names, supported vehicle types, scan equipment.

### 2. **Users**
- **User Roles** — Role name, description, editable permissions table.
- **Users** — Full user list with roles, assigned warehouses, toggle for activation.

### 3. **Clients**
- **Client Details** — Company name, logo, primary contact, fulfillment type.
- **Contract** — Contract start/end, uploaded file, renewal toggle.
- **SLAs** — Add SLA type, applicable orders, time limits, SLA breach alert toggle.
- **Pricing** — Rate card per order type or SKU-based billing rules.
- **Suppliers** — Supplier name, contact, linked clients, approved items.
- **Connected Integrations** — Pulls in integrations view filtered by client scope.
- **Shipping Rules** — Preferred couriers by region, weight/size logic, fallback options.

---

## Additional Requirements
- All components must be reusable.
- Include skeleton loaders for asynchronous data fetching.
- Follow modern layout principles: left-aligned content, no clutter.
- Match top padding/margin to Inventory.
- All views should be able to support CRUD actions in-place (no redirects).

---

## Notes for Dev
- Do not seed with mock data unless otherwise instructed.
- This screen requires full layout restructuring, not just component reuse.
- Label this file as `settings_module_rework.md`.
- Once completed, confirm matching look/feel with Inventory.

---

End of file.

