import Emittery from 'emittery';

// Define all event types from the sequence diagram
export interface EventData {
  eventId: string;
  eventType: string;
  entityType: string;
  entityId: number;
  payload: any;
  source?: string;
  userId?: number;
  timestamp?: Date;
}

// Event mapping based on the sequence diagram
export const EVENT_TYPES = {
  // Order ingestion & NAS verification (EV001-EV017)
  'EV001': 'order.fetched',
  'EV002': 'verify.start',
  'EV003': 'verify.check.nas.code',
  'EV004': 'verify.lookup.database',
  'EV005': 'verify.match.address',
  'EV006': 'nas.not.found',
  'EV007': 'verify.prompt.whatsapp',
  'EV008': 'address.confirmed',
  'EV009': 'verify.resolved',
  'EV010': 'oms.order.received',
  'EV011': 'validate.order',
  'EV012': 'prioritize.order',
  'EV013': 'assign.courier',
  'EV014': 'allocate.inventory',
  'EV015': 'validation.failure',
  'EV016': 'exception.address.stock.courier',
  'EV017': 'order.ready',

  // WMS Inbound (EV020-EV029)
  'EV020': 'inbound.announced',
  'EV021': 'gate.logged',
  'EV022': 'dock.assigned',
  'EV023': 'unload.started',
  'EV024': 'visual.qc',
  'EV025': 'grn.created',
  'EV026': 'inbound.exception',
  'EV027': 'exception.logged',
  'EV028': 'retry.unload.escalate.procurement',
  'EV029': 'grn.to.staging',

  // WMS Putaway (EV030-EV036)
  'EV030': 'putaway.task.generated',
  'EV031': 'bin.suggested',
  'EV032': 'cart.scanned',
  'EV033': 'destination.scanned',
  'EV034': 'putaway.exception',
  'EV035': 'putaway.exception.logged',
  'EV036': 'putaway.completed',

  // Inventory Management (EV040-EV046)
  'EV040': 'status.tagged',
  'EV041': 'replenishment.triggered',
  'EV042': 'adjustment.logged',
  'EV043': 'cycle.count.scheduled',
  'EV044': 'discrepancy',
  'EV045': 'auto.lock',
  'EV046': 'count.verified',

  // Picking (EV050-EV058)
  'EV050': 'wms.order.received',
  'EV051': 'pick.task.generated',
  'EV052': 'pick.path.optimized',
  'EV053': 'pick.started',
  'EV054': 'pick.scanned',
  'EV055': 'picking.exception',
  'EV056': 'pick.exception',
  'EV057': 'pick.retry.escalate',
  'EV058': 'pick.completed',

  // Packing (EV060-EV068)
  'EV060': 'pack.cart.received',
  'EV061': 'verify.items',
  'EV062': 'box.selected',
  'EV063': 'weight.captured',
  'EV064': 'label.generated',
  'EV065': 'label.weight.issue',
  'EV066': 'label.failed.weight.missing',
  'EV067': 'retry.label.print',
  'EV068': 'pack.completed',

  // Dispatch (EV070-EV079)
  'EV070': 'cart.scanned',
  'EV071': 'package.staged',
  'EV072': 'manifest.prepared',
  'EV073': 'courier.arrived',
  'EV074': 'package.scanned',
  'EV075': 'manifest.confirmed',
  'EV076': 'dispatch.exception',
  'EV077': 'exception.scan.label',
  'EV078': 'override.confirmed',
  'EV079': 'order.dispatched',
  'EV080': 'tracking.link.sent',

  // LMS Delivery (EV090-EV098)
  'EV090': 'manifest.received',
  'EV091': 'route.assigned',
  'EV092': 'driver.assigned',
  'EV093': 'driver.scanned',
  'EV094': 'on.route',
  'EV095': 'out.for.delivery',
  'EV096': 'delivered',
  'EV097': 'status.updated',
  'EV098': 'delivery.confirmed',

  // Feedback & RTO (EV099-EV112)
  'EV099': 'gps.backfill.verify.nas',
  'EV100': 'return.requested',
  'EV101': 'return.created',
  'EV102': 'return.received',
  'EV103': 'qc.inspected',
  'EV104': 'return.status.resolved',
  'EV105': 'return.lifecycle.closed',
  'EV110': 'feedback.received',
  'EV111': 'delivery.disputed',
  'EV112': 'manual.confirmation.triggered',

  // Webhook Events (EV201-EV205)
  'EV201': 'source.sync.exception',
  'EV202': 'source.sync.ready_for_fulfillment',
  'EV203': 'source.sync.dispatched',
  'EV204': 'source.sync.delivered',
  'EV205': 'source.sync.returned'
} as const;

class SaylogixEventBus extends Emittery<{ [K in keyof typeof EVENT_TYPES]: EventData }> {
  constructor() {
    super();
    
    // Log all events for debugging
    this.onAny((eventName, eventData) => {
      console.log(`[EventBus] ${eventName}:`, {
        eventId: eventData.eventId,
        eventType: eventData.eventType,
        entityType: eventData.entityType,
        entityId: eventData.entityId,
        source: eventData.source,
        timestamp: eventData.timestamp || new Date()
      });
    });
  }

  // Emit event with automatic type mapping
  async emitEvent(eventId: keyof typeof EVENT_TYPES, data: Omit<EventData, 'eventId' | 'eventType'>) {
    const eventType = EVENT_TYPES[eventId];
    const eventData: EventData = {
      ...data,
      eventId,
      eventType,
      timestamp: data.timestamp || new Date()
    };

    await this.emit(eventId, eventData);
    return eventData;
  }

  // Subscribe to specific event patterns
  onOrderEvent(callback: (eventData: EventData) => void) {
    this.onAny((eventName, eventData) => {
      if (eventData.entityType === 'order') {
        callback(eventData);
      }
    });
  }

  onInventoryEvent(callback: (eventData: EventData) => void) {
    this.onAny((eventName, eventData) => {
      if (eventData.entityType === 'inventory') {
        callback(eventData);
      }
    });
  }

  onWarehouseEvent(callback: (eventData: EventData) => void) {
    this.onAny((eventName, eventData) => {
      if (['picking', 'packing', 'inbound', 'putaway'].includes(eventData.entityType)) {
        callback(eventData);
      }
    });
  }

  onDispatchEvent(callback: (eventData: EventData) => void) {
    this.onAny((eventName, eventData) => {
      if (['dispatch', 'manifest', 'route'].includes(eventData.entityType)) {
        callback(eventData);
      }
    });
  }

  // Get event statistics
  getEventStats() {
    return {
      totalEventTypes: Object.keys(EVENT_TYPES).length,
      eventTypes: EVENT_TYPES
    };
  }
}

export const eventBus = new SaylogixEventBus();
