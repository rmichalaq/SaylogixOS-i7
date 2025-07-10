
# Packing Screen – UI Enhancements Prompt (Replit)

## 🎯 Objective

Enhance the **Packing tab UI** by adding KPI header cards, aligning the Actions button layout, and ensuring all filters/sorting behave exactly like the Inventory screen.

---

## 🔧 Fix Instructions

### 1. Add KPI Header Cards (Top of Page)
Introduce metric cards at the top (above the table), seeded with placeholder data. Suggested KPIs:

- **Total Packed Orders** – 3
- **Avg. Packing Time** – 1m 24s
- **Total Weight Packed Today** – 4.6kg
- **Staff Productivity** – 3 Orders by 1 Staff

Use the same layout style as Inventory KPI cards.

---

### 2. Actions Button Placement
- Move the **Actions** button to the far right of the header if there are no sub-tabs.
- Follow Inventory screen layout: consistent margin and spacing.

---

### 3. Sorting Behavior
- Ensure **click-to-sort** works on all columns.
- Sorting indicator (↑/↓) must match Inventory style.

---

### 4. Replace Funnel Icon with Three-Dot Filter Icon
- Replace all “funnel” icons with three-dot filter icon (⋮).
- Clicking the icon should:
  - Open a filter menu for that column
  - Include a search input
  - Allow filtering by values in that column

---

### 5. Filter & Sort Feedback
- When a filter or sort is applied, the UI must show visual indicators:
  - Active sort should highlight the column
  - Active filter should display as a chip/tag above the table, with an "x" to remove

---

## ✅ Acceptance Criteria

- [ ] Four KPI cards appear at top with seeded data
- [ ] Actions button is aligned to the right consistently
- [ ] Sorting behavior matches Inventory exactly
- [ ] Funnel icons replaced with working 3-dot filter icons
- [ ] Filters and sorts display clearly when applied
- [ ] Visual layout matches Saylogix UI design standards
