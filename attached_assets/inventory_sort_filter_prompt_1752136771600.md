
# Inventory Table Sorting & Filtering – Replit Implementation Prompt

## 🎯 Objective

Enable Excel-style column sorting and filtering in the **Inventory > All Products** table. Each header (e.g., Product, Category, Available) should support:
- Click-to-sort (ascending/descending)
- Clickable dropdown (3-dot icon) to show a filter input field

---

## 🧩 Expected Behavior

### 1. Column Sorting
- Clicking on any **column header** should toggle sorting:
  - First click: ascending (A → Z / 0 → 9)
  - Second click: descending (Z → A / 9 → 0)
  - Third click (optional): reset to unsorted

- Sort applies to the entire table dataset and should visibly update rows.

---

### 2. Column Filtering
- A **three-dot icon** appears on hover (or always visible) at the end of each column header.
- Clicking this icon opens a dropdown that allows:
  - A **search input** field to filter values in that column
  - Optional: checkbox list of distinct values in that column (if useful for non-text fields like `Status`)

- Filter should be applied only to the selected column.
- Filters stack across multiple columns (i.e., multi-column filtering is supported).

---

## 🖥️ UI Details

- Sorting indicator (▲/▼) should appear beside header label.
- Filter dropdown should be styled to match Saylogix UI theme.
- If no results match the filter, show “No results found” message in the table.
- Show active filter icon differently (e.g., highlighted 3-dot icon or chip above the table).

---

## ✅ Acceptance Criteria

- [ ] Sorting works on every column (Product, Category, Available, Reserved, On Hand, Status).
- [ ] Filter dropdown opens with search input per column.
- [ ] Filters and sorts can be applied independently or together.
- [ ] UI updates in real time without page reload.
- [ ] Active sort and filters are clearly shown to user.
