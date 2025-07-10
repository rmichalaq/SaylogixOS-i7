
# Inbound Screen – Replit Implementation Prompt

## 🎯 Objective

Apply the finalized UI and UX structure from the **Inventory tab** to the **Inbound** screen. This includes layout, drawer logic, table behavior, and contextual actions.

---

## ✅ Apply the Following Inventory-Based Components

### 1. Table Layout (Data View)
- Header cards (metrics if applicable)
- Table with standardized column headers
- Responsive sorting (click on header toggles A→Z / Z→A)
- Filtering per column with Excel-style dropdown
- Search bar integrated at top

### 2. Drawer on Row Click
- Clicking any row opens a right-side drawer
- Drawer contains editable fields related to selected row
- Save/Cancel buttons with inline validation

### 3. Contextual Actions Button (Top Right)
- Button shows dropdown with actions relevant to this screen
- For example:
- Create New ASN
- Upload ASN CSV
- View Dock Schedule

### 4. General UI Behavior
- Responsive drawer and table
- Smooth transitions, no page reloads
- Drawer can be reused as shared component if design allows

---

## ✅ Acceptance Criteria
- [ ] UI matches Inventory screen structure
- [ ] Row click opens drawer for details or editing
- [ ] Column sorting and filtering works on all fields
- [ ] Actions button reflects module-specific operations
- [ ] Layout adheres to Saylogix component design system
