
# Packing Screen – Final UI Alignment with Inventory Tab (Replit Prompt)

## 🎯 Objective

Enforce **complete UI/UX alignment between Packing and Inventory screens**. The Packing tab should match Inventory in structure, layout, spacing, icons, and interaction patterns down to the smallest detail.

---

## 🔁 Visual and UX Consistency Adjustments

### 1. Layout Structure

- Match **header placement**, **margin**, and **section spacing** exactly like the Inventory tab.
- Ensure cards, tabs, and tables use identical padding, border-radius, and shadow effects.

---

### 2. KPI Cards

- Card dimensions, icon placement, and font weights should be **pixel-aligned** to Inventory tab.
- Replace any variant styling or off-center icons.
- Cards must have consistent hover/active states.

---

### 3. Actions Button

- Actions button should sit in the **top right**, aligned with Inventory tab.
- Use identical margin and button style (`ghost`, rounded, icon spacing).

---

### 4. Table Section

- Table header and border radius should mirror Inventory.
- Row spacing, column alignment, font size, and padding should be 100% identical.
- Sort arrows and icons must be styled the same.
- **Three-dot filter icons** (⋮) should replace any funnel icons.

---

### 5. Filter & Sort Behavior

- Filter popups must behave like Inventory (searchable input, optional checkboxes).
- When filters/sorts are active, they should:
  - Highlight the column visually
  - Show active filter chips/tags above the table with `x` removal logic

---

### 6. Tab Styling

- Tabs (`Queue`, `In Progress`, `Completed`) should inherit styling from Inventory's secondary tabs (`All Products`, `Stock on Hand`)
- Active/inactive states and animations must be consistent.

---

## ✅ Acceptance Criteria

- [ ] Visual spacing and layout matches Inventory 1:1
- [ ] KPI cards are visually and functionally identical
- [ ] Actions button matches Inventory in behavior and style
- [ ] Table structure, filters, and interactions are mirrored from Inventory tab
- [ ] No visual or UX divergence remains between Packing and Inventory tabs
