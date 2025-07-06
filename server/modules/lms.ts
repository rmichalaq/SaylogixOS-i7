import { storage } from "../storage";
import { eventBus, EventData } from "../services/eventBus";

class LMSModule {
  private eventBus: any;
  private storage: any;

  init(eventBusInstance: any, storageInstance: any) {
    this.eventBus = eventBusInstance;
    this.storage = storageInstance;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Last mile operations
    this.eventBus.on('EV090', this.handleManifestReceived.bind(this));
    this.eventBus.on('EV091', this.handleRouteAssigned.bind(this));
    this.eventBus.on('EV092', this.handleDriverAssigned.bind(this));
    this.eventBus.on('EV093', this.handleDriverScanned.bind(this));
    this.eventBus.on('EV094', this.handleOnRoute.bind(this));
    this.eventBus.on('EV095', this.handleOutForDelivery.bind(this));
    this.eventBus.on('EV096', this.handleDelivered.bind(this));
    this.eventBus.on('EV097', this.handleStatusUpdated.bind(this));
    this.eventBus.on('EV098', this.handleDeliveryConfirmed.bind(this));
    
    // Dispatch trigger
    this.eventBus.on('EV079', this.handleOrderDispatched.bind(this));
  }

  private async handleOrderDispatched(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const { manifestId } = eventData.payload;
      
      // Emit manifest received by LMS
      await this.eventBus.emitEvent('EV090', {
        entityType: 'manifest',
        entityId: manifestId,
        payload: { 
          manifestId,
          receivedAt: new Date()
        },
        source: 'lms'
      });
      
    } catch (error) {
      console.error("Failed to handle order dispatched:", error);
    }
  }

  private async handleManifestReceived(eventData: EventData) {
    try {
      const manifestId = eventData.entityId;
      
      // Auto-assign routes for manifest
      await this.autoAssignRoutes(manifestId);
      
    } catch (error) {
      console.error("Failed to handle manifest received:", error);
    }
  }

  private async autoAssignRoutes(manifestId: number): Promise<void> {
    try {
      // Get orders in manifest
      const orders = await this.getOrdersInManifest(manifestId);
      
      // Group orders by geographic proximity
      const routeGroups = await this.groupOrdersByLocation(orders);
      
      // Create delivery routes
      for (const group of routeGroups) {
        const routeNumber = `RT-${Date.now().toString().slice(-8)}`;
        
        const route = await this.storage.createEvent({
          eventId: 'ROUTE_CREATE',
          eventType: 'delivery.route.created',
          entityType: 'route',
          entityId: 0,
          payload: {
            routeNumber,
            manifestId,
            orders: group.map(o => o.id),
            totalStops: group.length,
            estimatedDistance: this.calculateRouteDistance(group),
            estimatedDuration: this.calculateRouteDuration(group)
          },
          source: 'lms'
        });

        // Emit route assigned event
        await this.eventBus.emitEvent('EV091', {
          entityType: 'route',
          entityId: route.id || 0,
          payload: { 
            routeId: route.id || 0,
            routeNumber,
            manifestId
          },
          source: 'lms'
        });
      }
      
    } catch (error) {
      console.error("Failed to auto-assign routes:", error);
    }
  }

  private async handleRouteAssigned(eventData: EventData) {
    try {
      const routeId = eventData.entityId;
      const { routeNumber } = eventData.payload;
      
      // Auto-assign available driver
      await this.autoAssignDriver(routeId);
      
      console.log(`Route ${routeNumber} assigned`);
      
    } catch (error) {
      console.error("Failed to handle route assigned:", error);
    }
  }

  private async autoAssignDriver(routeId: number): Promise<void> {
    try {
      // Find available driver (would query drivers table)
      const availableDriver = await this.findAvailableDriver();
      
      if (availableDriver) {
        // Assign driver to route
        await this.storage.createEvent({
          eventId: 'DRIVER_ASSIGN',
          eventType: 'driver.assigned.to.route',
          entityType: 'route',
          entityId: routeId,
          payload: {
            driverId: availableDriver.id,
            driverName: availableDriver.name,
            assignedAt: new Date()
          },
          source: 'lms'
        });

        // Emit driver assigned event
        await this.eventBus.emitEvent('EV092', {
          entityType: 'route',
          entityId: routeId,
          payload: { 
            routeId,
            driverId: availableDriver.id,
            driverName: availableDriver.name
          },
          source: 'lms'
        });
      }
      
    } catch (error) {
      console.error("Failed to auto-assign driver:", error);
    }
  }

  private async handleDriverAssigned(eventData: EventData) {
    try {
      const routeId = eventData.entityId;
      const { driverId, driverName } = eventData.payload;
      
      // Notify driver about new route assignment
      await this.notifyDriverOfAssignment(driverId, routeId);
      
      console.log(`Driver ${driverName} assigned to route ${routeId}`);
      
    } catch (error) {
      console.error("Failed to handle driver assigned:", error);
    }
  }

  private async handleDriverScanned(eventData: EventData) {
    try {
      const routeId = eventData.entityId;
      const { driverId } = eventData.payload;
      
      // Start route
      await this.startRoute(routeId);
      
      // Emit on route event
      await this.eventBus.emitEvent('EV094', {
        entityType: 'route',
        entityId: routeId,
        payload: { 
          routeId,
          startedAt: new Date()
        },
        source: 'lms'
      });
      
    } catch (error) {
      console.error("Failed to handle driver scanned:", error);
    }
  }

  private async handleOnRoute(eventData: EventData) {
    try {
      const routeId = eventData.entityId;
      
      // Get orders in route and notify customers
      const orders = await this.getOrdersInRoute(routeId);
      
      for (const order of orders) {
        // Send out for delivery notification
        await this.notifyCustomerOutForDelivery(order);
        
        await this.eventBus.emitEvent('EV095', {
          entityType: 'order',
          entityId: order.id,
          payload: { 
            orderId: order.id,
            routeId,
            notifiedAt: new Date()
          },
          source: 'lms'
        });
      }
      
    } catch (error) {
      console.error("Failed to handle on route:", error);
    }
  }

  private async handleOutForDelivery(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const order = await this.storage.getOrder(orderId);
      
      if (!order) return;

      // Update order status
      await this.storage.updateOrder(orderId, {
        status: 'out_for_delivery'
      });

      console.log(`Order ${order.saylogixNumber} is out for delivery`);
      
    } catch (error) {
      console.error("Failed to handle out for delivery:", error);
    }
  }

  private async handleDelivered(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const { 
        deliveryLocation, 
        recipientName, 
        deliveryProof,
        deliveredAt 
      } = eventData.payload;
      
      // Create delivery attempt record
      await this.storage.createEvent({
        eventId: 'DELIVERY_ATTEMPT',
        eventType: 'delivery.attempt.successful',
        entityType: 'order',
        entityId: orderId,
        payload: {
          status: 'delivered',
          deliveredAt,
          recipientName,
          deliveryLocation,
          deliveryProof
        },
        source: 'lms'
      });

      // Update order status
      await this.storage.updateOrder(orderId, {
        status: 'delivered',
        delivered: new Date(deliveredAt)
      });

      // Emit status updated event
      await this.eventBus.emitEvent('EV097', {
        entityType: 'order',
        entityId: orderId,
        payload: { 
          newStatus: 'delivered',
          updatedAt: new Date()
        },
        source: 'lms'
      });
      
    } catch (error) {
      console.error("Failed to handle delivered:", error);
    }
  }

  private async handleStatusUpdated(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const order = await this.storage.getOrder(orderId);
      
      if (!order) return;

      // Send delivery confirmation to customer
      await this.sendDeliveryConfirmation(order);
      
      // Emit delivery confirmed event
      await this.eventBus.emitEvent('EV098', {
        entityType: 'order',
        entityId: orderId,
        payload: { 
          confirmationSent: true,
          sentAt: new Date()
        },
        source: 'lms'
      });
      
    } catch (error) {
      console.error("Failed to handle status updated:", error);
    }
  }

  private async handleDeliveryConfirmed(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      
      // Trigger GPS backfill verification
      await this.eventBus.emitEvent('EV099', {
        entityType: 'order',
        entityId: orderId,
        payload: { 
          triggerGpsBackfill: true
        },
        source: 'lms'
      });

      console.log(`Delivery confirmation sent for order ${orderId}`);
      
    } catch (error) {
      console.error("Failed to handle delivery confirmed:", error);
    }
  }

  // Helper methods
  private async getOrdersInManifest(manifestId: number): Promise<any[]> {
    // This would query the manifest_items table
    const events = await this.storage.getEvents('manifest', manifestId);
    const createEvent = events.find(e => e.eventType === 'manifest.created');
    
    if (createEvent && createEvent.payload?.orders) {
      const orderIds = createEvent.payload.orders;
      const orders = [];
      
      for (const orderId of orderIds) {
        const order = await this.storage.getOrder(orderId);
        if (order) orders.push(order);
      }
      
      return orders;
    }
    
    return [];
  }

  private async getOrdersInRoute(routeId: number): Promise<any[]> {
    const events = await this.storage.getEvents('route', routeId);
    const createEvent = events.find(e => e.eventType === 'delivery.route.created');
    
    if (createEvent && createEvent.payload?.orders) {
      const orderIds = createEvent.payload.orders;
      const orders = [];
      
      for (const orderId of orderIds) {
        const order = await this.storage.getOrder(orderId);
        if (order) orders.push(order);
      }
      
      return orders;
    }
    
    return [];
  }

  private async groupOrdersByLocation(orders: any[]): Promise<any[][]> {
    // Simple geographic grouping by city
    const groups: Record<string, any[]> = {};
    
    for (const order of orders) {
      const city = order.shippingAddress?.city || 'Unknown';
      if (!groups[city]) {
        groups[city] = [];
      }
      groups[city].push(order);
    }
    
    // Split large groups
    const result: any[][] = [];
    for (const city in groups) {
      const cityOrders = groups[city];
      
      // Max 20 orders per route
      for (let i = 0; i < cityOrders.length; i += 20) {
        result.push(cityOrders.slice(i, i + 20));
      }
    }
    
    return result;
  }

  private calculateRouteDistance(orders: any[]): number {
    // Simplified distance calculation
    return orders.length * 3; // 3km average between stops
  }

  private calculateRouteDuration(orders: any[]): number {
    // Simplified duration calculation (in minutes)
    return orders.length * 15 + 30; // 15 min per stop + 30 min travel
  }

  private async findAvailableDriver(): Promise<any> {
    // This would query a drivers table
    // For now, return a mock driver
    return {
      id: 1,
      name: 'Ahmed Al-Saudi',
      phone: '+966501234567',
      vehicleNumber: 'ABC-123',
      status: 'available'
    };
  }

  private async notifyDriverOfAssignment(driverId: number, routeId: number): Promise<void> {
    console.log(`Notifying driver ${driverId} of route ${routeId} assignment`);
    
    // This would send push notification to driver mobile app
    await this.storage.createEvent({
      eventId: 'DRIVER_NOTIFIED',
      eventType: 'driver.assignment.notified',
      entityType: 'route',
      entityId: routeId,
      payload: {
        driverId,
        notifiedAt: new Date()
      },
      source: 'lms'
    });
  }

  private async startRoute(routeId: number): Promise<void> {
    // Update route status
    await this.storage.createEvent({
      eventId: 'ROUTE_STARTED',
      eventType: 'delivery.route.started',
      entityType: 'route',
      entityId: routeId,
      payload: {
        startedAt: new Date()
      },
      source: 'lms'
    });
  }

  private async notifyCustomerOutForDelivery(order: any): Promise<void> {
    try {
      console.log(`Notifying customer ${order.customerPhone} that order ${order.saylogixNumber} is out for delivery`);
      
      // This would integrate with WhatsApp service
      const { whatsappService } = await import('../services/whatsappService');
      await whatsappService.sendOrderUpdateMessage(
        order.customerPhone,
        order.saylogixNumber,
        'out_for_delivery',
        order.trackingNumber
      );
      
    } catch (error) {
      console.error("Failed to notify customer out for delivery:", error);
    }
  }

  private async sendDeliveryConfirmation(order: any): Promise<void> {
    try {
      console.log(`Sending delivery confirmation to ${order.customerPhone} for order ${order.saylogixNumber}`);
      
      // This would integrate with WhatsApp service
      const { whatsappService } = await import('../services/whatsappService');
      await whatsappService.sendDeliveryConfirmation(
        order.customerPhone,
        order.saylogixNumber
      );
      
    } catch (error) {
      console.error("Failed to send delivery confirmation:", error);
    }
  }

  // Public API methods
  async recordDeliveryAttempt(orderId: number, attempt: {
    status: 'delivered' | 'failed' | 'rescheduled';
    recipientName?: string;
    failureReason?: string;
    deliveryLocation?: any;
    photos?: string[];
    nextAttemptDate?: Date;
  }): Promise<void> {
    try {
      if (attempt.status === 'delivered') {
        await this.eventBus.emitEvent('EV096', {
          entityType: 'order',
          entityId: orderId,
          payload: {
            deliveryLocation: attempt.deliveryLocation,
            recipientName: attempt.recipientName,
            deliveryProof: attempt.photos,
            deliveredAt: new Date()
          },
          source: 'lms'
        });
      } else {
        // Failed delivery
        await this.storage.createEvent({
          eventId: 'DELIVERY_FAILED',
          eventType: 'delivery.attempt.failed',
          entityType: 'order',
          entityId: orderId,
          payload: attempt,
          source: 'lms'
        });
      }
    } catch (error) {
      console.error("Failed to record delivery attempt:", error);
      throw error;
    }
  }

  async updateDriverLocation(driverId: number, location: { lat: number; lng: number }): Promise<void> {
    try {
      await this.storage.createEvent({
        eventId: 'DRIVER_LOCATION',
        eventType: 'driver.location.updated',
        entityType: 'driver',
        entityId: driverId,
        payload: {
          location,
          timestamp: new Date()
        },
        source: 'lms'
      });
    } catch (error) {
      console.error("Failed to update driver location:", error);
      throw error;
    }
  }

  async manuallyAssignRoute(manifestId: number, orderIds: number[], driverId?: number): Promise<number> {
    try {
      const routeNumber = `RT-MAN-${Date.now().toString().slice(-8)}`;
      
      const route = await this.storage.createEvent({
        eventId: 'ROUTE_MANUAL',
        eventType: 'delivery.route.created',
        entityType: 'route',
        entityId: 0,
        payload: {
          routeNumber,
          manifestId,
          orders: orderIds,
          totalStops: orderIds.length,
          manuallyCreated: true
        },
        source: 'lms'
      });

      if (driverId) {
        await this.autoAssignDriver(route.id || 0);
      }

      return route.id || 0;
    } catch (error) {
      console.error("Failed to manually assign route:", error);
      throw error;
    }
  }

  async getRouteOptimization(orderIds: number[]): Promise<any> {
    try {
      const orders = [];
      
      for (const orderId of orderIds) {
        const order = await this.storage.getOrder(orderId);
        if (order) orders.push(order);
      }

      // Simple optimization by distance
      const optimizedRoute = this.optimizeRouteByDistance(orders);
      
      return {
        originalOrder: orders.map(o => o.id),
        optimizedOrder: optimizedRoute.map(o => o.id),
        estimatedDistance: this.calculateRouteDistance(optimizedRoute),
        estimatedDuration: this.calculateRouteDuration(optimizedRoute),
        timeSaved: this.calculateTimeSaved(orders, optimizedRoute)
      };
    } catch (error) {
      console.error("Failed to get route optimization:", error);
      throw error;
    }
  }

  private optimizeRouteByDistance(orders: any[]): any[] {
    // Simple nearest neighbor algorithm
    if (orders.length <= 1) return orders;
    
    const optimized = [orders[0]];
    const remaining = orders.slice(1);
    
    while (remaining.length > 0) {
      const current = optimized[optimized.length - 1];
      let nearest = remaining[0];
      let nearestIndex = 0;
      let shortestDistance = this.calculateDistanceBetweenOrders(current, nearest);
      
      for (let i = 1; i < remaining.length; i++) {
        const distance = this.calculateDistanceBetweenOrders(current, remaining[i]);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearest = remaining[i];
          nearestIndex = i;
        }
      }
      
      optimized.push(nearest);
      remaining.splice(nearestIndex, 1);
    }
    
    return optimized;
  }

  private calculateDistanceBetweenOrders(order1: any, order2: any): number {
    // Simplified distance calculation
    // In reality, this would use GPS coordinates and routing APIs
    const addr1 = order1.shippingAddress;
    const addr2 = order2.shippingAddress;
    
    if (addr1.city === addr2.city) {
      return Math.random() * 5; // 0-5km within same city
    } else {
      return Math.random() * 50 + 20; // 20-70km between cities
    }
  }

  private calculateTimeSaved(original: any[], optimized: any[]): number {
    const originalDistance = this.calculateTotalRouteDistance(original);
    const optimizedDistance = this.calculateTotalRouteDistance(optimized);
    
    return Math.max(0, (originalDistance - optimizedDistance) * 2); // 2 minutes per km saved
  }

  private calculateTotalRouteDistance(orders: any[]): number {
    if (orders.length <= 1) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < orders.length - 1; i++) {
      totalDistance += this.calculateDistanceBetweenOrders(orders[i], orders[i + 1]);
    }
    
    return totalDistance;
  }

  async getDeliveryStats(dateRange?: { start: Date; end: Date }): Promise<any> {
    const events = await this.storage.getEvents('order');
    const deliveryEvents = events.filter(e => e.eventType === 'delivery.attempt.successful');
    
    return {
      totalDeliveries: deliveryEvents.length,
      successfulDeliveries: deliveryEvents.filter(e => e.payload?.status === 'delivered').length,
      failedDeliveries: deliveryEvents.filter(e => e.payload?.status === 'failed').length,
      averageDeliveryTime: this.calculateAverageDeliveryTime(deliveryEvents),
      deliverySuccessRate: deliveryEvents.length > 0 ? 
        (deliveryEvents.filter(e => e.payload?.status === 'delivered').length / deliveryEvents.length) * 100 : 0
    };
  }

  private calculateAverageDeliveryTime(deliveryEvents: any[]): number {
    // Calculate average time from dispatch to delivery
    const deliveryTimes = deliveryEvents
      .filter(e => e.payload?.status === 'delivered')
      .map(e => {
        // This would calculate actual time difference
        return Math.random() * 24 + 12; // 12-36 hours mock
      });
    
    return deliveryTimes.length > 0 ? 
      deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length : 0;
  }
}

export const lmsModule = new LMSModule();
