
# Last Mile (LMS) Screen – Final Addendum: Map Overview + Mock Data Instructions (Replit Prompt)

## 🗺️ Feature Addition: Map Overview (Optional but Recommended)

Add a **Map View toggle** to visualize:

- Fulfillment Centers (pickup origins)
- Sortation Hubs (intermediate nodes)
- Delivery Zones (final hubs or driver regions)
- Real-time or static routes if assigned

Use **Google Maps integration** already scoped within Saylogix.
- Use clustered pins or color-coded routes
- Toggle between Map and Table view with UI consistency

Placement:
- Top right toggle OR persistent icon beside tab headers

---

## 🧪 Development Note: Mock Data Strategy

To develop and demo this module properly, we will need **seeded mock data**.

### ➕ Insert Seed Data for LMS Testing
In your seeding logic or DB table (e.g., `Routes`, `Warehouses`, `Packages`), include test records with a clearly removable pattern.

Example:
- `source`: `"MOCK_store"`
- `route_id`: `"MOCK_route_001"`
- `driver`: `"MOCK_DRIVER_01"`

This allows safe removal post-development using one filter query:
```sql
DELETE FROM routes WHERE source = 'MOCK_store';
```

---

## ✅ Mock Data Entities to Include
- 2–3 fulfillment centers (with package counts)
- 1–2 sortation hubs
- 3–5 delivery routes with drivers, stops, and statuses
- Include 1–2 exceptions (e.g., failed stop)

Ensure all mock entries are labeled with `MOCK_` prefix.

---

## 🔁 Final UI Sync Reminder

Apply all Inventory-style consistency:
- KPI Cards
- Tab layout and table spacing
- Search, sort, and filter
- Right-aligned Actions dropdown
- Row-click drawer with Google Maps preview

---

This is for mock-enabled LMS testing. Once verified, mock data will be removed using a global delete rule on `MOCK_` fields.
