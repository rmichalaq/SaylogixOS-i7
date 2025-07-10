
# Last Mile (LMS) – Enable Table ↔ Map View Toggle (Replit Prompt)

## 🎯 Objective

Now that Google Maps is integrated, enable the **Table ↔ Map toggle** in the Last Mile module so that users can switch between data table view and spatial delivery map view.

---

## 🧭 Feature Details

### 🔀 Toggle Behavior
- Add a **toggle switch or button group** at the top-right of the data section
- Options:
  - `Table View`
  - `Map View`

- Default view: Table
- Switching to Map should:
  - Hide the table
  - Render Google Maps with the seeded routes and hubs

---

## 🗺️ Map Content (Based on Seeded Data)
When toggled to Map View, display:
- Warehouse markers (from `MOCK_store` data)
- Route lines from fulfillment → sortation → delivery
- Driver pins if available
- Stop clusters if overlapping

Map must:
- Center and zoom to fit visible markers
- Use colored markers for different types (warehouse, sortation, delivery)
- Include hover tooltips: Route ID, Driver, Package Count, etc.

---

## ✅ Acceptance Criteria

- [ ] Toggle is visible and functional
- [ ] Map correctly renders seeded `MOCK_` data from the database
- [ ] Table and Map views are mutually exclusive (clean switch)
- [ ] Map uses Google Maps integration and auto-fits visible data

> Note: Table rows should include field `source: MOCK_store` to enable removal later.
