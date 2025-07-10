
# Integrations Screen – UI Rework Prompt to Match Inventory & Inbound Layout (Replit)

## 🎯 Objective

Redesign the Integrations screen to match the visual and structural layout used in the Inventory and Inbound screens. Introduce KPI-style integration health cards, tab navigation for Marketplace vs Connected, and sub-tab filtering by integration category.

---

## 🧩 Layout Requirements

### 1. KPI Cards at Top (Inventory-style)
Create 4 KPI cards to reflect integration health and status:
- **Active Integrations** – Number of currently connected services
- **Errors Detected** – Total integrations with error states
- **Pending Syncs** – Scheduled but incomplete sync attempts
- **API Latency** – Avg latency across services (optional mock value)

Match design and spacing of Inventory tab cards.

---

### 2. Major Tabs (Inbound-style)
Add main horizontal tabs to switch views:
- `Marketplace` – Shows all available integrations grouped by category
- `Connected Integrations` – Shows only the services currently configured and live

Use same tab behavior and styling as Inbound: active state highlight, spacing, responsive scroll if needed.

---

### 3. Sub-tabs for Integration Categories (Below Major Tabs)
When in **Marketplace** or **Connected Integrations**, show smaller filter tabs:
- `E-Commerce`
- `Courier`
- `Messaging`
- `Payments`
- `ERP`
- `Analytics`
- `Maps`
- `Other`

These tabs should:
- Use Inventory tab UI (e.g., like “All Products / Stock on Hand”)
- Be horizontal, scrollable on small screens
- Filter cards based on category tag

---

### 4. Cards Grid Behavior
Cards should display uniformly across both tabs:
- Consistent height, padding, and button size
- Integrations like Shopify, Amazon, Aramex, etc.
- Configure button opens a drawer or modal (preserve existing behavior)

---

## ✅ Acceptance Criteria

- [ ] Top-level integration health cards are displayed above main content
- [ ] Major tabs: `Marketplace` and `Connected Integrations`
- [ ] Sub-tabs below major tabs: show integration types as filters
- [ ] Card layout is visually consistent with other modules
- [ ] Connected Integrations show only configured instances
- [ ] Sub-tab filtering and toggling between Marketplace / Connected works seamlessly
