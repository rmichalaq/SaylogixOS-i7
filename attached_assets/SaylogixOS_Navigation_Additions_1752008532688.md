
# SaylogixOS – Navigation Additions: Settings & Integrations

## ✅ Add to Navigation Menu

### 1. Settings (Tabbed Layout)
Create a new tabbed section labeled **Settings** with the following tabs:
- Warehouse Zones
- Staff Roles
- Tote & Cart Types

Each tab must support:
- List view with filters and search
- Ability to **Add**, **Edit**, and **Toggle Active/Inactive** items
- Validation on required fields (e.g. zone name, role title, cart ID)

---

### 2. Integrations (Tabbed UI)
Create a full integration module with tabs:

#### E-Commerce
- Shopify
- Salla
- Zid
- WooCommerce
- Amazon

#### Courier
- Aramex
- Fastlo
- Naqel
- SMSA

#### Messaging
- Twilio WhatsApp
- Infobip
- Zenvia

#### Payments
- Tabby
- Tamara
- MADA

#### ERP
- SAP
- MS Dynamics
- Zoho

#### Analytics
- GA4
- Mixpanel
- PowerBI

Each connector card must:
- Display logo or title
- Include **Toggle Switch** for activation
- Include a **Configure** button
- Show form with **valid input fields** (e.g. API keys, secrets, URLs)
- Validate form before submission
- Display live **Connection Stats**:
  - Sync success rate (%)
  - Failure count
  - Last sync timestamp
- Support **Test Connection** button with real-time response

---

### ⚙️ Technical Guidelines
- Use dynamic config (JSON-based) for listing and configuring connectors
- Forms must be schema-driven (e.g. with Zod)
- Trigger centralized event bus or hooks for each connector state change (activate/test/configure)
- Avoid hardcoding values—allow new connectors to be added easily in the future
