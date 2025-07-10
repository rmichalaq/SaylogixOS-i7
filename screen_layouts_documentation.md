# Saylogix OS - Screen Layouts Documentation

This document provides a comprehensive overview of all screen layouts in the Saylogix OS system. Each screen follows a consistent design pattern with specific components and layout structures.

## Document Version
- **Created:** January 10, 2025
- **Last Updated:** January 10, 2025
- **Purpose:** Complete reference for all UI screen layouts in Saylogix OS

## Table of Contents

1. [Quick Reference Table](#quick-reference-table)
2. [General Layout Structure](#general-layout-structure)
3. [Dashboard](#dashboard)
4. [Orders](#orders)
5. [Verify NAS](#verify-nas)
6. [Warehouse Management](#warehouse-management)
   - [Inbound](#inbound)
   - [Inventory](#inventory)
   - [Picking](#picking)
   - [Packing](#packing)
   - [Dispatch](#dispatch)
7. [Last Mile](#last-mile)
8. [Tracking](#tracking)
9. [Reports](#reports)
10. [Integrations](#integrations)
11. [Settings](#settings)
12. [Common Components](#common-components)

---

## Quick Reference Table

| Screen | Route | Header | KPI Cards | Main Tabs | Key Features |
|--------|-------|---------|-----------|-----------|--------------|
| Dashboard | `/` | None | 4 (Load Summary) | None | Critical Alerts, Live Feed |
| Orders | `/orders` | Yes | None | 3 (Orders, Exceptions, Returns) | 8 sub-tabs, Click-to-drawer |
| Verify NAS | `/address-verify` | Yes | None | 3 (Order, Manual, Database) | SPL API integration |
| Inbound | `/inbound` | Yes | 4 | 4 tabs | PO processing, GRN |
| Inventory | `/inventory` | Yes | 4 | 4 tabs | Adjustments, Cycle counts |
| Picking | `/warehouse-picking` | Yes | 4 | 4 tabs | Task management |
| Packing | `/warehouse-packing` | Yes | 4 | 4 tabs | Quality checks |
| Dispatch | `/warehouse-dispatch` | Yes | 4 | 4 tabs | Manifest creation |
| Last Mile | `/last-mile` | Yes | 4 | 4 tabs | Table/Map view toggle |
| Tracking | `/tracking` | Yes | None | None | Search, Timeline view |
| Reports | `/reports` | None | None | Categories | Report generation |
| Integrations | `/integrations` | Yes | 4 | 2 (Marketplace, Connected) | 8 category sub-tabs |
| Settings | `/settings` | Yes | None | 3 (Warehouse, Users, Clients) | Multiple sub-tabs |

---

## General Layout Structure

Every screen in Saylogix OS follows this base layout:

```
┌─────────────────────────────────────────────────────────────────┐
│ Top Bar                                                         │
│ ┌─────────────┬──────────────────────────────────┬──────────┐ │
│ │ Logo/Brand  │ Page Title                       │ Actions  │ │
│ └─────────────┴──────────────────────────────────┴──────────┘ │
├─────────────────┬───────────────────────────────────────────────┤
│                 │ Main Content Area                             │
│ Sidebar         │ ┌───────────────────────────────────────────┐ │
│ Navigation      │ │ Page Header (if applicable)               │ │
│                 │ ├───────────────────────────────────────────┤ │
│ • Dashboard     │ │ KPI Cards (4 cards typical)               │ │
│ • Orders        │ ├───────────────────────────────────────────┤ │
│ • Verify NAS    │ │ Tab Navigation                            │ │
│ • Warehouse     │ ├───────────────────────────────────────────┤ │
│   - Inbound     │ │ Sub-tabs (if applicable)                  │ │
│   - Inventory   │ ├───────────────────────────────────────────┤ │
│   - Picking     │ │ Content Area (Tables/Cards/Forms)         │ │
│   - Packing     │ └───────────────────────────────────────────┘ │
│   - Dispatch    │                                                 │
│ • Last Mile     │ [Right-sliding Drawer - Opens on interaction]  │
│ • Tracking      │                                                 │
│ • Reports       │                                                 │
│ • Integrations  │                                                 │
│ • Settings      │                                                 │
└─────────────────┴───────────────────────────────────────────────┘
```

---

## Dashboard

**Route:** `/`

### Layout Components:
1. **No Page Header** - Dashboard starts directly with content
2. **Critical Alerts Row** (Top Priority)
   - 4 Alert Cards in single responsive row
   - Cards: Orders Not Picked, Courier Failures, NAS Failures, Out of Stock
   - Red badges for critical issues, yellow for warnings
3. **Today's Load Summary** (4 KPI Cards)
   - New Orders, Orders to Pick, Orders to Pack, Ready to Dispatch
4. **Live Activity Feed** (Conditional - only shows with real data)
   - Real-time updates of system events
   - Hidden when no activity data exists

### Visual Structure:
```
┌─────────────────────────────────────────────────────────────┐
│ Critical Alerts (4 cards in row)                            │
├─────────────────────────────────────────────────────────────┤
│ Today's Load Summary (4 KPI cards)                          │
├─────────────────────────────────────────────────────────────┤
│ Live Activity Feed (if data exists)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Orders

**Route:** `/orders`

### Layout Components:
1. **Page Header:** "Orders"
2. **3 Main Tabs:**
   - Orders (with 8 sub-tabs)
   - Exceptions
   - Returns
3. **Orders Sub-tabs:** New, Picked, Packed, Ready to Ship, Dispatched, Delivered, Cancelled, All
4. **Table Layout:**
   - No Actions column (click row to open drawer)
   - Columns: Order #, Customer, Items, Total, Status, Date
5. **Right-sliding Drawer:**
   - Order details and all actions
   - "More Actions" dropdown includes "Trigger Return"

### Visual Structure:
```
┌─────────────────────────────────────────────────────────────┐
│ Orders                                                      │
├─────────────────────────────────────────────────────────────┤
│ [Orders] [Exceptions] [Returns]                             │
├─────────────────────────────────────────────────────────────┤
│ [New][Picked][Packed][Ready][Dispatched][Delivered][Cancel][All]│
├─────────────────────────────────────────────────────────────┤
│ Table with clickable rows                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Verify NAS

**Route:** `/address-verify`

### Layout Components:
1. **Page Header:** "Verify NAS"
2. **3 Main Tabs:**
   - Order Verification
   - Manual Verification
   - Verified Database
3. **Order Verification Tab:**
   - Table of orders with unverified addresses
   - Click row to open verification drawer
4. **Manual Verification Tab:**
   - Input field for NAS code
   - Verify button
   - Results display area
5. **Verified Database Tab:**
   - Table of all verified addresses
   - Search and filter options
6. **Verification Drawer:**
   - Original address display
   - NAS code input/display
   - Verify button
   - Results with Saudi Post branding

### Visual Structure:
```
┌─────────────────────────────────────────────────────────────┐
│ Verify NAS                                                  │
├─────────────────────────────────────────────────────────────┤
│ [Order Verification] [Manual Verification] [Verified Database]│
├─────────────────────────────────────────────────────────────┤
│ Content based on selected tab                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Warehouse Management

All warehouse screens follow the same pattern:

### Common Layout:
1. **Page Header:** Screen name (e.g., "Inventory")
2. **4 KPI Cards** (metrics specific to each module)
3. **Tab Navigation** (varies by module)
4. **Sortable Tables** with filter chips
5. **Right-sliding Drawers** for details/actions

### Inbound

**Route:** `/inbound`

**Tabs:**
- Purchase Orders
- Goods Receipt
- ASN Management
- Put Away

**KPI Cards:**
- Expected Today
- In Transit
- At Dock
- Pending Putaway

### Inventory

**Route:** `/inventory`

**Tabs:**
- View (sub-tabs: All Products, Stock on Hand)
- Adjust
- Cycle Count
- Expiry Report

**KPI Cards:**
- Total SKUs
- Total Stock Value
- Low Stock Alerts
- Pending Adjustments

### Picking

**Route:** `/warehouse-picking`

**Tabs:**
- Pending Pick
- In Progress
- Completed
- Exceptions

**KPI Cards:**
- Orders to Pick
- Items Pending
- Active Pickers
- Pick Rate

### Packing

**Route:** `/warehouse-packing`

**Tabs:**
- Ready to Pack
- In Progress
- Completed
- Quality Check

**KPI Cards:**
- Orders to Pack
- Items to Pack
- Active Packers
- Pack Rate

### Dispatch

**Route:** `/warehouse-dispatch`

**Tabs:**
- Ready for Dispatch
- Creating Manifest
- Dispatched Today
- Pending Handover

**KPI Cards:**
- Ready to Ship
- Manifests Today
- Packages Dispatched
- Courier Performance

---

## Last Mile

**Route:** `/last-mile`

### Layout Components:
1. **Page Header:** "Last Mile"
2. **View Toggle:** Table View / Map View
3. **4 KPI Cards:**
   - Planned Routes
   - Active Routes
   - Completed Today
   - Total Stops
4. **4 Section Tabs:**
   - Pickup Overview
   - Active Routes
   - Completed
   - Exceptions
5. **Table View:**
   - Sortable columns with filter icons
   - Click row for route details drawer
6. **Map View:**
   - Google Maps integration
   - Warehouse markers
   - Route lines
   - Delivery zones
   - Interactive info windows

### Visual Structure:
```
┌─────────────────────────────────────────────────────────────┐
│ Last Mile                    [Table View] [Map View]        │
├─────────────────────────────────────────────────────────────┤
│ 4 KPI Cards                                                 │
├─────────────────────────────────────────────────────────────┤
│ [Pickup Overview][Active Routes][Completed][Exceptions]     │
├─────────────────────────────────────────────────────────────┤
│ Table or Map based on view selection                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Tracking

**Route:** `/tracking`

### Layout Components:
1. **Page Header:** "Tracking"
2. **Search Bar** for tracking number/order ID
3. **3 Main Sections:**
   - Active Shipments
   - Delivered Today
   - Search Results
4. **Tracking Timeline** in drawer showing:
   - Order placed
   - Picked
   - Packed
   - Dispatched
   - Out for delivery
   - Delivered

---

## Reports

**Route:** `/reports`

### Layout Components:
1. **No Page Header** (as requested)
2. **Report Categories:**
   - Operational Reports
   - Financial Reports
   - Performance Analytics
   - Custom Reports
3. **Report Cards** with:
   - Report name
   - Description
   - Last run date
   - Generate/Schedule buttons
4. **Report Viewer** (opens in drawer/modal)

---

## Integrations

**Route:** `/integrations`

### Layout Components:
1. **Page Header:** "Integrations"
2. **4 KPI Cards:**
   - Active Integrations
   - Errors Detected
   - Pending Syncs
   - API Latency
3. **2 Main Tabs:**
   - Marketplace
   - Connected Integrations
4. **Sub-tabs for categories:**
   - E-Commerce, Courier, Messaging, Payments, ERP, Analytics, Maps, Other
5. **Marketplace Tab:**
   - Fixed-size cards with logo, description, Configure button
6. **Connected Tab:**
   - Rich cards with sync stats, action buttons
7. **Integration Drawers:**
   - Configuration settings
   - API credentials
   - Sync logs
   - Test connection

### Visual Structure:
```
┌─────────────────────────────────────────────────────────────┐
│ Integrations                                                │
├─────────────────────────────────────────────────────────────┤
│ 4 KPI Cards                                                 │
├─────────────────────────────────────────────────────────────┤
│ [Marketplace] [Connected Integrations]                      │
├─────────────────────────────────────────────────────────────┤
│ [E-Commerce][Courier][Messaging][Payments][ERP][Analytics]... │
├─────────────────────────────────────────────────────────────┤
│ Grid of integration cards                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Settings

**Route:** `/settings`

### Layout Components:
1. **Page Header:** "Settings"
2. **3 Main Tabs:** (No KPI cards)
   - Warehouse
   - Users
   - Clients
3. **Warehouse Sub-tabs:**
   - Warehouses/Hubs
   - Zones
   - Locations
   - Packaging Material
   - Dock Settings
4. **Users Sub-tabs:**
   - User Roles
   - Users
5. **Clients Sub-tabs:**
   - Client Details
   - Contract
   - SLAs
   - Pricing
   - Suppliers
   - Connected Integrations
   - Shipping Rules
6. **CRUD Interfaces:**
   - Add/Edit/Delete functionality
   - In-place editing
   - Dropdown menus and switches

### Visual Structure:
```
┌─────────────────────────────────────────────────────────────┐
│ Settings                                                    │
├─────────────────────────────────────────────────────────────┤
│ [Warehouse] [Users] [Clients]                               │
├─────────────────────────────────────────────────────────────┤
│ Sub-tabs based on main tab selection                       │
├─────────────────────────────────────────────────────────────┤
│ Tables/Forms for CRUD operations                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Common Components

### KPI Cards
- Fixed height with border
- Icon, title, value, trend indicator
- Consistent spacing and typography

### Tables
- Sortable columns with MoreVertical (⋮) icon
- Filter chips above table
- Pagination controls
- Click row to open drawer (no Actions column)

### Right-sliding Drawers
- Opens from right side
- Contains detailed view and actions
- Close button (X) in top-right
- Overlay backdrop

### Tab Navigation
- Primary tabs: Pill-style with active state
- Sub-tabs: Smaller, secondary style
- Consistent spacing and alignment

### Empty States
- Informative message
- Relevant icon
- Call-to-action when applicable

### Loading States
- Skeleton loaders for async data
- Consistent animation patterns

### Forms
- Clear labels and placeholders
- Validation messages
- Consistent button styling
- Cancel/Save button placement

### Color Scheme
- Background: White/Gray-50
- Primary: Blue shades
- Success: Green
- Warning: Yellow/Amber
- Error: Red
- Text: Gray-900 (primary), Gray-600 (secondary)

---

## Responsive Design

All screens are responsive with breakpoints:
- Mobile: < 768px (sidebar collapses, cards stack)
- Tablet: 768px - 1024px (2-column layouts)
- Desktop: > 1024px (full layouts as described)

---

## Accessibility

- All interactive elements have proper ARIA labels
- Keyboard navigation supported
- Focus indicators visible
- Color contrast meets WCAG standards
- Screen reader compatible

---

## Performance Considerations

- Lazy loading for large data sets
- Virtual scrolling for long lists
- Optimistic UI updates
- Debounced search inputs
- Cached API responses where appropriate

---

## Special UI Features

### Scanner Overlay
- Context-aware barcode/QR scanning
- Floating scanner button (when applicable)
- Full-screen overlay with camera view
- Auto-focus and torch controls

### Real-time Updates
- WebSocket connections for live data
- Activity feed animations
- Badge count updates
- Status transitions

### Task Management Panel
- Floating task widget (bottom-right)
- Shows assigned tasks
- Quick actions without navigation
- Task completion tracking

### Alerts Banner
- System-wide notifications
- Dismissible alerts
- Color-coded by severity
- Links to relevant sections

### Saudi Post Integration
- Blue informational banner for verified addresses
- "Verified by Saudi Post National Address API" branding
- NAS code format validation (ABCD1234)
- GPS coordinates with 6 decimal precision

### Custom Branding
- Nasalization font for SAYLOGIX text
- Space-age aesthetic
- Consistent color palette
- Professional typography

---

## Navigation Flow

### Primary Navigation (Sidebar)
1. **Dashboard** - Home/Overview
2. **Orders** - Order management
3. **Verify NAS** - Address verification
4. **Warehouse** (Expandable)
   - Inbound
   - Inventory
   - Picking
   - Packing
   - Dispatch
5. **Last Mile** - Delivery management
6. **Tracking** - Shipment tracking
7. **Reports** - Analytics and reporting
8. **Integrations** - External connections
9. **Settings** - System configuration

### User Actions (Top Bar)
- Notifications bell
- User profile menu
- System search
- Quick actions

---

## Data Display Patterns

### Status Indicators
- Pills/Badges: Colored by status
- Progress bars: For multi-step processes
- Icons: Status-specific (checkmark, warning, etc.)
- Timestamps: Relative and absolute

### Action Patterns
- Primary actions: Blue buttons
- Secondary actions: Outlined buttons
- Destructive actions: Red buttons/confirmations
- Bulk actions: Checkbox selection + toolbar

### Form Patterns
- Inline editing where possible
- Modal forms for complex inputs
- Step-by-step wizards for processes
- Auto-save for long forms

### Search Patterns
- Global search in top bar
- Page-specific search bars
- Filter chips for refinement
- Advanced filter dropdowns

---

## Screen-Specific Interactions

### Orders Screen
- **Click Order Row**: Opens order details drawer from right
- **Status Pills**: Color-coded (green=delivered, blue=in-progress, red=cancelled)
- **Quick Actions**: Print label, assign courier, update status
- **Return Process**: Initiated from "More Actions" dropdown in drawer

### Verify NAS Screen
- **NAS Code Format**: ABCD1234 (4 letters + 4 digits)
- **Verification Result**: Shows in drawer with Saudi Post branding
- **Error States**: Clear messages for invalid codes or API failures
- **Success State**: Blue banner "Verified by Saudi Post National Address API"

### Inventory Screen
- **Adjustment Flow**: Create → Review → Submit for approval
- **Cycle Count**: Task assignment → Count entry → Variance review
- **Expiry Alerts**: Color-coded by days until expiry
- **Stock Levels**: Visual indicators (red=low, yellow=medium, green=good)

### Last Mile Screen
- **Route Assignment**: Drag-and-drop orders to routes
- **Map Interactions**: Click markers for details, zoom to routes
- **Driver Status**: Real-time location updates on map
- **Delivery Confirmation**: Photo capture and signature options

### Integration Screen
- **Connection Flow**: Select integration → Enter credentials → Test → Activate
- **Sync Status**: Real-time progress bars and last sync timestamps
- **Error Handling**: Detailed error messages with retry options
- **Shopify Modal**: 4 tabs (Credentials, SKUs, Orders, Logs)

---

## Mobile Responsiveness

### Breakpoint Behaviors
- **< 768px (Mobile)**
  - Sidebar: Collapses to hamburger menu
  - KPI Cards: Stack vertically (1 column)
  - Tables: Horizontal scroll with frozen first column
  - Drawers: Full screen overlay

- **768px - 1024px (Tablet)**
  - Sidebar: Collapsible with icons
  - KPI Cards: 2x2 grid
  - Tables: Responsive with priority columns
  - Drawers: 75% screen width

- **> 1024px (Desktop)**
  - Full layouts as documented
  - All features visible
  - Optimal spacing and sizing

---

## Color System

### Primary Palette
- **Primary Blue**: #3B82F6 (Actions, links)
- **Success Green**: #10B981 (Completed, verified)
- **Warning Yellow**: #F59E0B (Alerts, pending)
- **Error Red**: #EF4444 (Failures, critical)
- **Neutral Gray**: #6B7280 (Secondary text)

### Background Colors
- **Page Background**: #F9FAFB
- **Card Background**: #FFFFFF
- **Hover State**: #F3F4F6
- **Selected State**: #EFF6FF

### Status Colors
- **New**: Blue (#3B82F6)
- **In Progress**: Yellow (#F59E0B)
- **Completed**: Green (#10B981)
- **Failed**: Red (#EF4444)
- **Cancelled**: Gray (#6B7280)

---

## Typography

### Font Hierarchy
- **Brand Text**: Nasalization (SAYLOGIX branding)
- **Headings**: Inter (600-700 weight)
- **Body Text**: Inter (400-500 weight)
- **Monospace**: Source Code Pro (codes, IDs)

### Text Sizes
- **Page Title**: 2xl (24px)
- **Section Headers**: xl (20px)
- **Card Titles**: lg (18px)
- **Body Text**: base (16px)
- **Small Text**: sm (14px)
- **Caption**: xs (12px)

---

## Animation & Transitions

### Standard Animations
- **Drawer Slide**: 300ms ease-out
- **Tab Switch**: 200ms ease
- **Hover Effects**: 150ms ease
- **Loading Spinners**: 1s linear infinite
- **Success Checkmarks**: 400ms spring

### Interaction Feedback
- **Button Press**: Scale 0.95
- **Card Hover**: Subtle shadow elevation
- **Row Hover**: Background color change
- **Focus States**: Blue outline (2px)

---

This documentation serves as the authoritative reference for all screen layouts in Saylogix OS. Each screen maintains consistency while serving its specific business function.