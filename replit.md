# Saylogix OS - Logistics Orchestration System

## Overview

Saylogix OS is a comprehensive fullstack logistics management system built as a monorepo. It provides an integrated solution for order management, warehouse operations, dispatch, and last-mile delivery tracking. The system is designed to handle the complete order fulfillment lifecycle from ingestion to delivery with real-time tracking and analytics.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Wouter** for client-side routing instead of React Router
- **TailwindCSS** for styling with custom design system
- **shadcn/ui** components with Radix UI primitives
- **Tanstack React Query** for API state management and caching
- **WebSocket** integration for real-time updates

### Backend Architecture
- **Node.js** with **Express.js** server
- **TypeScript** throughout the application
- **Event-driven architecture** using Emittery for internal communication
- **RESTful APIs** with comprehensive error handling
- **WebSocket server** for real-time client updates
- **Modular service architecture** with dedicated modules for each business domain

### Database & ORM
- **PostgreSQL** with Neon serverless database
- **Drizzle ORM** for database operations and schema management
- **Zod** for schema validation integration
- Shared schema definitions between frontend and backend

## Key Components

### Business Modules
1. **OMS (Order Management System)** - Order ingestion, validation, prioritization
2. **NAS (Address Verification)** - Saudi NAS code verification with WhatsApp fallback
3. **WMS (Warehouse Management)** - Inbound, inventory, picking, packing operations
4. **DMS (Dispatch Management)** - Grouping, manifests, courier handover
5. **LMS (Last Mile)** - Route assignment, driver coordination, GPS tracking
6. **Tracking System** - Real-time order status and customer notifications
7. **Reports & Analytics** - Operational dashboards and KPI monitoring
8. **Integrations** - Tabs with integration types
9. **Settings** - Warehouse locations, Users

### Core Services
- **Event Bus** - Central event coordination with 100+ defined event types
- **Shopify Service** - Live integration with Shopify Admin API
- **Courier Services** - Integration with Aramex, SMSA, Naqel APIs
- **WhatsApp Service** - Customer communication for address verification
- **Webhook Service** - Reliable webhook processing with retry logic
- **Storage Service** - Abstracted database operations

### UI Components
- **Modular Layout System** - Sidebar navigation, top bar, alerts banner
- **Scanner Integration** - Context-aware barcode/QR scanning overlay
- **Real-time Dashboard** - Live KPIs and activity feed
- **Task Management** - Floating task panel for user actions

## Data Flow

### Order Processing Flow
1. **Order Ingestion** - Fetch from Shopify via webhook or polling
2. **Address Verification** - NAS code lookup with WhatsApp fallback
3. **Order Validation** - Inventory allocation and courier assignment
4. **Warehouse Operations** - Picking, packing, and staging
5. **Dispatch** - Manifest creation and courier handover
6. **Last Mile** - Route optimization and delivery tracking
7. **Completion** - Delivery confirmation and customer notification

### Event-Driven Communication
- **100+ Event Types** mapped to business processes (EV001-EV099)
- **Persistent Event Log** for audit trails and debugging
- **Real-time WebSocket** updates to frontend clients
- **Cross-module communication** through event bus

### API Architecture
- **RESTful endpoints** for CRUD operations
- **Real-time WebSocket** for live updates
- **Webhook handlers** for external system integration
- **Standardized error responses** and logging
- **No dummy data used at any stage of development or testing**
- **All integrations must connect and operate in real-time (no scheduled sync)**

## Internal Order ID Format

**Format:** `SL{YY}-{N}`  
- **`SL`** – Static prefix identifying Saylogix orders  
- **`{YY}`** – Last two digits of the Gregorian calendar year when the order was ingested  
- **`{N}`** – Incremental integer starting from `1` per year, increasing sequentially for each new order

### Examples
- First order in 2025 → `SL25-1`
- Second order in 2025 → `SL25-2`
- First order in 2026 → `SL26-1`

### Implementation Notes
- **Storage:** Save in OMS database as `internal_order_id`
- **Generation Logic:**  
  On order ingestion:
  1. Extract current year (`YY = new Date().getFullYear() % 100`)
  2. Query existing max `N` where prefix = `SL{YY}` (e.g. `SL25`)
  3. Increment `N` by 1
  4. Format as `SL{YY}-{N}` and assign to order

- **Uniqueness Guarantee:**
  - Add a unique constraint on `internal_order_id`
  - Ensure transactional lock or atomic increment to avoid duplicate IDs under race conditions

- **Use Across Modules:**
  - Pass both `internal_order_id` and `external_order_id` to all downstream systems (WMS, DMS, LMS, Tracking)
  - Use in customer notifications and dashboards for consistency

## External Dependencies

### Required Integrations
- **Shopify Admin API** - Live order and inventory sync
- **Saudi NAS API** - Address verification service
- **Courier APIs** - Aramex, SMSA, Naqel for shipping
- **WhatsApp Business API** - Customer communication
- **Neon PostgreSQL** - Serverless database hosting

### Development Tools
- **Vite** - Frontend build tool with HMR
- **Drizzle Kit** - Database migrations and introspection
- **ESBuild** - Backend bundling for production
- **TypeScript** - Type safety across the stack

## Deployment Strategy

### Development Environment
- **Replit integration** with runtime error overlay
- **Hot module replacement** for frontend development
- **Automatic server restart** on backend changes
- **Environment variable management** for API credentials

### Production Build
- **Frontend bundling** with Vite to `dist/public`
- **Backend bundling** with ESBuild to `dist/`
- **Static file serving** from Express server
- **Database migrations** via Drizzle Kit

### Configuration
- **Environment variables** for all external API credentials
- **Shared TypeScript configuration** across client/server
- **Path aliases** for clean imports (`@/`, `@shared/`)
- **TailwindCSS configuration** with custom design tokens

## Changelog
```
Changelog:
- July 09, 2025. Major UI consistency improvements and visual bug fixes
  - Fixed all invisible navigation icons by replacing FontAwesome with Lucide React icons
  - Implemented consistent tabbed layout across all screens (Orders, Dashboard, etc.)
  - Refactored Orders (OMS) page with proper status tabs, clean layout, and slide-over drawer
  - Updated Dashboard with proper Lucide icons and consistent spacing
  - Enhanced sidebar navigation with comprehensive icon mapping
  - Fixed notification bell visibility and all interactive elements
  - Removed redundant search bars and duplicate controls per UI plan
  - All icons now properly visible with consistent styling
- July 08, 2025. Unified NAS verification system with SPL integration
  - Refactored "Address Verify (NAS)" to "Verify NAS" with single verification tab
  - Removed redundant "SPL Address Verification" menu item
  - Implemented unified SPL-first, NAS-fallback verification architecture
  - Added SPL NAD service with proper error handling and token configuration
  - Created comprehensive order NAS parsing with automatic verification
  - Added SPL integration to Settings > Integrations with verification tab
  - Implemented automatic address verification for marketplace orders
  - All NAS verification now uses authentic SPL API with fallback to internal NAS
- July 08, 2025. Improved Shopify sync system and removed manual controls
  - Implemented full order fetching (all statuses, not just open) with pagination support
  - Removed "Sync Shopify" button - now handles syncing automatically via webhooks
  - Fixed sequential order numbering: SL25-001, SL25-002, etc. based on chronological order
  - Disabled system alerts banner - courier assignments handled silently
  - Enhanced null address handling for orders without shipping/billing info
  - All 17 Shopify orders now synced with proper sequential Saylogix numbers
  - System operates with webhook-driven real-time sync, no manual intervention needed
- July 08, 2025. Completed Shopify integration and database cleanup
  - Fixed Shopify connector issues: null address handling, missing event_id fields
  - Successfully synced 14 real Shopify orders with authentic customer data
  - Removed Store Name field from config - now auto-fetched from Shopify API
  - Implemented webhook auto-registration for orders/create and orders/updated
  - Database now contains ONLY real marketplace orders (Shopify)
  - Removed all dummy/test data: cleaned orders, order_items, events, inventory
  - System now operates with 100% authentic data from live Shopify integration
- July 06, 2025. Initial setup
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```