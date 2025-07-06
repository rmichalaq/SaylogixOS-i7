import Emittery from 'emittery';
import { storage } from '../storage';
import { InsertEvent } from '@shared/schema';

class SaylogixEventEmitter extends Emittery {
  async emitEvent(eventId: string, eventType: string, entityType: string, entityId: string, data: any, previousState?: any) {
    // Create event record in database
    const eventRecord: InsertEvent = {
      eventId,
      eventType,
      entityType,
      entityId: Number(entityId),
      description: this.getEventDescription(eventId, eventType, data),
      status: 'success',
      triggeredBy: data.triggeredBy || 'system',
      sourceSystem: data.sourceSystem || 'saylogix',
      eventData: data,
      previousState,
      newState: data.newState || null,
      metadata: data.metadata || null
    };

    try {
      await storage.createEvent(eventRecord);
      
      // Emit the event for real-time listeners
      await this.emit(eventType, {
        eventId,
        entityType,
        entityId,
        data,
        timestamp: new Date().toISOString()
      });
      
      console.log(`Event emitted: ${eventId} - ${eventType} for ${entityType}:${entityId}`);
    } catch (error) {
      console.error(`Failed to emit event ${eventId}:`, error);
      
      // Try to record the failure
      try {
        await storage.createEvent({
          ...eventRecord,
          status: 'failure',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        });
      } catch (dbError) {
        console.error('Failed to record event failure:', dbError);
      }
    }
  }

  private getEventDescription(eventId: string, eventType: string, data: any): string {
    const descriptions: Record<string, string> = {
      'EV001': 'Order fetched from source channel',
      'EV002': 'Address verification started',
      'EV003': 'NAS code verification check',
      'EV004': 'Address database lookup',
      'EV005': 'Address pattern matching',
      'EV006': 'NAS code not found',
      'EV007': 'WhatsApp verification prompt sent',
      'EV008': 'Address confirmed by customer',
      'EV009': 'Address verification resolved',
      'EV010': 'Order received by OMS',
      'EV011': 'Order validation started',
      'EV012': 'Order prioritization completed',
      'EV013': 'Courier assignment completed',
      'EV014': 'Inventory allocation started',
      'EV015': 'Order validation failed',
      'EV016': 'Order exception raised',
      'EV017': 'Order ready for fulfillment',
      'EV020': 'Inbound shipment announced',
      'EV021': 'Gate logging completed',
      'EV022': 'Dock assignment completed',
      'EV023': 'Unloading started',
      'EV024': 'Visual QC completed',
      'EV025': 'GRN created',
      'EV026': 'Inbound exception detected',
      'EV027': 'Exception logged',
      'EV028': 'Retry or escalation triggered',
      'EV029': 'GRN moved to staging',
      'EV030': 'Putaway task generated',
      'EV031': 'Bin location suggested',
      'EV032': 'Cart scanned for putaway',
      'EV033': 'Destination bin scanned',
      'EV034': 'Putaway exception detected',
      'EV035': 'Putaway exception logged',
      'EV036': 'Putaway completed',
      'EV040': 'Inventory status tagged',
      'EV041': 'Replenishment triggered',
      'EV042': 'Inventory adjustment logged',
      'EV043': 'Cycle count scheduled',
      'EV044': 'Inventory discrepancy detected',
      'EV045': 'Inventory auto-locked',
      'EV046': 'Count verified manually',
      'EV050': 'WMS order received',
      'EV051': 'Pick task generated',
      'EV052': 'Pick path optimized',
      'EV053': 'Picking started',
      'EV054': 'Item picked and scanned',
      'EV055': 'Picking exception detected',
      'EV056': 'Pick exception logged',
      'EV057': 'Pick retry or escalation',
      'EV058': 'Picking completed',
      'EV060': 'Pack cart received',
      'EV061': 'Items verified for packing',
      'EV062': 'Box selected for packing',
      'EV063': 'Weight captured',
      'EV064': 'Label generated',
      'EV065': 'Label or weight issue',
      'EV066': 'Label failed or weight missing',
      'EV067': 'Label print retry',
      'EV068': 'Packing completed',
      'EV070': 'Cart scanned for dispatch',
      'EV071': 'Package staged for dispatch',
      'EV072': 'Manifest prepared',
      'EV073': 'Courier arrived',
      'EV074': 'Package scanned by courier',
      'EV075': 'Manifest confirmed',
      'EV076': 'Dispatch exception detected',
      'EV077': 'Dispatch exception logged',
      'EV078': 'Override confirmed',
      'EV079': 'Order dispatched',
      'EV080': 'Tracking link sent',
      'EV090': 'Manifest received by LMS',
      'EV091': 'Route assigned',
      'EV092': 'Driver assigned',
      'EV093': 'Driver scanned package',
      'EV094': 'Package on route',
      'EV095': 'Out for delivery notification',
      'EV096': 'Package delivered',
      'EV097': 'Status updated',
      'EV098': 'Delivery confirmed',
      'EV099': 'GPS backfill for NAS verification',
      'EV100': 'Return requested',
      'EV101': 'Return created',
      'EV102': 'Return received',
      'EV103': 'QC inspection completed',
      'EV104': 'Return status resolved',
      'EV105': 'Return lifecycle closed',
      'EV110': 'Feedback received',
      'EV111': 'Delivery disputed',
      'EV112': 'Manual confirmation triggered',
      'EV201': 'Source sync exception',
      'EV202': 'Source sync ready for fulfillment',
      'EV203': 'Source sync dispatched',
      'EV204': 'Source sync delivered',
      'EV205': 'Source sync returned'
    };

    return descriptions[eventId] || `${eventType} event for ${data.entityType || 'entity'}`;
  }
}

export const eventEmitter = new SaylogixEventEmitter();

// Event listeners for cross-module communication
eventEmitter.on('order.received', async (data) => {
  // Trigger address verification
  await eventEmitter.emitEvent('EV002', 'verify.start', 'order', data.entityId, data);
});

eventEmitter.on('address.verified', async (data) => {
  // Trigger order validation
  await eventEmitter.emitEvent('EV011', 'order.validation.start', 'order', data.entityId, data);
});

eventEmitter.on('order.validated', async (data) => {
  // Trigger inventory allocation
  await eventEmitter.emitEvent('EV014', 'inventory.allocation.start', 'order', data.entityId, data);
});

eventEmitter.on('inventory.allocated', async (data) => {
  // Trigger pick task generation
  await eventEmitter.emitEvent('EV051', 'pick.task.generated', 'order', data.entityId, data);
});

eventEmitter.on('picking.completed', async (data) => {
  // Trigger packing task
  await eventEmitter.emitEvent('EV060', 'pack.cart.received', 'order', data.entityId, data);
});

eventEmitter.on('packing.completed', async (data) => {
  // Trigger dispatch staging
  await eventEmitter.emitEvent('EV071', 'package.staged', 'order', data.entityId, data);
});

eventEmitter.on('package.dispatched', async (data) => {
  // Trigger tracking link generation
  await eventEmitter.emitEvent('EV080', 'tracking.link.sent', 'order', data.entityId, data);
});
