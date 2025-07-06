import { storage } from "../storage";
import { eventBus, EventData } from "../services/eventBus";
import { nasService } from "../services/nasService";

class NASModule {
  private eventBus: any;
  private storage: any;

  init(eventBusInstance: any, storageInstance: any) {
    this.eventBus = eventBusInstance;
    this.storage = storageInstance;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Address verification events
    this.eventBus.on('EV002', this.handleVerifyStart.bind(this));
    this.eventBus.on('EV003', this.handleNasCodeCheck.bind(this));
    this.eventBus.on('EV004', this.handleDatabaseLookup.bind(this));
    this.eventBus.on('EV006', this.handleNasNotFound.bind(this));
    this.eventBus.on('EV007', this.handleWhatsAppPrompt.bind(this));
    this.eventBus.on('EV008', this.handleAddressConfirmed.bind(this));
    this.eventBus.on('EV099', this.handleGpsBackfill.bind(this));
  }

  private async handleVerifyStart(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const order = await this.storage.getOrder(orderId);
      
      if (!order) return;

      // Update order to indicate verification started
      await this.storage.updateOrder(orderId, {
        verifyStart: new Date()
      });

      console.log(`Address verification started for order ${order.saylogixNumber}`);
      
    } catch (error) {
      console.error("Failed to handle verify start:", error);
    }
  }

  private async handleNasCodeCheck(eventData: EventData) {
    try {
      const { nasCode } = eventData.payload;
      
      // Log NAS code check
      await this.storage.createEvent({
        eventId: 'NAS_CHECK',
        eventType: 'nas.code.checked',
        entityType: 'nas',
        entityId: 0,
        payload: { nasCode },
        source: 'nas'
      });

      console.log(`NAS code ${nasCode} checked`);
      
    } catch (error) {
      console.error("Failed to handle NAS code check:", error);
    }
  }

  private async handleDatabaseLookup(eventData: EventData) {
    try {
      const { nasCode, result } = eventData.payload;
      
      // Cache successful lookups
      if (result.found && result.verified) {
        await this.cacheNasLookup(nasCode, result);
      }

      console.log(`NAS database lookup for ${nasCode}: ${result.found ? 'found' : 'not found'}`);
      
    } catch (error) {
      console.error("Failed to handle database lookup:", error);
    }
  }

  private async handleNasNotFound(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const { nasCode, reason } = eventData.payload;
      
      // Log the failure reason
      await this.storage.createEvent({
        eventId: 'NAS_NOT_FOUND',
        eventType: 'nas.not.found',
        entityType: 'order',
        entityId: orderId,
        payload: { nasCode, reason },
        source: 'nas'
      });

      console.log(`NAS code ${nasCode} not found for order ${orderId}: ${reason}`);
      
    } catch (error) {
      console.error("Failed to handle NAS not found:", error);
    }
  }

  private async handleWhatsAppPrompt(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const { verificationId } = eventData.payload;
      
      // Track WhatsApp verification request
      await this.storage.createEvent({
        eventId: 'WHATSAPP_SENT',
        eventType: 'whatsapp.verification.sent',
        entityType: 'order',
        entityId: orderId,
        payload: { verificationId },
        source: 'nas'
      });

      console.log(`WhatsApp verification sent for order ${orderId}`);
      
    } catch (error) {
      console.error("Failed to handle WhatsApp prompt:", error);
    }
  }

  private async handleAddressConfirmed(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const { response, verificationId } = eventData.payload;
      
      // Log customer confirmation
      await this.storage.createEvent({
        eventId: 'ADDR_CONFIRMED',
        eventType: 'address.confirmed.by.customer',
        entityType: 'order',
        entityId: orderId,
        payload: { response, verificationId },
        source: 'nas'
      });

      console.log(`Address confirmed by customer for order ${orderId}`);
      
    } catch (error) {
      console.error("Failed to handle address confirmed:", error);
    }
  }

  private async handleGpsBackfill(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const order = await this.storage.getOrder(orderId);
      
      if (!order || !order.nasCode) return;

      // Use GPS coordinates from delivery to verify NAS accuracy
      const deliveryAttempts = await this.storage.getEvents('delivery', orderId);
      const successfulDelivery = deliveryAttempts.find(d => 
        d.eventType === 'delivered' && d.payload?.deliveryLocation
      );

      if (successfulDelivery) {
        const deliveryLocation = successfulDelivery.payload.deliveryLocation;
        await this.updateNasAccuracy(order.nasCode, deliveryLocation);
      }
      
    } catch (error) {
      console.error("Failed to handle GPS backfill:", error);
    }
  }

  private async cacheNasLookup(nasCode: string, data: any): Promise<void> {
    try {
      // This would typically insert into nas_lookups table
      await this.storage.createEvent({
        eventId: 'NAS_CACHED',
        eventType: 'nas.lookup.cached',
        entityType: 'nas',
        entityId: 0,
        payload: { nasCode, data },
        source: 'nas'
      });
    } catch (error) {
      console.error("Failed to cache NAS lookup:", error);
    }
  }

  private async updateNasAccuracy(nasCode: string, deliveryLocation: any): Promise<void> {
    try {
      const nasLookup = await this.storage.getNasLookup(nasCode);
      
      if (nasLookup && nasLookup.coordinates) {
        const distance = this.calculateDistance(
          nasLookup.coordinates,
          deliveryLocation
        );

        // If delivery location is more than 1km from NAS coordinates, flag for review
        if (distance > 1000) {
          await this.storage.createEvent({
            eventId: 'NAS_ACCURACY',
            eventType: 'nas.accuracy.review',
            entityType: 'nas',
            entityId: 0,
            payload: { 
              nasCode, 
              expectedLocation: nasLookup.coordinates,
              actualLocation: deliveryLocation,
              distance 
            },
            source: 'nas'
          });
        }
      }
    } catch (error) {
      console.error("Failed to update NAS accuracy:", error);
    }
  }

  private calculateDistance(coord1: any, coord2: any): number {
    // Haversine formula to calculate distance between two GPS coordinates
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.lat * Math.PI/180;
    const φ2 = coord2.lat * Math.PI/180;
    const Δφ = (coord2.lat-coord1.lat) * Math.PI/180;
    const Δλ = (coord2.lng-coord1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Manual verification methods
  async manuallyVerifyAddress(orderId: number, verifiedAddress: any): Promise<void> {
    try {
      const order = await this.storage.getOrder(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Create manual verification record
      const verification = await this.storage.createAddressVerification({
        orderId,
        originalAddress: order.shippingAddress,
        verifiedAddress,
        status: 'verified',
        verificationMethod: 'manual',
        verifiedAt: new Date()
      });

      // Update order
      await this.storage.updateOrder(orderId, {
        nasVerified: true,
        verifyCompleted: new Date()
      });

      // Emit verification resolved event
      await this.eventBus.emitEvent('EV009', {
        entityType: 'order',
        entityId: orderId,
        payload: { 
          verification: {
            method: 'manual',
            verifiedAddress
          }
        },
        source: 'nas'
      });

      console.log(`Manual address verification completed for order ${order.saylogixNumber}`);
      
    } catch (error) {
      console.error("Failed to manually verify address:", error);
      throw error;
    }
  }

  async batchVerifyAddresses(orderIds: number[]): Promise<{verified: number, failed: number}> {
    let verified = 0;
    let failed = 0;

    for (const orderId of orderIds) {
      try {
        await nasService.verifyOrderAddress(orderId);
        verified++;
      } catch (error) {
        console.error(`Failed to verify address for order ${orderId}:`, error);
        failed++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return { verified, failed };
  }

  // Get verification statistics and reports
  async getVerificationStats(dateRange?: {start: Date, end: Date}): Promise<any> {
    const verifications = await this.storage.getEvents('address_verification');
    
    const stats = {
      total: verifications.length,
      verified: 0,
      pending: 0,
      whatsappSent: 0,
      failed: 0,
      manual: 0
    };

    verifications.forEach(v => {
      const payload = v.payload;
      switch (payload?.status) {
        case 'verified':
          stats.verified++;
          if (payload?.verificationMethod === 'manual') {
            stats.manual++;
          }
          break;
        case 'pending':
          stats.pending++;
          break;
        case 'whatsapp_sent':
          stats.whatsappSent++;
          break;
        case 'failed':
          stats.failed++;
          break;
      }
    });

    return {
      ...stats,
      successRate: stats.total > 0 ? (stats.verified / stats.total) * 100 : 0,
      nasSuccessRate: stats.total > 0 ? ((stats.verified - stats.manual) / stats.total) * 100 : 0,
      whatsappResponseRate: stats.whatsappSent > 0 ? (stats.verified / stats.whatsappSent) * 100 : 0
    };
  }

  async getUnverifiedOrders(): Promise<any[]> {
    const orders = await this.storage.getOrdersByStatus('fetched');
    return orders.filter(order => !order.nasVerified);
  }

  async getNasLookupCache(): Promise<any[]> {
    const events = await this.storage.getEvents('nas');
    return events.filter(e => e.eventType === 'nas.lookup.cached');
  }

  // Administrative functions
  async updateNasDatabase(nasCode: string, addressData: any): Promise<void> {
    try {
      await this.storage.createEvent({
        eventId: 'NAS_UPDATE',
        eventType: 'nas.database.updated',
        entityType: 'nas',
        entityId: 0,
        payload: { nasCode, addressData },
        source: 'nas'
      });

      console.log(`NAS database updated for code ${nasCode}`);
    } catch (error) {
      console.error("Failed to update NAS database:", error);
      throw error;
    }
  }

  async flagInaccurateNasCode(nasCode: string, reason: string): Promise<void> {
    try {
      await this.storage.createEvent({
        eventId: 'NAS_FLAG',
        eventType: 'nas.code.flagged',
        entityType: 'nas',
        entityId: 0,
        payload: { nasCode, reason, flaggedAt: new Date() },
        source: 'nas'
      });

      console.log(`NAS code ${nasCode} flagged: ${reason}`);
    } catch (error) {
      console.error("Failed to flag NAS code:", error);
      throw error;
    }
  }
}

export const nasModule = new NASModule();
