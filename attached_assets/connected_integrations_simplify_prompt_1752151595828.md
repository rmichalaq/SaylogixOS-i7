
# Connected Integrations – Card Simplification Prompt (Replit)

## 🎯 Objective

Simplify the visual structure of **Connected Integrations cards** for clarity, consistency, and relevance. Each integration card should only show minimal details up front and shift all configuration/diagnostics into the expanded drawer.

---

## ✅ Simplified Card Layout

Each **connected integration card** should display only the following:

- **Logo**
- **Integration name**
- **Status badge** (e.g., “Active”, “Disconnected”)
- **Configure button** (opens drawer with full configuration)

---

## 🔧 Remove from Card View:
- ❌ Order Synced / SKU Synced (Shopify)
- ❌ Processed / Failed (Google Maps, SPL NAD, etc.)
- ❌ “Test” button (confusing for multi-instance integrations)
- ❌ Last Sync timestamp (shown inside drawer instead)
- ❌ Disconnect link (move to drawer for cleaner UX)

---

## 🧠 Why This Change?

- Shopify may have multiple stores; syncing metrics shown here can be misleading
- Google Maps and SPL NAD do not “process” like OMS/WMS integrations — showing “0 Processed” is meaningless
- Testing or sync info belongs in the **configuration drawer**, not on the surface
- Keeps the Marketplace and Connected cards visually aligned

---

## 🧩 Drawer Behavior (Unchanged)

When user clicks **Configure**:
- Open side drawer (right-aligned)
- Show:
  - Sync stats (if applicable)
  - Logs
  - Disconnect button
  - Additional config tabs (e.g., credentials, webhook logs, etc.)

---

## ✅ Acceptance Criteria

- [ ] All connected integration cards show only: logo, name, status, configure button
- [ ] No inline metrics or testing actions are shown in card view
- [ ] All advanced details moved into configuration drawer
- [ ] Shopify, Google Maps, SPL NAD, etc., all follow the same card pattern
