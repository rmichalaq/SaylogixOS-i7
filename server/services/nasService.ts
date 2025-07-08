import { storage } from "../storage";
import { eventBus } from "./eventBus";
import { whatsappService } from "./whatsappService";
import { splService } from "./splService";
import fetch from "node-fetch";

interface NasVerificationResult {
  found: boolean;
  verified: boolean;
  address?: any;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

class NasService {
  private apiKey: string;
  private apiEndpoint: string;

  constructor() {
    this.apiKey = process.env.NAS_API_KEY || "";
    this.apiEndpoint = process.env.NAS_API_ENDPOINT || "https://api.nas.gov.sa/v1";
    
    if (!this.apiKey) {
      console.warn("NAS API credentials not configured. Please set NAS_API_KEY environment variable.");
    }
  }

  async verifyNasCode(nasCode: string): Promise<NasVerificationResult> {
    try {
      // Check local cache first
      const cachedLookup = await storage.getNasLookup(nasCode);
      if (cachedLookup) {
        return {
          found: true,
          verified: cachedLookup.verified ?? false,
          address: {
            address: cachedLookup.address,
            city: cachedLookup.city,
            district: cachedLookup.district,
            postalCode: cachedLookup.postalCode
          },
          coordinates: cachedLookup.coordinates as any
        };
      }

      // Try SPL API first (more reliable for Saudi addresses)
      try {
        const splResult = await splService.fetchAddressFromSPL(nasCode);
        
        // Cache the SPL result
        await this.cacheAddressLookup(nasCode, {
          address: splResult.fullAddress,
          city: splResult.fullAddress.split(', ')[3] || '',
          district: splResult.fullAddress.split(', ')[2] || '',
          postalCode: splResult.postalCode,
          coordinates: splResult.coordinates,
          verified: true,
          source: 'spl'
        });
        
        return {
          found: true,
          verified: true,
          address: {
            address: splResult.fullAddress,
            city: splResult.fullAddress.split(', ')[3] || '',
            district: splResult.fullAddress.split(', ')[2] || '',
            postalCode: splResult.postalCode
          },
          coordinates: splResult.coordinates.lat && splResult.coordinates.lng ? 
            { lat: splResult.coordinates.lat, lng: splResult.coordinates.lng } : undefined
        };
      } catch (splError) {
        console.warn("SPL API failed, falling back to NAS API:", splError);
      }

      // Fallback to NAS API if SPL fails
      if (!this.apiKey) {
        throw new Error("Both SPL and NAS API credentials not configured");
      }

      // Call NAS API
      const response = await fetch(`${this.apiEndpoint}/verify/${nasCode}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { found: false, verified: false };
        }
        throw new Error(`NAS API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the NAS result
      if (data.found) {
        await this.cacheAddressLookup(nasCode, {
          ...data.address,
          verified: data.verified,
          source: 'nas'
        });
      }

      return {
        found: data.found,
        verified: data.verified,
        address: data.address,
        coordinates: data.coordinates
      };
    } catch (error) {
      console.error("NAS verification failed:", error);
      
      // Return fallback result
      return { found: false, verified: false };
    }
  }

  private async cacheAddressLookup(nasCode: string, data: any): Promise<void> {
    try {
      // Store in NAS lookup cache for future use
      await storage.createEvent({
        eventId: 'CACHE',
        eventType: 'address.lookup.cached',
        entityType: 'nas',
        entityId: 0,
        eventData: { nasCode, data },
        source: data.source || 'nas'
      });
    } catch (error) {
      console.error("Failed to cache address lookup:", error);
    }
  }

  async verifyOrderAddress(orderId: number): Promise<void> {
    try {
      const order = await storage.getOrder(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Start verification process
      await eventBus.emitEvent('EV002', {
        entityType: 'order',
        entityId: orderId,
        payload: { order },
        source: 'nas'
      });

      // Create address verification record
      const verification = await storage.createAddressVerification({
        orderId,
        originalAddress: order.shippingAddress,
        status: 'pending',
        verificationMethod: 'spl_nas_lookup'
      });

      // Extract NAS code from address (implement your logic here)
      const nasCode = this.extractNasCode(order.shippingAddress as any);
      
      if (!nasCode) {
        // No NAS code found, require WhatsApp verification
        await this.requestWhatsAppVerification(orderId, verification.id);
        return;
      }

      // Emit NAS code check event
      await eventBus.emitEvent('EV003', {
        entityType: 'order',
        entityId: orderId,
        payload: { nasCode },
        source: 'nas'
      });

      // Verify NAS code
      const result = await this.verifyNasCode(nasCode);

      // Emit database lookup event
      await eventBus.emitEvent('EV004', {
        entityType: 'order',
        entityId: orderId,
        payload: { nasCode, result },
        source: 'nas'
      });

      if (result.found && result.verified) {
        // NAS verification successful
        await this.completeVerification(orderId, verification.id, {
          nasCode,
          verifiedAddress: result.address,
          coordinates: result.coordinates
        });
      } else {
        // NAS not found, request WhatsApp verification
        await eventBus.emitEvent('EV006', {
          entityType: 'order',
          entityId: orderId,
          payload: { nasCode, reason: 'nas_not_found' },
          source: 'nas'
        });

        await this.requestWhatsAppVerification(orderId, verification.id);
      }
    } catch (error) {
      console.error("Address verification failed:", error);
      
      // Log exception event
      await eventBus.emitEvent('EV016', {
        entityType: 'order',
        entityId: orderId,
        payload: { error: error.message, type: 'address_verification' },
        source: 'nas'
      });
    }
  }

  private extractNasCode(address: any): string | null {
    // Implement logic to extract NAS code from address
    // This could be from postal code, address line, or custom field
    
    if (address.postalCode && address.postalCode.match(/^\d{5}$/)) {
      return address.postalCode;
    }
    
    // Check for NAS code in address lines
    const addressText = `${address.address1} ${address.address2 || ''}`.toLowerCase();
    const nasMatch = addressText.match(/nas[:\s]*(\d{5})/);
    if (nasMatch) {
      return nasMatch[1];
    }
    
    return null;
  }

  private async requestWhatsAppVerification(orderId: number, verificationId: number): Promise<void> {
    try {
      const order = await storage.getOrder(orderId);
      if (!order) return;

      // Emit WhatsApp prompt event
      await eventBus.emitEvent('EV007', {
        entityType: 'order',
        entityId: orderId,
        eventData: { verificationId },
        source: 'nas'
      });

      // Send WhatsApp message
      const messageId = await whatsappService.sendAddressVerificationMessage(
        order.customerPhone || '',
        order.saylogixNumber,
        order.shippingAddress as any
      );

      // Update verification record
      await storage.updateAddressVerification(verificationId, {
        status: 'whatsapp_sent',
        whatsappMessageId: messageId
      });

      console.log(`WhatsApp verification sent for order ${order.saylogixNumber}`);
    } catch (error) {
      console.error("Failed to request WhatsApp verification:", error);
    }
  }

  async handleWhatsAppResponse(orderId: number, response: string): Promise<void> {
    try {
      const order = await storage.getOrder(orderId);
      if (!order) return;

      // Find pending verification
      const verifications = await storage.getEvents('address_verification', orderId);
      const pendingVerification = verifications.find(v => 
        (v.payload as any)?.status === 'whatsapp_sent'
      );

      if (!pendingVerification) {
        console.warn(`No pending verification found for order ${orderId}`);
        return;
      }

      // Emit address confirmed event
      await eventBus.emitEvent('EV008', {
        entityType: 'order',
        entityId: orderId,
        payload: { response, verificationId: pendingVerification.id },
        source: 'nas'
      });

      // Parse and validate address response
      const parsedAddress = this.parseAddressResponse(response);
      
      // Complete verification
      await this.completeVerification(orderId, pendingVerification.id, {
        verifiedAddress: parsedAddress,
        customerResponse: response
      });

      console.log(`WhatsApp address verification completed for order ${order.saylogixNumber}`);
    } catch (error) {
      console.error("Failed to handle WhatsApp response:", error);
    }
  }

  private parseAddressResponse(response: string): any {
    // Implement logic to parse customer address response
    // This is a simplified version
    return {
      customerConfirmed: true,
      originalResponse: response,
      parsedAt: new Date()
    };
  }

  private async completeVerification(orderId: number, verificationId: number, data: any): Promise<void> {
    try {
      // Update order with verified address
      await storage.updateOrder(orderId, {
        nasCode: data.nasCode,
        nasVerified: true,
        verifyCompleted: new Date()
      });

      // Update verification record
      await storage.updateAddressVerification(verificationId, {
        status: 'verified',
        nasCode: data.nasCode,
        verifiedAddress: data.verifiedAddress,
        verifiedAt: new Date()
      });

      // Emit verification resolved event
      await eventBus.emitEvent('EV009', {
        entityType: 'order',
        entityId: orderId,
        payload: { verification: data },
        source: 'nas'
      });

      console.log(`Address verification completed for order ${orderId}`);
    } catch (error) {
      console.error("Failed to complete verification:", error);
    }
  }

  // Batch verification for multiple orders
  async batchVerifyAddresses(orderIds: number[]): Promise<void> {
    console.log(`Starting batch address verification for ${orderIds.length} orders`);
    
    for (const orderId of orderIds) {
      try {
        await this.verifyOrderAddress(orderId);
        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Failed to verify address for order ${orderId}:`, error);
      }
    }
    
    console.log(`Completed batch address verification`);
  }

  // Get verification statistics
  async getVerificationStats(): Promise<any> {
    const events = await storage.getEvents('address_verification');
    
    const stats = {
      total: events.length,
      verified: events.filter(e => (e.payload as any)?.status === 'verified').length,
      pending: events.filter(e => (e.payload as any)?.status === 'pending').length,
      whatsappSent: events.filter(e => (e.payload as any)?.status === 'whatsapp_sent').length,
      failed: events.filter(e => (e.payload as any)?.status === 'failed').length
    };
    
    return {
      ...stats,
      successRate: stats.total > 0 ? (stats.verified / stats.total) * 100 : 0
    };
  }
}

export const nasService = new NasService();
