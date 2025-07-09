## 🔧 Replit Prompt – Integrations Tab Structure and Sync Fixes

### 🧭 Navigation Updates

- Under **Integrations**, retain two main tabs:
  - `Marketplace`
  - `Connected Integrations`

### 🗂️ Sub-tabs for Both Views (must exist in both Marketplace and Connected)

- E-Commerce
- Courier
- Messaging
- Payments
- ERP
- Analytics
- Maps
- Other (for SPL API and non-categorized tools)

---

## 🛍️ Marketplace Tab (Integrations Setup View)

### Card Layout for Each Integration

- Show:
  - Integration Name (e.g. Shopify, Aramex)
  - Short description (1-liner about the integration)
  - ✅ **Small logo** of the integration
  - ✅ `Configure` button only (no "Test" or other UI)

### Configure Button

- Opens modal to enter credentials/API keys
- Once credentials saved, this creates a new card in `Connected Integrations`

---

## 🔌 Connected Integrations Tab (Active/Live Connections View)

### Card Layout

- Must remain same size regardless of content
- Tabs apply here to separate integrations by type

### Each Connected Card Must Show:

- Store or Account Name
- Small integration logo
- Synced Order Count (clickable: opens Order list view)
- Synced SKU Count (clickable: opens SKU list view)
- ✅ `Configure` button → **edit credentials only**
- ✅ `View Orders` and `View SKUs` buttons
- ✅ `Sync Logs` section — working and preserved as-is
- &#x20;`Test` button

---

## 🔁 Data Sync Fixes

### Shopify Sync Must:

- ✅ Show actual synced orders in OMS → If 14 orders synced, `Orders` page must list them
- ✅ Show SKUs in SKU view — not empty if 156 synced

### Sync Logs:

- Already functioning well — retain format

---

## 🧪 Functional Checks

- Configure modal saves valid credentials
- Connected Integrations reflect correct counts
- Clicking `View Orders` shows relevant orders
- Clicking `View SKUs` shows matched products in inventory
- Marketplace cards remain static and compact, no resizing

---

### ✅ Acceptance Criteria

- Marketplace cards show logo + Configure
- Connected cards show View + Configure + accurate data
- Orders/SKUs actually visible if synced
- Sync logs available and navigable
- Card sizes consistent across all states
- Tabs correctly categorize integrations

