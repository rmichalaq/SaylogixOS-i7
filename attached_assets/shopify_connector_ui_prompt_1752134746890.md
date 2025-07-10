
# Shopify Connector – Replit Implementation Prompt

## 🎯 Objective

Fix the **Shopify Connector UI inside the Connected Integrations screen** to match the standardized Marketplace UI, with minimal and clean layout. On clicking **Configure**, a drawer should appear from the right with two tabs.

---

## 📦 Scope of Changes

### 1. Connector Card (Connected Integrations View)
- Match card size and spacing used in Marketplace screen.
- Card should show:
  - **Shopify** title
  - Shopify logo
  - Text: `{N} Connected Stores`
  - Single `Configure` button

- Remove all extra UI like:
  - `View Orders`
  - `View SKUs`
  - `Test`
  - `Sync Logs section`
  - `Disconnect` button
  - `Last sync`

---

### 2. Drawer UI (Opens on Configure)
- Drawer should slide in from the right.
- Title: **Shopify Integration**
- Two tabs:
  - **Credentials**
    - List of connected stores
    - “Add New Store” button
  - **Sync Logs**
    - Placeholder for sync log content (keep minimal for now)

- Tab system must be consistent with rest of the platform (use same Tabs UI components).

---

## 🧩 Component Behavior

### Connector Card
- `Configure` triggers drawer open.
- Card styling should remain clean, minimal, and match standard integration tile size.

### Drawer
- Default tab = `Credentials`
- If no stores are connected, show empty state with `Add New Store` button.

---

## ✅ Acceptance Criteria
- [ ] Drawer opens from right and overlays cleanly.
- [ ] Tabs function without reload or page change.
- [ ] Component layout matches existing Marketplace card size.
- [ ] Replaces all older UI elements from Shopify connector block.
