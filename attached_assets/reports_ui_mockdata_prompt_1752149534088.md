
# Reports Menu – Navigation Structure & Mock Data Prompt (Replit)

## 🎯 Objective

Refactor the **Reports section** to follow the standard Saylogix navigation layout. All report types should live under a unified **Reports screen** with Inventory-style tabs, not nested menu items in the sidebar.

---

## 📐 Navigation Change

### ❌ Remove:
- Sub-menu items under Reports:
  - Operations
  - Courier Performance
  - Returns
  - Address Quality
  - Exceptions

### ✅ Replace With:
- A single sidebar item: **Reports**
- Navigates to one page: `/reports`
- Inside that page, use Inventory-style **horizontal tabs**:
  - `Operations`
  - `Courier Performance`
  - `Returns`
  - `Address Quality`
  - `Exceptions`

---

## 🧩 Reports Page Layout

### Tabs: Inventory-style tab bar

Each tab should render a different report table or visualization using mock data.

### Top KPI Cards (Optional):
- You may include summary cards at the top for each tab, matching Inventory card style:
  - E.g., Delivery Success %, Return Rate, Exceptions Detected, etc.

### Table Behavior:
- Each tab includes:
  - Sortable, filterable tables (3-dot filters, search)
  - Export button per tab (CSV or Excel)
  - Optional row-click drawer (for Returns, Exceptions, etc.)

---

## 🧪 Seed Mock Data (Temporary)

Seed each tab with 3–5 rows of **MOCK_**-labeled data so reports aren’t empty. Use consistent flags for easy removal:

| Field       | Example Value        |
|-------------|----------------------|
| `source`    | `MOCK_report`        |
| `report_id` | `MOCK_OPR_001`       |
| `courier`   | `MOCK_Courier_Alpha` |
| `status`    | `mock_completed`     |

Mock data should be removable with:
```sql
DELETE FROM reports WHERE source = 'MOCK_report';
```

---

## ✅ Acceptance Criteria

- [ ] Reports menu has one item: “Reports”
- [ ] Page contains 5 horizontal tabs:
  - Operations, Courier Performance, Returns, Address Quality, Exceptions
- [ ] All tabs have seeded mock tables with filters/sorting enabled
- [ ] Table + layout matches Inventory tab structure
- [ ] Easy removal of mock data via `MOCK_` identifiers
