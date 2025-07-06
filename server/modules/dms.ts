import { storage } from "../storage";
import { eventBus, EventData } from "../services/eventBus";

class DMSModule {
  private eventBus: any;
  private storage: any;

  init(eventBusInstance: any, storageInstance: any) {
    this.eventBus = eventBusInstance;
    this.storage = storageInstance;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Dispatch operations
    this.eventBus.on('EV070', this.handleCartScanned.bind(this));
    this.eventBus.on('EV071', this.handlePackageStaged.bind(this));
    this.eventBus.on('EV072', this.handleManifestPrepared.bind(this));
    this.eventBus.on('EV073', this.handleCourierArrived.bind(this));
    this.eventBus.on('EV074', this.handlePackageScanned.bind(this));
    this.eventBus.on('EV075', this.handleManifestConfirmed.bind(this));
    this.eventBus.on('EV079', this.handleOrderDispatched.bind(this));
    
    // Exception handling
    this.eventBus.on('EV076', this.handleDispatchException.bind(this));
    this.eventBus.on('EV078', this.handleOverrideConfirmed.bind(this));
    
    // Packing completion trigger
    this.eventBus.on('EV068', this.handlePackCompleted.bind(this));
  }

  private async handlePackCompleted(eventData: EventData) {
    try {
      const packingTaskId = eventData.entityId;
      const packingTasks = await this.storage.getPackingTasks();
      const packingTask = packingTasks.find(t => t.id === packingTaskId);
      
      if (!packingTask) return;

      // Stage package for dispatch
      await this.stagePackageForDispatch(packingTask.orderId);
      
    } catch (error) {
      console.error("Failed to handle pack completed:", error);
    }
  }

  private async stagePackageForDispatch(orderId: number): Promise<void> {
    try {
      const order = await this.storage.getOrder(orderId);
      if (!order) return;

      // Emit cart scanned event
      await this.eventBus.emitEvent('EV070', {
        entityType: 'order',
        entityId: orderId,
        payload: { 
          order,
          scanTime: new Date(),
          stagingArea: this.getStagingArea(order.courierPartnerId)
        },
        source: 'dms'
      });
      
    } catch (error) {
      console.error("Failed to stage package for dispatch:", error);
    }
  }

  private async handleCartScanned(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const { stagingArea } = eventData.payload;
      
      // Update order status
      await this.storage.updateOrder(orderId, {
        status: 'staged_for_dispatch'
      });

      // Emit package staged event
      await this.eventBus.emitEvent('EV071', {
        entityType: 'order',
        entityId: orderId,
        payload: { 
          stagingArea,
          stagedAt: new Date()
        },
        source: 'dms'
      });

      // Check if we can create/update manifest
      await this.checkManifestReadiness(orderId);
      
    } catch (error) {
      console.error("Failed to handle cart scanned:", error);
    }
  }

  private async handlePackageStaged(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      
      console.log(`Package staged for order ${orderId}`);
      
      // Auto-generate manifest if enough packages are staged
      await this.autoGenerateManifest(orderId);
      
    } catch (error) {
      console.error("Failed to handle package staged:", error);
    }
  }

  private async handleManifestPrepared(eventData: EventData) {
    try {
      const { manifestId, courierPartnerId } = eventData.payload;
      
      // Notify courier for pickup
      await this.notifyCourierForPickup(manifestId, courierPartnerId);
      
    } catch (error) {
      console.error("Failed to handle manifest prepared:", error);
    }
  }

  private async handleCourierArrived(eventData: EventData) {
    try {
      const { manifestId, driverInfo } = eventData.payload;
      
      // Update manifest with driver information
      await this.storage.createEvent({
        eventId: 'COURIER_ARRIVED',
        eventType: 'courier.arrival.logged',
        entityType: 'manifest',
        entityId: manifestId,
        payload: { 
          driverInfo,
          arrivalTime: new Date()
        },
        source: 'dms'
      });

      // Start package scanning process
      await this.initiatePackageScanning(manifestId);
      
    } catch (error) {
      console.error("Failed to handle courier arrived:", error);
    }
  }

  private async handlePackageScanned(eventData: EventData) {
    try {
      const { manifestId, orderId, trackingNumber } = eventData.payload;
      
      // Update manifest item as scanned
      await this.storage.createEvent({
        eventId: 'PACKAGE_SCANNED',
        eventType: 'package.scanned.for.pickup',
        entityType: 'manifest',
        entityId: manifestId,
        payload: { 
          orderId,
          trackingNumber,
          scannedAt: new Date()
        },
        source: 'dms'
      });

      // Check if all packages in manifest are scanned
      await this.checkManifestCompletion(manifestId);
      
    } catch (error) {
      console.error("Failed to handle package scanned:", error);
    }
  }

  private async handleManifestConfirmed(eventData: EventData) {
    try {
      const { manifestId } = eventData.payload;
      
      // Update manifest status
      await this.storage.createEvent({
        eventId: 'MANIFEST_CONFIRMED',
        eventType: 'manifest.confirmed.by.courier',
        entityType: 'manifest',
        entityId: manifestId,
        payload: { 
          confirmedAt: new Date()
        },
        source: 'dms'
      });

      // Dispatch all orders in the manifest
      await this.dispatchOrdersInManifest(manifestId);
      
    } catch (error) {
      console.error("Failed to handle manifest confirmed:", error);
    }
  }

  private async handleOrderDispatched(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const order = await this.storage.getOrder(orderId);
      
      if (!order) return;

      // Send tracking link to customer
      await this.sendTrackingLinkToCustomer(order);
      
      // Emit tracking link sent event
      await this.eventBus.emitEvent('EV080', {
        entityType: 'order',
        entityId: orderId,
        payload: { 
          trackingNumber: order.trackingNumber,
          sentAt: new Date()
        },
        source: 'dms'
      });
      
    } catch (error) {
      console.error("Failed to handle order dispatched:", error);
    }
  }

  private async handleDispatchException(eventData: EventData) {
    try {
      const { orderId, exceptionType, reason } = eventData.payload;
      
      // Log exception
      await this.storage.createEvent({
        eventId: 'DISPATCH_EXCEPTION',
        eventType: 'dispatch.exception.logged',
        entityType: 'order',
        entityId: orderId,
        payload: { 
          exceptionType,
          reason,
          loggedAt: new Date()
        },
        source: 'dms'
      });

      // Notify supervisor
      await this.notifySupervisorOfException(orderId, exceptionType, reason);
      
    } catch (error) {
      console.error("Failed to handle dispatch exception:", error);
    }
  }

  private async handleOverrideConfirmed(eventData: EventData) {
    try {
      const { orderId, supervisorId, reason } = eventData.payload;
      
      // Log override
      await this.storage.createEvent({
        eventId: 'OVERRIDE_CONFIRMED',
        eventType: 'supervisor.override.confirmed',
        entityType: 'order',
        entityId: orderId,
        payload: { 
          supervisorId,
          reason,
          confirmedAt: new Date()
        },
        source: 'dms'
      });

      // Continue with dispatch process
      await this.continueDispatchProcess(orderId);
      
    } catch (error) {
      console.error("Failed to handle override confirmed:", error);
    }
  }

  // Core dispatch methods
  private async checkManifestReadiness(orderId: number): Promise<void> {
    try {
      const order = await this.storage.getOrder(orderId);
      if (!order || !order.courierPartnerId) return;

      // Find existing draft manifest for this courier
      const manifests = await this.storage.createEvent({
        eventId: 'MANIFEST_CHECK',
        eventType: 'manifest.readiness.check',
        entityType: 'manifest',
        entityId: 0,
        payload: { 
          courierPartnerId: order.courierPartnerId,
          orderId
        },
        source: 'dms'
      });
      
    } catch (error) {
      console.error("Failed to check manifest readiness:", error);
    }
  }

  private async autoGenerateManifest(orderId: number): Promise<void> {
    try {
      const order = await this.storage.getOrder(orderId);
      if (!order || !order.courierPartnerId) return;

      // Get all staged orders for this courier
      const stagedOrders = await this.getStagedOrdersForCourier(order.courierPartnerId);
      
      // Generate manifest if we have enough packages or it's end of day
      if (stagedOrders.length >= 10 || this.isEndOfDay()) {
        await this.generateManifest(order.courierPartnerId, stagedOrders);
      }
      
    } catch (error) {
      console.error("Failed to auto-generate manifest:", error);
    }
  }

  private async generateManifest(courierPartnerId: number, orders: any[]): Promise<number> {
    try {
      const manifestNumber = `MAN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-3)}`;
      
      // Create manifest
      const manifest = await this.storage.createEvent({
        eventId: 'MANIFEST_CREATE',
        eventType: 'manifest.created',
        entityType: 'manifest',
        entityId: 0,
        payload: {
          manifestNumber,
          courierPartnerId,
          totalPackages: orders.length,
          orders: orders.map(o => o.id)
        },
        source: 'dms'
      });

      // Emit manifest prepared event
      await this.eventBus.emitEvent('EV072', {
        entityType: 'manifest',
        entityId: manifest.id || 0,
        payload: { 
          manifestId: manifest.id || 0,
          courierPartnerId,
          manifestNumber
        },
        source: 'dms'
      });

      console.log(`Manifest ${manifestNumber} generated with ${orders.length} packages`);
      
      return manifest.id || 0;
      
    } catch (error) {
      console.error("Failed to generate manifest:", error);
      throw error;
    }
  }

  private async notifyCourierForPickup(manifestId: number, courierPartnerId: number): Promise<void> {
    try {
      // This would integrate with courier API to notify for pickup
      console.log(`Notifying courier ${courierPartnerId} for manifest ${manifestId} pickup`);
      
      // Log notification
      await this.storage.createEvent({
        eventId: 'COURIER_NOTIFIED',
        eventType: 'courier.pickup.notified',
        entityType: 'manifest',
        entityId: manifestId,
        payload: { 
          courierPartnerId,
          notifiedAt: new Date()
        },
        source: 'dms'
      });
      
    } catch (error) {
      console.error("Failed to notify courier for pickup:", error);
    }
  }

  private async initiatePackageScanning(manifestId: number): Promise<void> {
    try {
      // Get all packages in the manifest
      const manifestOrders = await this.getOrdersInManifest(manifestId);
      
      console.log(`Initiating scanning for ${manifestOrders.length} packages in manifest ${manifestId}`);
      
      // This would trigger the UI to show scanning interface
      await this.storage.createEvent({
        eventId: 'SCANNING_INITIATED',
        eventType: 'package.scanning.initiated',
        entityType: 'manifest',
        entityId: manifestId,
        payload: { 
          totalPackages: manifestOrders.length,
          initiatedAt: new Date()
        },
        source: 'dms'
      });
      
    } catch (error) {
      console.error("Failed to initiate package scanning:", error);
    }
  }

  private async checkManifestCompletion(manifestId: number): Promise<void> {
    try {
      const manifestOrders = await this.getOrdersInManifest(manifestId);
      const scannedOrders = await this.getScannedOrdersInManifest(manifestId);
      
      if (scannedOrders.length === manifestOrders.length) {
        // All packages scanned, ready for confirmation
        await this.eventBus.emitEvent('EV075', {
          entityType: 'manifest',
          entityId: manifestId,
          payload: { 
            manifestId,
            allPackagesScanned: true
          },
          source: 'dms'
        });
      }
      
    } catch (error) {
      console.error("Failed to check manifest completion:", error);
    }
  }

  private async dispatchOrdersInManifest(manifestId: number): Promise<void> {
    try {
      const manifestOrders = await this.getOrdersInManifest(manifestId);
      
      for (const order of manifestOrders) {
        await this.storage.updateOrder(order.id, {
          status: 'dispatched',
          dispatched: new Date()
        });

        await this.eventBus.emitEvent('EV079', {
          entityType: 'order',
          entityId: order.id,
          payload: { 
            manifestId,
            dispatchedAt: new Date()
          },
          source: 'dms'
        });
      }

      console.log(`Dispatched ${manifestOrders.length} orders from manifest ${manifestId}`);
      
    } catch (error) {
      console.error("Failed to dispatch orders in manifest:", error);
    }
  }

  private async sendTrackingLinkToCustomer(order: any): Promise<void> {
    try {
      // This would integrate with WhatsApp/SMS service
      const trackingUrl = `https://track.saylogix.com/${order.trackingNumber}`;
      
      console.log(`Sending tracking link to ${order.customerPhone}: ${trackingUrl}`);
      
      // Log tracking link sent
      await this.storage.createEvent({
        eventId: 'TRACKING_SENT',
        eventType: 'tracking.link.sent',
        entityType: 'order',
        entityId: order.id,
        payload: { 
          trackingUrl,
          sentTo: order.customerPhone,
          sentAt: new Date()
        },
        source: 'dms'
      });
      
    } catch (error) {
      console.error("Failed to send tracking link:", error);
    }
  }

  // Helper methods
  private getStagingArea(courierPartnerId: number): string {
    // Map courier to staging area
    const stagingAreas = {
      1: 'STAGE-A', // Aramex
      2: 'STAGE-B', // SMSA
      3: 'STAGE-C'  // DHL
    };
    
    return stagingAreas[courierPartnerId] || 'STAGE-DEFAULT';
  }

  private async getStagedOrdersForCourier(courierPartnerId: number): Promise<any[]> {
    const orders = await this.storage.getOrdersByStatus('staged_for_dispatch');
    return orders.filter(order => order.courierPartnerId === courierPartnerId);
  }

  private isEndOfDay(): boolean {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(17, 0, 0, 0); // 5 PM
    
    return now >= endOfDay;
  }

  private async getOrdersInManifest(manifestId: number): Promise<any[]> {
    // This would query manifest_items table
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

  private async getScannedOrdersInManifest(manifestId: number): Promise<any[]> {
    const events = await this.storage.getEvents('manifest', manifestId);
    return events.filter(e => e.eventType === 'package.scanned.for.pickup');
  }

  private async notifySupervisorOfException(orderId: number, exceptionType: string, reason: string): Promise<void> {
    console.log(`SUPERVISOR ALERT: Order ${orderId} has ${exceptionType} exception: ${reason}`);
    
    // This would send notification to supervisor dashboard/mobile app
    await this.storage.createEvent({
      eventId: 'SUPERVISOR_NOTIFIED',
      eventType: 'supervisor.exception.notified',
      entityType: 'order',
      entityId: orderId,
      payload: { 
        exceptionType,
        reason,
        notifiedAt: new Date()
      },
      source: 'dms'
    });
  }

  private async continueDispatchProcess(orderId: number): Promise<void> {
    // Continue with dispatch after supervisor override
    await this.stagePackageForDispatch(orderId);
  }

  // Public API methods
  async manuallyCreateManifest(courierPartnerId: number, orderIds: number[]): Promise<number> {
    const orders = [];
    
    for (const orderId of orderIds) {
      const order = await this.storage.getOrder(orderId);
      if (order && order.status === 'staged_for_dispatch') {
        orders.push(order);
      }
    }
    
    return await this.generateManifest(courierPartnerId, orders);
  }

  async scanPackageForDispatch(manifestId: number, orderId: number, trackingNumber: string): Promise<void> {
    await this.eventBus.emitEvent('EV074', {
      entityType: 'manifest',
      entityId: manifestId,
      payload: { 
        manifestId,
        orderId,
        trackingNumber
      },
      source: 'dms'
    });
  }

  async confirmManifestWithCourier(manifestId: number, driverInfo: any): Promise<void> {
    await this.eventBus.emitEvent('EV073', {
      entityType: 'manifest',
      entityId: manifestId,
      payload: { 
        manifestId,
        driverInfo
      },
      source: 'dms'
    });
  }

  async reportDispatchException(orderId: number, exceptionType: string, reason: string): Promise<void> {
    await this.eventBus.emitEvent('EV076', {
      entityType: 'order',
      entityId: orderId,
      payload: { 
        orderId,
        exceptionType,
        reason
      },
      source: 'dms'
    });
  }

  async approveDispatchOverride(orderId: number, supervisorId: number, reason: string): Promise<void> {
    await this.eventBus.emitEvent('EV078', {
      entityType: 'order',
      entityId: orderId,
      payload: { 
        orderId,
        supervisorId,
        reason
      },
      source: 'dms'
    });
  }
}

export const dmsModule = new DMSModule();
