# Replit Prompt: Saylogix Shopify Sync Fixes

## Overview

This prompt describes necessary corrections to the Saylogix OMS system in Replit to ensure accurate and automatic syncing of Shopify orders, proper order ID sequencing, and improved UI cleanliness.

---

## 🔁 1. Orders Not Fully Synced from Shopify

### Problem:
Only 14 out of 17 orders were fetched from Shopify.

### Fix:
- Implement **Shopify Webhook listeners** for `orders/create`, `orders/updated`, and `orders/cancelled`.
- Remove any filter that restricts order fetching (e.g., "only open orders").
- Add support for **pagination** in API fetch (handle `link` headers or cursor-based paging).
- Implement a **background reconciliation job** to compare Saylogix DB with Shopify to identify missing orders.

---

## 🔄 2. Remove “Sync Shopify” Button

### Problem:
Manual syncing is unreliable and error-prone.

### Fix:
- Remove `Sync Shopify` button from UI.
- All orders should be synced via webhook and background polling only.
- Show syncing status in the background silently if needed (e.g., spinner, toast alert for developer/admin only).

---

## 🔢 3. Order Numbering is Disordered (e.g., #384 → #847)

### Problem:
Internal order IDs (`SL25-###`) are not sequential.

### Fix:
- Implement strict **timestamp-based incremental order number generation** upon order ingestion.
- Optionally maintain a separate **Saylogix counter** for human-friendly order IDs:
  - Example: `SL25-001`, `SL25-002`, … based on `created_at` timestamp from Shopify.
- Store both Shopify ID and internal Saylogix ID.

---

## 🚫 4. Remove System Alerts Banner (Pending Courier Assignment)

### Problem:
"System Alert: 10 orders pending courier assignment" is not helpful.

### Fix:
- Remove the system alerts UI section.
- Replace logic with background task assignment for courier rules (e.g., SLA-based, weight/destination-based).
- If exceptions arise, log them for admin only (not general UI).

---

## Summary of Required Actions

| Task                                 | Description                                      |
|--------------------------------------|--------------------------------------------------|
| Enable Webhooks                      | `orders/create`, `orders/updated`, `cancelled`   |
| Implement Pagination                 | Handle multi-page fetch with retries             |
| Sequential Order IDs                 | Sort by `created_at`, assign consistent SL25-### |
| Remove Sync Button                   | Webhooks + auto job only                         |
| Remove System Alerts                 | Silent monitoring instead of operator alerts     |

---

## Bonus (Optional)

If orders still go missing, add a manual **Compare with Shopify** feature in developer mode to fetch & diff Shopify and Saylogix order IDs.