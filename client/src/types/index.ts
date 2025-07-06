// Re-export shared types
export type {
  User,
  InsertUser,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  Inventory,
  InsertInventory,
  Event,
  InsertEvent,
  AddressVerification,
  InsertAddressVerification,
  NasLookup,
  InsertNasLookup,
  PickTask,
  InsertPickTask,
  PackTask,
  InsertPackTask,
  Manifest,
  InsertManifest,
  ManifestItem,
  InsertManifestItem,
  Route,
  InsertRoute,
  RouteStop,
  InsertRouteStop,
  WebhookLog,
  InsertWebhookLog
} from '@shared/schema';

// Frontend-specific types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface DashboardStats {
  activeOrders: number;
  inPicking: number;
  readyToShip: number;
  deliveredToday: number;
}

export interface VerificationStats {
  total: number;
  verified: number;
  pending: number;
  whatsappSent: number;
  failed: number;
  successRate: number;
}

export interface WebhookStats {
  total: number;
  pending: number;
  success: number;
  failed: number;
  retrying: number;
}

// Scanner types
export type ScanContext = 'sku' | 'tote' | 'awb' | 'bin' | 'order' | 'general';

export interface ScanResult {
  success: boolean;
  data?: any;
  error?: string;
  context: ScanContext;
}

// Event types for real-time updates
export interface RealtimeEvent {
  id: string;
  type: string;
  eventName: string;
  data: {
    eventId: string;
    eventType: string;
    entityType: string;
    entityId: number;
    description?: string;
    source?: string;
    timestamp: string;
  };
}

// Order status types
export type OrderStatus = 
  | 'fetched'
  | 'validated' 
  | 'picking'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'exception'
  | 'cancelled';

// Task status types
export type TaskStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'exception'
  | 'cancelled';

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Courier types
export type CourierName = 'aramex' | 'smsa' | 'naqel' | 'custom';

// Route status types
export type RouteStatus = 
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'exception';

// Manifest status types
export type ManifestStatus = 
  | 'pending'
  | 'ready'
  | 'handed_over'
  | 'exception';

// Address verification types
export interface AddressVerificationRequest {
  orderId: number;
  nasCode?: string;
  customerResponse?: string;
}

export interface AddressVerificationResult {
  verified: boolean;
  nasCode?: string;
  verifiedAddress?: any;
  requiresWhatsApp: boolean;
  errorMessage?: string;
}

// Tracking types
export interface TrackingEvent {
  status: string;
  description: string;
  timestamp: string;
  location: string;
  completed: boolean;
}

export interface TrackingInfo {
  trackingNumber: string;
  orderNumber: string;
  status: string;
  estimatedDelivery: string;
  courier: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  timeline: TrackingEvent[];
}

// Reports types
export interface PerformanceMetric {
  title: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: string;
}

export interface ReportFilter {
  timeRange: '1day' | '7days' | '30days' | '90days';
  reportType: 'overview' | 'fulfillment' | 'warehouse' | 'delivery' | 'exceptions';
}

// Form validation types
export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormError[];
  isSubmitting: boolean;
  isDirty: boolean;
}

// Navigation types
export interface MenuItem {
  path: string;
  label: string;
  icon: string;
  hasSubmenu?: boolean;
  children?: MenuItem[];
}

export interface MenuSection {
  section: string;
  items: MenuItem[];
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'event' | 'notification' | 'update';
  eventName?: string;
  data: any;
  timestamp: string;
}

// Quick action types
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  bgColor: string;
  iconColor: string;
  action: () => void;
}

// Task notification types
export interface TaskNotification {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  type: 'verification' | 'exception' | 'assignment' | 'approval';
  icon: string;
  createdAt: string;
}

// System settings types
export interface SystemSettings {
  notifications: {
    email: boolean;
    whatsapp: boolean;
    realtime: boolean;
  };
  automation: {
    autoAssignCourier: boolean;
    autoGenerateManifest: boolean;
    autoSendTracking: boolean;
  };
  thresholds: {
    lowStockLevel: number;
    priorityOrderValue: number;
    autoVerificationTimeout: number;
  };
}

// Export utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Required<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type Nullable<T> = T | null;
export type MaybeArray<T> = T | T[];
