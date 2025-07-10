# SaylogixOS Database Schema Overview

This document provides a comprehensive overview of all database tables in the SaylogixOS logistics management system. The schema uses PostgreSQL with Drizzle ORM.

## Table of Contents

1. [Core Business Tables](#core-business-tables)
2. [Warehouse Management Tables](#warehouse-management-tables)
3. [Configuration & Settings Tables](#configuration--settings-tables)
4. [Inventory Management Tables](#inventory-management-tables)
5. [Integration & System Tables](#integration--system-tables)
6. [Relationships Overview](#relationships-overview)

---

## Core Business Tables

### 1. **users**
User authentication and management table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing user ID |
| username | text | NOT NULL, UNIQUE | Unique username for login |
| password | text | NOT NULL | Hashed password |
| email | text | - | User email address |
| role | text | DEFAULT 'user' | User role (admin, picker, packer, etc.) |
| created_at | timestamp | DEFAULT NOW() | Account creation timestamp |

### 2. **orders**
Main orders table storing order lifecycle and metadata.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing order ID |
| saylogix_number | varchar(50) | NOT NULL, UNIQUE | Internal order ID (SL25-001 format) |
| source_order_number | varchar(100) | NOT NULL | External order number from source channel |
| source_channel | varchar(50) | NOT NULL | Source channel (shopify, amazon, etc.) |
| source_channel_data | jsonb | - | Raw source channel data |
| status | varchar(50) | NOT NULL, DEFAULT 'fetched' | Order status in workflow |
| customer_name | text | NOT NULL | Customer full name |
| customer_phone | varchar(20) | - | Customer phone number |
| customer_email | text | - | Customer email address |
| shipping_address | jsonb | - | Shipping address object |
| billing_address | jsonb | - | Billing address object |
| coordinates | jsonb | - | GPS coordinates {lat, lng} |
| order_value | decimal(10,2) | - | Total order value |
| currency | varchar(3) | DEFAULT 'SAR' | Currency code |
| nas_code | varchar(10) | - | Saudi NAS address code |
| nas_verified | boolean | DEFAULT false | Address verification status |
| courier_assigned | varchar(50) | - | Assigned courier service |
| tracking_number | varchar(100) | - | Courier tracking number |
| priority | varchar(20) | DEFAULT 'normal' | Order priority level |
| order_fetched | timestamp | - | Order fetch timestamp |
| verify_completed | timestamp | - | Address verification completion |
| picking_started | timestamp | - | Picking process start |
| picking_completed | timestamp | - | Picking completion |
| packing_completed | timestamp | - | Packing completion |
| dispatched | timestamp | - | Dispatch timestamp |
| delivered | timestamp | - | Delivery completion |
| created_at | timestamp | DEFAULT NOW() | Record creation timestamp |
| updated_at | timestamp | DEFAULT NOW() | Last update timestamp |

### 3. **order_items**
Individual items within orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing item ID |
| order_id | integer | NOT NULL | Foreign key to orders table |
| sku | varchar(100) | NOT NULL | Product SKU identifier |
| product_name | text | NOT NULL | Product display name |
| quantity | integer | NOT NULL | Ordered quantity |
| unit_price | decimal(10,2) | - | Price per unit |
| total_price | decimal(10,2) | - | Total line item price |
| weight | decimal(8,3) | - | Item weight |
| picked | boolean | DEFAULT false | Picking completion status |
| packed | boolean | DEFAULT false | Packing completion status |
| bin_location | varchar(20) | - | Warehouse bin location |

### 4. **inventory**
Master inventory table for stock management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing inventory ID |
| sku | varchar(100) | NOT NULL, UNIQUE | Product SKU identifier |
| product_name | text | NOT NULL | Product display name |
| category | varchar(100) | - | Product category |
| available_qty | integer | DEFAULT 0 | Available stock quantity |
| reserved_qty | integer | DEFAULT 0 | Reserved for orders quantity |
| on_hand_qty | integer | DEFAULT 0 | Physical stock on hand |
| reorder_level | integer | DEFAULT 0 | Minimum stock threshold |
| bin_location | varchar(20) | - | Primary bin location |
| status | varchar(20) | DEFAULT 'active' | Inventory item status |
| last_adjustment | timestamp | - | Last adjustment timestamp |
| created_at | timestamp | DEFAULT NOW() | Record creation timestamp |
| updated_at | timestamp | DEFAULT NOW() | Last update timestamp |

---

## Warehouse Management Tables

### 5. **pick_tasks**
Individual picking tasks for warehouse operations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing task ID |
| order_id | integer | NOT NULL | Foreign key to orders table |
| order_item_id | integer | NOT NULL | Foreign key to order_items table |
| sku | varchar(100) | NOT NULL | Product SKU to pick |
| quantity | integer | NOT NULL | Quantity to pick |
| bin_location | varchar(20) | NOT NULL | Pick location |
| status | varchar(20) | DEFAULT 'pending' | Task status |
| assigned_to | varchar(100) | - | Assigned picker |
| pick_path | varchar(10) | - | Optimized pick path |
| picked_qty | integer | DEFAULT 0 | Actually picked quantity |
| picked_at | timestamp | - | Pick completion timestamp |
| tote_id | varchar(50) | - | Tote/container ID |
| exception_reason | text | - | Exception details if any |
| created_at | timestamp | DEFAULT NOW() | Task creation timestamp |

### 6. **pack_tasks**
Packing tasks for order fulfillment.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing task ID |
| order_id | integer | NOT NULL | Foreign key to orders table |
| tote_id | varchar(50) | - | Source tote/container ID |
| status | varchar(20) | DEFAULT 'pending' | Packing task status |
| assigned_to | varchar(100) | - | Assigned packer |
| box_type | varchar(50) | - | Packaging box type |
| weight | decimal(8,3) | - | Final package weight |
| dimensions | varchar(50) | - | Package dimensions |
| label_generated | boolean | DEFAULT false | Shipping label status |
| tracking_number | varchar(100) | - | Generated tracking number |
| packed_at | timestamp | - | Packing completion timestamp |
| exception_reason | text | - | Exception details if any |
| created_at | timestamp | DEFAULT NOW() | Task creation timestamp |

### 7. **manifests**
Courier manifest management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing manifest ID |
| manifest_number | varchar(50) | NOT NULL, UNIQUE | Unique manifest identifier |
| courier_name | varchar(100) | NOT NULL | Courier service name |
| total_packages | integer | DEFAULT 0 | Total packages in manifest |
| status | varchar(20) | DEFAULT 'pending' | Manifest status |
| generated_at | timestamp | DEFAULT NOW() | Manifest generation time |
| handed_over_at | timestamp | - | Handover completion time |
| handed_over_to | varchar(100) | - | Courier representative name |

### 8. **manifest_items**
Individual packages within manifests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing item ID |
| manifest_id | integer | NOT NULL | Foreign key to manifests table |
| order_id | integer | NOT NULL | Foreign key to orders table |
| tracking_number | varchar(100) | NOT NULL | Package tracking number |
| status | varchar(20) | DEFAULT 'staged' | Package status |
| scanned_at | timestamp | - | Scan timestamp during handover |

### 9. **routes**
Last-mile delivery route management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing route ID |
| route_number | varchar(50) | NOT NULL, UNIQUE | Unique route identifier |
| driver_id | varchar(50) | - | Driver identifier |
| driver_name | varchar(100) | - | Driver full name |
| vehicle_number | varchar(20) | - | Vehicle registration number |
| total_stops | integer | DEFAULT 0 | Total delivery stops |
| completed_stops | integer | DEFAULT 0 | Completed delivery count |
| status | varchar(20) | DEFAULT 'planned' | Route status |
| zone | varchar(100) | - | Delivery zone |
| last_scan | timestamp | - | Last activity timestamp |
| estimated_duration | integer | - | Estimated duration in hours |
| actual_duration | integer | - | Actual duration in minutes |
| started_at | timestamp | - | Route start timestamp |
| completed_at | timestamp | - | Route completion timestamp |
| created_at | timestamp | DEFAULT NOW() | Route creation timestamp |

### 10. **route_stops**
Individual delivery stops within routes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing stop ID |
| route_id | integer | NOT NULL | Foreign key to routes table |
| order_id | integer | NOT NULL | Foreign key to orders table |
| stop_sequence | integer | NOT NULL | Stop order in route |
| address | jsonb | NOT NULL | Delivery address object |
| coordinates | jsonb | - | GPS coordinates |
| status | varchar(20) | DEFAULT 'pending' | Delivery status |
| attempt_count | integer | DEFAULT 0 | Delivery attempt count |
| delivered_at | timestamp | - | Successful delivery timestamp |
| failure_reason | text | - | Failure reason if applicable |

---

## Configuration & Settings Tables

### 11. **integrations**
External system integration configuration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing integration ID |
| name | varchar(100) | NOT NULL, UNIQUE | Integration display name |
| type | varchar(50) | NOT NULL | Integration type (shopify, aramex, etc.) |
| category | varchar(50) | NOT NULL | Category (ecommerce, courier, messaging) |
| is_enabled | boolean | DEFAULT false | Integration enable status |
| config | jsonb | - | Integration configuration |
| last_sync_at | timestamp | - | Last synchronization timestamp |
| success_count | integer | DEFAULT 0 | Successful operation count |
| failure_count | integer | DEFAULT 0 | Failed operation count |
| last_error | text | - | Last error message |
| created_at | timestamp | DEFAULT NOW() | Integration creation timestamp |
| updated_at | timestamp | DEFAULT NOW() | Last update timestamp |

### 12. **warehouse_zones**
Warehouse zone definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing zone ID |
| name | varchar(100) | NOT NULL, UNIQUE | Zone name |
| description | text | - | Zone description |
| is_active | boolean | DEFAULT true | Zone active status |
| created_at | timestamp | DEFAULT NOW() | Zone creation timestamp |

### 13. **staff_roles**
User role and permission management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing role ID |
| title | varchar(100) | NOT NULL, UNIQUE | Role title |
| description | text | - | Role description |
| permissions | jsonb | - | Array of permission strings |
| is_active | boolean | DEFAULT true | Role active status |
| created_at | timestamp | DEFAULT NOW() | Role creation timestamp |

### 14. **tote_cart_types**
Warehouse equipment type definitions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing type ID |
| name | varchar(100) | NOT NULL, UNIQUE | Equipment type name |
| type | varchar(20) | NOT NULL | Type category (tote, cart) |
| capacity | integer | - | Capacity specification |
| dimensions | jsonb | - | Dimensions object {length, width, height} |
| is_active | boolean | DEFAULT true | Type active status |
| created_at | timestamp | DEFAULT NOW() | Type creation timestamp |

---

## Inventory Management Tables

### 15. **inventory_adjustments**
Inventory quantity adjustment tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing adjustment ID |
| adjustment_number | varchar(50) | NOT NULL, UNIQUE | Unique adjustment identifier (ADJ-xxx) |
| sku | varchar(100) | NOT NULL | Product SKU |
| bin_location | varchar(20) | NOT NULL | Adjustment location |
| adjustment_type | varchar(20) | NOT NULL | Type (increase, decrease, set) |
| reason | varchar(100) | NOT NULL | Adjustment reason code |
| reason_details | text | - | Detailed reason description |
| before_qty | integer | NOT NULL | Quantity before adjustment |
| adjustment_qty | integer | NOT NULL | Adjustment amount |
| after_qty | integer | NOT NULL | Quantity after adjustment |
| status | varchar(20) | DEFAULT 'pending' | Approval status |
| requested_by | varchar(100) | NOT NULL | Requesting user |
| approved_by | varchar(100) | - | Approving user |
| approved_at | timestamp | - | Approval timestamp |
| applied_at | timestamp | - | Application timestamp |
| created_at | timestamp | DEFAULT NOW() | Adjustment creation timestamp |

### 16. **cycle_count_tasks**
Cycle count task management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing task ID |
| task_number | varchar(50) | NOT NULL, UNIQUE | Unique task identifier (CC-xxx) |
| count_type | varchar(20) | NOT NULL | Count type (zone, sku, location, discrepancy) |
| criteria | jsonb | - | Count criteria specification |
| status | varchar(20) | DEFAULT 'created' | Task status |
| assigned_to | varchar(100) | - | Assigned counter |
| expected_item_count | integer | DEFAULT 0 | Expected items to count |
| completed_item_count | integer | DEFAULT 0 | Completed item count |
| discrepancy_count | integer | DEFAULT 0 | Items with discrepancies |
| started_at | timestamp | - | Count start timestamp |
| completed_at | timestamp | - | Count completion timestamp |
| due_date | timestamp | - | Task due date |
| notes | text | - | Additional notes |
| created_at | timestamp | DEFAULT NOW() | Task creation timestamp |

### 17. **cycle_count_items**
Individual items within cycle count tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing item ID |
| task_id | integer | NOT NULL | Foreign key to cycle_count_tasks |
| sku | varchar(100) | NOT NULL | Product SKU |
| bin_location | varchar(20) | NOT NULL | Count location |
| system_qty | integer | NOT NULL | System recorded quantity |
| counted_qty | integer | - | Physical count quantity |
| discrepancy | integer | DEFAULT 0 | Quantity discrepancy |
| status | varchar(20) | DEFAULT 'pending' | Count status |
| counted_by | varchar(100) | - | Counter identifier |
| counted_at | timestamp | - | Count timestamp |
| notes | text | - | Count notes |
| adjustment_created | boolean | DEFAULT false | Adjustment creation flag |

### 18. **product_expiry**
Product expiration tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing expiry ID |
| sku | varchar(100) | NOT NULL | Product SKU |
| batch_number | varchar(50) | NOT NULL | Product batch identifier |
| bin_location | varchar(20) | NOT NULL | Storage location |
| quantity | integer | NOT NULL | Batch quantity |
| expiry_date | timestamp | NOT NULL | Product expiration date |
| status | varchar(20) | DEFAULT 'active' | Expiry status |
| days_to_expiry | integer | - | Calculated days to expiry |
| alert_level | varchar(20) | - | Alert level (green, yellow, red) |
| created_at | timestamp | DEFAULT NOW() | Record creation timestamp |
| updated_at | timestamp | DEFAULT NOW() | Last update timestamp |

---

## Integration & System Tables

### 19. **events**
System event logging and audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing event ID |
| event_id | varchar(50) | NOT NULL | Event identifier (EV001-EV099) |
| event_type | varchar(100) | NOT NULL | Event type description |
| entity_type | varchar(50) | NOT NULL | Affected entity type |
| entity_id | integer | NOT NULL | Affected entity ID |
| description | text | - | Event description |
| status | varchar(20) | DEFAULT 'success' | Event status |
| triggered_by | varchar(100) | - | Event trigger source |
| source_system | varchar(50) | - | Source system identifier |
| event_data | jsonb | - | Event payload data |
| previous_state | jsonb | - | Entity state before event |
| new_state | jsonb | - | Entity state after event |
| metadata | jsonb | - | Additional event metadata |
| error_message | text | - | Error details if applicable |
| created_at | timestamp | DEFAULT NOW() | Event timestamp |

### 20. **address_verifications**
Address verification tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing verification ID |
| order_id | integer | NOT NULL | Foreign key to orders table |
| original_address | jsonb | NOT NULL | Original address object |
| verified_address | jsonb | - | Verified address object |
| status | varchar(20) | DEFAULT 'pending' | Verification status |
| verification_method | varchar(50) | - | Verification method used |
| nas_code | varchar(10) | - | NAS code if applicable |
| whatsapp_message_id | varchar(100) | - | WhatsApp message identifier |
| customer_response | text | - | Customer response text |
| verified_at | timestamp | - | Verification completion timestamp |
| created_at | timestamp | DEFAULT NOW() | Verification creation timestamp |

### 21. **nas_lookups**
Saudi NAS code lookup table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing lookup ID |
| nas_code | varchar(10) | NOT NULL, UNIQUE | NAS code identifier |
| address | text | - | Full address text |
| city | varchar(100) | - | City name |
| district | varchar(100) | - | District name |
| postal_code | varchar(10) | - | Postal code |
| coordinates | jsonb | - | GPS coordinates |
| verified | boolean | DEFAULT false | Verification status |
| last_verified | timestamp | - | Last verification timestamp |
| created_at | timestamp | DEFAULT NOW() | Record creation timestamp |

### 22. **webhook_logs**
Webhook processing logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing log ID |
| webhook_id | varchar(100) | NOT NULL | Webhook identifier |
| url | text | NOT NULL | Target URL |
| method | varchar(10) | NOT NULL | HTTP method |
| headers | jsonb | - | Request headers |
| payload | jsonb | - | Request payload |
| status | varchar(20) | DEFAULT 'pending' | Processing status |
| response_status | integer | - | HTTP response status |
| response_body | text | - | Response body |
| retry_count | integer | DEFAULT 0 | Retry attempt count |
| max_retries | integer | DEFAULT 3 | Maximum retry attempts |
| next_retry_at | timestamp | - | Next retry timestamp |
| last_attempt_at | timestamp | - | Last attempt timestamp |
| created_at | timestamp | DEFAULT NOW() | Log creation timestamp |

---

## Inbound Management Tables

### 23. **purchase_orders**
Purchase order management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing PO ID |
| po_number | varchar(100) | NOT NULL, UNIQUE | Purchase order number |
| supplier | text | NOT NULL | Supplier name |
| eta | timestamp | - | Estimated time of arrival |
| status | varchar(50) | DEFAULT 'pending' | PO status |
| asn_received | boolean | DEFAULT false | Advanced shipping notice status |
| asn_numbers | jsonb | - | Array of airway bill numbers |
| gate_entry | boolean | DEFAULT false | Gate entry completion |
| gate_entry_time | timestamp | - | Gate entry timestamp |
| dock_assignment | varchar(20) | - | Assigned dock number |
| unloaded | boolean | DEFAULT false | Unloading completion status |
| unloading_comments | text | - | Unloading notes |
| unloading_time | timestamp | - | Unloading completion timestamp |
| created_at | timestamp | DEFAULT NOW() | PO creation timestamp |
| updated_at | timestamp | DEFAULT NOW() | Last update timestamp |

### 24. **purchase_order_items**
Individual items within purchase orders.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing item ID |
| po_id | integer | NOT NULL | Foreign key to purchase_orders |
| sku | varchar(100) | NOT NULL | Product SKU |
| description | text | NOT NULL | Item description |
| expected_quantity | integer | NOT NULL | Expected quantity |
| received_quantity | integer | DEFAULT 0 | Actually received quantity |
| unit_cost | decimal(10,2) | - | Cost per unit |
| total_cost | decimal(10,2) | - | Total line cost |

### 25. **goods_receipt_notes**
Goods receipt note management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing GRN ID |
| grn_number | varchar(100) | NOT NULL, UNIQUE | GRN identifier |
| po_id | integer | NOT NULL | Foreign key to purchase_orders |
| po_number | varchar(100) | NOT NULL | Purchase order number |
| supplier | text | NOT NULL | Supplier name |
| status | varchar(50) | DEFAULT 'pending' | GRN processing status |
| processed_by | varchar(100) | - | Processing user |
| processing_started | timestamp | - | Processing start timestamp |
| processing_completed | timestamp | - | Processing completion timestamp |
| discrepancy_notes | text | - | Discrepancy documentation |
| created_at | timestamp | DEFAULT NOW() | GRN creation timestamp |
| updated_at | timestamp | DEFAULT NOW() | Last update timestamp |

### 26. **grn_items**
Individual items within goods receipt notes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing item ID |
| grn_id | integer | NOT NULL | Foreign key to goods_receipt_notes |
| sku | varchar(100) | NOT NULL | Product SKU |
| description | text | NOT NULL | Item description |
| expected_quantity | integer | NOT NULL | Expected quantity |
| received_quantity | integer | NOT NULL | Actually received quantity |
| discrepancy | text | - | Discrepancy notes |
| bin_location | varchar(20) | - | Storage location |
| scan_status | varchar(20) | DEFAULT 'pending' | Scan status |

### 27. **putaway_tasks**
Putaway task management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing task ID |
| grn_id | integer | NOT NULL | Foreign key to goods_receipt_notes |
| grn_number | varchar(100) | NOT NULL | GRN number |
| status | varchar(50) | DEFAULT 'staged' | Putaway status |
| assigned_to | varchar(100) | - | Assigned worker |
| assigned_at | timestamp | - | Assignment timestamp |
| started_at | timestamp | - | Start timestamp |
| completed_at | timestamp | - | Completion timestamp |
| cart_id | varchar(50) | - | Cart identifier |
| notes | text | - | Task notes |
| created_at | timestamp | DEFAULT NOW() | Task creation timestamp |
| updated_at | timestamp | DEFAULT NOW() | Last update timestamp |

### 28. **putaway_items**
Individual items within putaway tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | serial | PRIMARY KEY | Auto-incrementing item ID |
| putaway_task_id | integer | NOT NULL | Foreign key to putaway_tasks |
| sku | varchar(100) | NOT NULL | Product SKU |
| description | text | NOT NULL | Item description |
| quantity | integer | NOT NULL | Putaway quantity |
| bin_location | varchar(20) | - | Target location |
| scan_status | varchar(20) | DEFAULT 'pending' | Scan status |
| scanned_at | timestamp | - | Scan timestamp |
| placed_at | timestamp | - | Placement timestamp |

---

## Relationships Overview

### Primary Relationships

1. **Orders → Order Items** (1:many)
   - orders.id → order_items.order_id

2. **Orders → Pick Tasks** (1:many)
   - orders.id → pick_tasks.order_id

3. **Orders → Pack Tasks** (1:many)
   - orders.id → pack_tasks.order_id

4. **Orders → Address Verifications** (1:many)
   - orders.id → address_verifications.order_id

5. **Orders → Manifest Items** (1:many)
   - orders.id → manifest_items.order_id

6. **Orders → Route Stops** (1:many)
   - orders.id → route_stops.order_id

7. **Manifests → Manifest Items** (1:many)
   - manifests.id → manifest_items.manifest_id

8. **Routes → Route Stops** (1:many)
   - routes.id → route_stops.route_id

9. **Purchase Orders → Purchase Order Items** (1:many)
   - purchase_orders.id → purchase_order_items.po_id

10. **Purchase Orders → Goods Receipt Notes** (1:many)
    - purchase_orders.id → goods_receipt_notes.po_id

11. **Goods Receipt Notes → GRN Items** (1:many)
    - goods_receipt_notes.id → grn_items.grn_id

12. **Goods Receipt Notes → Putaway Tasks** (1:many)
    - goods_receipt_notes.id → putaway_tasks.grn_id

13. **Putaway Tasks → Putaway Items** (1:many)
    - putaway_tasks.id → putaway_items.putaway_task_id

14. **Cycle Count Tasks → Cycle Count Items** (1:many)
    - cycle_count_tasks.id → cycle_count_items.task_id

### Status Field Values

#### Order Status Flow
- `fetched` → `verified` → `picked` → `packed` → `dispatched` → `delivered`

#### Pick Task Status
- `pending` → `assigned` → `in_progress` → `completed` → `exception`

#### Pack Task Status
- `pending` → `in_progress` → `completed` → `exception`

#### Manifest Status
- `pending` → `generated` → `handed_over` → `collected`

#### Route Status
- `planned` → `assigned` → `in_progress` → `completed` → `exception`

#### Inventory Status
- `active` → `discontinued` → `quarantined`

#### Adjustment Status
- `pending` → `approved` → `rejected` → `applied`

#### Cycle Count Status
- `created` → `assigned` → `in_progress` → `completed` → `cancelled`

---

## Summary

The SaylogixOS database schema consists of **28 main tables** covering:

- **Core Business**: 4 tables (users, orders, order_items, inventory)
- **Warehouse Operations**: 6 tables (pick_tasks, pack_tasks, manifests, manifest_items, routes, route_stops)
- **Inbound Management**: 6 tables (purchase_orders, purchase_order_items, goods_receipt_notes, grn_items, putaway_tasks, putaway_items)
- **Inventory Management**: 4 tables (inventory_adjustments, cycle_count_tasks, cycle_count_items, product_expiry)
- **Configuration**: 4 tables (integrations, warehouse_zones, staff_roles, tote_cart_types)
- **System & Integration**: 4 tables (events, address_verifications, nas_lookups, webhook_logs)

The schema supports the complete order-to-delivery lifecycle with comprehensive tracking, event logging, and audit capabilities. All tables include proper timestamps for data lifecycle management and most operational tables include status fields for workflow state tracking.