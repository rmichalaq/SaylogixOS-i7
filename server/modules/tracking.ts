import { storage } from "../storage";
import { eventBus, EventData } from "../services/eventBus";

class TrackingModule {
  private eventBus: any;
  private storage: any;

  init(eventBusInstance: any, storageInstance: any) {
    this.eventBus = eventBusInstance;
    this.storage = storageInstance;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Track all order status changes
    this.eventBus.onOrderEvent(this.handleOrderStatusChange.bind(this));
    
    // Track dispatch events
    this.eventBus.on('EV079', this.handleOrderDispatched.bind(this));
    this.eventBus.on('EV080', this.handleTrackingLinkSent.bind(this));
    
    // Track delivery events
    this.eventBus.on('EV095', this.handleOutForDelivery.bind(this));
    this.eventBus.on('EV096', this.handleDelivered.bind(this));
    this.eventBus.on('EV098', this.handleDeliveryConfirmed.bind(this));
  }

  private async handleOrderStatusChange(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const order = await this.storage.getOrder(orderId);
      
      if (!order) return;

      // Create tracking milestone
      await this.createTrackingMilestone(order, eventData);
      
    } catch (error) {
      console.error("Failed to handle order status change:", error);
    }
  }

  private async handleOrderDispatched(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const order = await this.storage.getOrder(orderId);
      
      if (!order) return;

      // Generate public tracking URL
      const trackingUrl = await this.generateTrackingUrl(order.trackingNumber);
      
      // Store tracking information
      await this.storage.createEvent({
        eventId: 'TRACKING_CREATED',
        eventType: 'tracking.url.generated',
        entityType: 'order',
        entityId: orderId,
        payload: {
          trackingNumber: order.trackingNumber,
          trackingUrl,
          createdAt: new Date()
        },
        source: 'tracking'
      });

      console.log(`Tracking URL generated for order ${order.saylogixNumber}: ${trackingUrl}`);
      
    } catch (error) {
      console.error("Failed to handle order dispatched:", error);
    }
  }

  private async handleTrackingLinkSent(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const { trackingNumber } = eventData.payload;
      
      // Log tracking link sent
      await this.storage.createEvent({
        eventId: 'TRACKING_SENT',
        eventType: 'tracking.link.sent.to.customer',
        entityType: 'order',
        entityId: orderId,
        payload: {
          trackingNumber,
          sentAt: new Date()
        },
        source: 'tracking'
      });
      
    } catch (error) {
      console.error("Failed to handle tracking link sent:", error);
    }
  }

  private async handleOutForDelivery(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      
      await this.updateTrackingStatus(orderId, 'out_for_delivery', {
        location: 'En route to customer',
        estimatedDelivery: this.calculateEstimatedDelivery(),
        updatedAt: new Date()
      });
      
    } catch (error) {
      console.error("Failed to handle out for delivery:", error);
    }
  }

  private async handleDelivered(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const { deliveryLocation, recipientName, deliveredAt } = eventData.payload;
      
      await this.updateTrackingStatus(orderId, 'delivered', {
        deliveredAt,
        deliveryLocation,
        recipientName,
        finalStatus: true
      });
      
    } catch (error) {
      console.error("Failed to handle delivered:", error);
    }
  }

  private async handleDeliveryConfirmed(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      
      await this.updateTrackingStatus(orderId, 'confirmed', {
        confirmationSent: true,
        confirmedAt: new Date()
      });
      
    } catch (error) {
      console.error("Failed to handle delivery confirmed:", error);
    }
  }

  private async createTrackingMilestone(order: any, eventData: EventData): Promise<void> {
    try {
      const milestone = {
        orderId: order.id,
        saylogixNumber: order.saylogixNumber,
        trackingNumber: order.trackingNumber,
        status: order.status,
        eventType: eventData.eventType,
        timestamp: eventData.timestamp || new Date(),
        description: this.getStatusDescription(order.status),
        location: this.getStatusLocation(order.status)
      };

      await this.storage.createEvent({
        eventId: 'TRACKING_MILESTONE',
        eventType: 'tracking.milestone.created',
        entityType: 'tracking',
        entityId: order.id,
        payload: milestone,
        source: 'tracking'
      });
      
    } catch (error) {
      console.error("Failed to create tracking milestone:", error);
    }
  }

  private async updateTrackingStatus(orderId: number, status: string, additionalData: any): Promise<void> {
    try {
      await this.storage.createEvent({
        eventId: 'TRACKING_UPDATE',
        eventType: 'tracking.status.updated',
        entityType: 'tracking',
        entityId: orderId,
        payload: {
          status,
          ...additionalData
        },
        source: 'tracking'
      });
      
    } catch (error) {
      console.error("Failed to update tracking status:", error);
    }
  }

  private async generateTrackingUrl(trackingNumber: string): Promise<string> {
    const baseUrl = process.env.TRACKING_BASE_URL || 'https://track.saylogix.com';
    return `${baseUrl}/${trackingNumber}`;
  }

  private getStatusDescription(status: string): string {
    const descriptions = {
      'fetched': 'Order received and being processed',
      'validated': 'Order validated and confirmed',
      'ready_for_wms': 'Order released to warehouse',
      'picking': 'Items being picked from warehouse',
      'picked': 'All items picked successfully',
      'packing': 'Order being packed for shipment',
      'packed': 'Order packed and ready for dispatch',
      'staged_for_dispatch': 'Package staged for courier pickup',
      'dispatched': 'Package handed over to courier',
      'out_for_delivery': 'Package is out for delivery',
      'delivered': 'Package delivered successfully',
      'exception': 'Delivery exception occurred'
    };
    
    return descriptions[status] || `Status: ${status}`;
  }

  private getStatusLocation(status: string): string {
    const locations = {
      'fetched': 'Order Processing Center',
      'validated': 'Order Processing Center',
      'ready_for_wms': 'Warehouse',
      'picking': 'Warehouse - Picking Area',
      'picked': 'Warehouse - Packing Area',
      'packing': 'Warehouse - Packing Station',
      'packed': 'Warehouse - Dispatch Area',
      'staged_for_dispatch': 'Dispatch Center',
      'dispatched': 'In Transit',
      'out_for_delivery': 'Local Delivery Hub',
      'delivered': 'Customer Location',
      'exception': 'Delivery Location'
    };
    
    return locations[status] || 'Processing';
  }

  private calculateEstimatedDelivery(order?: any): Date {
    // Calculate estimated delivery time based on courier service level and distance
    const now = new Date();
    
    // Get courier service details from order
    const courierTransitTime = order?.courierService?.includes('Express') ? 24 : 48; // hours
    const estimatedHours = courierTransitTime || 48; // Default to 48 hours if no order info
    
    return new Date(now.getTime() + estimatedHours * 60 * 60 * 1000);
  }

  // Public API methods
  async getTrackingInfo(trackingNumber: string): Promise<any> {
    try {
      // Find order by tracking number
      const orders = await this.storage.getRecentOrders(1000);
      const order = orders.find(o => o.trackingNumber === trackingNumber);
      
      if (!order) {
        return {
          found: false,
          error: 'Tracking number not found'
        };
      }

      // Get all tracking events for this order
      const trackingEvents = await this.storage.getEvents('tracking', order.id);
      const orderEvents = await this.storage.getEvents('order', order.id);
      
      // Combine and sort events
      const allEvents = [...trackingEvents, ...orderEvents]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Get current status
      const currentStatus = order.status;
      const isDelivered = currentStatus === 'delivered';
      
      return {
        found: true,
        order: {
          saylogixNumber: order.saylogixNumber,
          trackingNumber: order.trackingNumber,
          customerName: order.customerName,
          shippingAddress: order.shippingAddress,
          orderValue: order.orderValue,
          currency: order.currency
        },
        status: {
          current: currentStatus,
          description: this.getStatusDescription(currentStatus),
          location: this.getStatusLocation(currentStatus),
          isDelivered,
          lastUpdated: order.updatedAt
        },
        timeline: allEvents.map(event => ({
          timestamp: event.timestamp,
          status: event.eventType,
          description: event.payload?.description || this.getStatusDescription(event.eventType),
          location: event.payload?.location || this.getStatusLocation(event.eventType)
        })),
        estimatedDelivery: isDelivered ? null : this.calculateEstimatedDelivery()
      };
      
    } catch (error) {
      console.error("Failed to get tracking info:", error);
      return {
        found: false,
        error: 'Failed to retrieve tracking information'
      };
    }
  }

  async getCustomerOrders(customerPhone: string): Promise<any[]> {
    try {
      const orders = await this.storage.getRecentOrders(1000);
      const customerOrders = orders.filter(order => 
        order.customerPhone && order.customerPhone.includes(customerPhone.replace(/\D/g, '').slice(-9))
      );

      return customerOrders.map(order => ({
        saylogixNumber: order.saylogixNumber,
        trackingNumber: order.trackingNumber,
        status: order.status,
        statusDescription: this.getStatusDescription(order.status),
        orderValue: order.orderValue,
        currency: order.currency,
        createdAt: order.createdAt,
        estimatedDelivery: order.status === 'delivered' ? null : this.calculateEstimatedDelivery()
      }));
      
    } catch (error) {
      console.error("Failed to get customer orders:", error);
      return [];
    }
  }

  async getOrderTimeline(orderId: number): Promise<any[]> {
    try {
      const orderEvents = await this.storage.getEvents('order', orderId);
      const trackingEvents = await this.storage.getEvents('tracking', orderId);
      
      const allEvents = [...orderEvents, ...trackingEvents]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      return allEvents.map(event => ({
        timestamp: event.timestamp,
        eventId: event.eventId,
        eventType: event.eventType,
        description: this.getEventDescription(event),
        source: event.source,
        payload: event.payload
      }));
      
    } catch (error) {
      console.error("Failed to get order timeline:", error);
      return [];
    }
  }

  private getEventDescription(event: any): string {
    const descriptions = {
      'order.fetched': 'Order received from sales channel',
      'verify.start': 'Address verification started',
      'verify.resolved': 'Address verification completed',
      'oms.order.received': 'Order processing started',
      'validate.order': 'Order validation completed',
      'assign.courier': 'Courier assigned',
      'allocate.inventory': 'Inventory allocated',
      'order.ready': 'Order released to warehouse',
      'pick.task.generated': 'Picking task created',
      'pick.completed': 'Picking completed',
      'pack.completed': 'Packing completed',
      'order.dispatched': 'Package dispatched',
      'out.for.delivery': 'Out for delivery',
      'delivered': 'Package delivered',
      'delivery.confirmed': 'Delivery confirmed'
    };
    
    return descriptions[event.eventType] || event.eventType;
  }

  async getTrackingStats(dateRange?: { start: Date; end: Date }): Promise<any> {
    try {
      const orders = await this.storage.getRecentOrders(1000);
      
      const stats = {
        totalOrders: orders.length,
        byStatus: {},
        averageDeliveryTime: 0,
        onTimeDeliveries: 0,
        exceptions: 0
      };

      // Group by status
      stats.byStatus = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      // Calculate delivery metrics
      const deliveredOrders = orders.filter(o => o.status === 'delivered');
      if (deliveredOrders.length > 0) {
        const deliveryTimes = deliveredOrders.map(order => {
          if (order.orderFetched && order.delivered) {
            return new Date(order.delivered).getTime() - new Date(order.orderFetched).getTime();
          }
          return 0;
        }).filter(time => time > 0);

        if (deliveryTimes.length > 0) {
          stats.averageDeliveryTime = deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length;
          stats.averageDeliveryTime = Math.round(stats.averageDeliveryTime / (1000 * 60 * 60)); // Convert to hours
        }
      }

      stats.exceptions = orders.filter(o => o.status === 'exception').length;
      stats.onTimeDeliveries = deliveredOrders.length; // Simplified metric

      return stats;
      
    } catch (error) {
      console.error("Failed to get tracking stats:", error);
      return {};
    }
  }

  // Integration with external tracking APIs
  async syncWithCourierTracking(trackingNumber: string): Promise<void> {
    try {
      // This would integrate with courier APIs to get real-time updates
      console.log(`Syncing tracking data for ${trackingNumber} with courier APIs`);
      
      // Log sync attempt
      await this.storage.createEvent({
        eventId: 'COURIER_SYNC',
        eventType: 'courier.tracking.sync',
        entityType: 'tracking',
        entityId: 0,
        payload: {
          trackingNumber,
          syncedAt: new Date()
        },
        source: 'tracking'
      });
      
    } catch (error) {
      console.error("Failed to sync with courier tracking:", error);
    }
  }

  async bulkUpdateTrackingStatus(updates: Array<{
    trackingNumber: string;
    status: string;
    location?: string;
    timestamp?: Date;
  }>): Promise<void> {
    try {
      for (const update of updates) {
        const orders = await this.storage.getRecentOrders(1000);
        const order = orders.find(o => o.trackingNumber === update.trackingNumber);
        
        if (order) {
          await this.updateTrackingStatus(order.id, update.status, {
            location: update.location,
            timestamp: update.timestamp || new Date()
          });
        }
      }
      
      console.log(`Bulk updated tracking status for ${updates.length} orders`);
      
    } catch (error) {
      console.error("Failed to bulk update tracking status:", error);
    }
  }
}

export const trackingModule = new TrackingModule();
