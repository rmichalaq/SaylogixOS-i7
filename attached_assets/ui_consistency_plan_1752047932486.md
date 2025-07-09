# SaylogixOS UI Visual Consistency Prompt for Replit

## Objective
Ensure **consistent visual design** and **UI/UX flow** across all screens in the SaylogixOS app. All functional modules (OMS, NAS, Tracking, Reports, Settings, etc.) must use the same layout template and design elements to give users a seamless, professional experience.

---

## 🧭 Global Layout Guidelines

- **Top Navigation**: Always display breadcrumbs (e.g., `Home / Orders (OMS)`) and screen title in consistent font and layout.
- **Search Bar**: Top right corner for all pages. No duplicate or redundant search inputs below it.
- **Tabs Below Header**: Each screen should use tabs to display sub-states (e.g., order statuses in OMS, verification modes in NAS, report types in Analytics).
- **Primary Action Buttons**: Place on the **top right** below the tabs (e.g., Export, Filter, Add, Sync).
- **Card Spacing**: Match spacing, card widths, padding across all pages.

---

## 📦 Orders (OMS) Page

- ✅ Remove "Orders Management" and duplicated search bar
- ✅ Move Filters and Export to align with top search bar
- ✅ Add **order status tabs** below the top bar: All / Fetched / Picked / Packed / Dispatched / Delivered / Cancelled
- ✅ Clicking an order opens a **slide-over panel** with:
  - Order Summary
  - Customer Info
  - Delivery Address
  - Fulfillment & Courier
  - Ordered SKUs (add this section)
  - Actions (Edit / Change Status / Cancel Order - fix all buttons)

---

## ✅ Address Verification (NAS)

- Rename **SPL Address Verification** to **Verify NAS**
- Merge both address verification pages
- Use tabs below top bar: Single / Unified / Batch
- Add config form under Settings tab to store SPL API key
- NAS logic:
  - Find shortcode in shipping address (format: 4 letters + 4 digits)
  - If found, verify against SPL API
  - Update order address with full SPL response

---

## 🔌 Integrations Page

- Tabbed UI: E-Commerce / Courier / Messaging / Payments / ERP / Analytics / Verification
- Each integration card:
  - Shows basic config
  - When enabled, allow click to open modal with:
    - Store name(s), API keys
    - Recent orders fetched
    - SKU list
    - Sync log
- Do **not** expand card height when active

---

## 📊 Dashboard

- Use **same structure**: header / tabs / cards layout
- Charts and widgets must be consistent spacing and font
- Fix broken Live Activity Feed & Processing Performance
- Recent Orders block must reflect real orders with timestamps

---

## 📈 Reports

- If no reports are configured, **show mock charts/tables** instead of blank page
- Create tabs for:
  - Daily Orders
  - Courier Performance
  - Inventory Snapshot
  - SKU Movement

---

## 🔍 Missing Features to Add Visually

- Settings:
  - Warehouse Zones
  - Staff Roles
  - Tote & Cart Types
- NAS Settings:
  - SPL API Key field with secure input
- Shopify Integration:
  - Store: show name
  - SKUs: list count and preview
  - Orders: recent orders tab

---

## ❌ Visual Bugs to Fix

- Sidebar icons are not visible — likely due to incorrect color schema or missing SVG fill color. Check all icon rendering.
- Notification bell icon (top right) is invisible though count is visible. Ensure visible outline and tooltip.
- Inconsistent icon placement between views — normalize across screens.
- Text truncation issues in some order cells (customer name / order source)

---

## 🧪 Final UI QA Steps

1. Navigate through each screen (Dashboard, OMS, NAS, WMS, Reports)
2. Confirm layout and components match global pattern
3. Ensure no broken buttons or blank components
4. All tabs render correct data views
5. Remove redundant elements and ensure only one search/filter block per screen

