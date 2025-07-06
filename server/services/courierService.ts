import { storage } from "../storage";
import { eventBus } from "./eventBus";

interface CourierRates {
  courier: string;
  service: string;
  rate: number;
  transitTime: string;
}

interface TrackingUpdate {
  trackingNumber: string;
  status: string;
  location: string;
  timestamp: Date;
  description: string;
}

class CourierService {
  private courierConfigs: Record<string, any>;

  constructor() {
    this.courierConfigs = {
      aramex: {
        apiKey: process.env.ARAMEX_API_KEY || '',
        apiUrl: process.env.ARAMEX_API_URL || 'https://ws.aramex.net/ShippingAPI.V2/Shipping/Service_1_0.svc',
        accountNumber: process.env.ARAMEX_ACCOUNT_NUMBER || '',
        username: process.env.ARAMEX_USERNAME || '',
        password: process.env.ARAMEX_PASSWORD || ''
      },
      smsa: {
        apiKey: process.env.SMSA_API_KEY || '',
        apiUrl: process.env.SMSA_API_URL || 'https://api.smsa.com.sa/api',
        username: process.env.SMSA_USERNAME || '',
        password: process.env.SMSA_PASSWORD || ''
      },
      naqel: {
        apiKey: process.env.NAQEL_API_KEY || '',
        apiUrl: process.env.NAQEL_API_URL || 'https://api.naqelexpress.com',
        clientId: process.env.NAQEL_CLIENT_ID || '',
        clientSecret: process.env.NAQEL_CLIENT_SECRET || ''
      }
    };
  }

  async assignOptimalCourier(orderId: number): Promise<string> {
    try {
      const order = await storage.getOrder(orderId);
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Get rates from all couriers
      const rates = await this.getRatesForOrder(order);
      
      // Apply business rules for courier selection
      const selectedCourier = this.selectOptimalCourier(rates, order);

      // Update order with courier assignment
      await storage.updateOrder(orderId, {
        courierAssigned: selectedCourier
      });

      // Emit courier assignment event
      await eventBus.emitEvent('EV013', {
        entityType: 'order',
        entityId: orderId,
        payload: { courier: selectedCourier, rates },
        source: 'courier'
      });

      console.log(`Assigned courier ${selectedCourier} to order ${order.saylogixNumber}`);
      return selectedCourier;
    } catch (error) {
      console.error("Failed to assign courier:", error);
      throw error;
    }
  }

  private async getRatesForOrder(order: any): Promise<CourierRates[]> {
    const rates: CourierRates[] = [];

    // Calculate package weight and dimensions from order items
    const items = await storage.getOrderItems(order.id);
    const totalWeight = items.reduce((sum, item) => sum + (parseFloat(item.weight?.toString() || '0') * item.quantity), 0);

    // Get rates from each courier
    for (const [courierName, config] of Object.entries(this.courierConfigs)) {
      try {
        const rate = await this.getCourierRate(courierName, order, totalWeight);
        if (rate) {
          rates.push(rate);
        }
      } catch (error) {
        console.error(`Failed to get rate from ${courierName}:`, error);
      }
    }

    return rates;
  }

  private async getCourierRate(courierName: string, order: any, weight: number): Promise<CourierRates | null> {
    const config = this.courierConfigs[courierName];
    if (!config.apiKey) {
      console.warn(`${courierName} API not configured`);
      return null;
    }

    try {
      switch (courierName) {
        case 'aramex':
          return await this.getAramexRate(order, weight);
        case 'smsa':
          return await this.getSmsaRate(order, weight);
        case 'naqel':
          return await this.getNaqelRate(order, weight);
        default:
          return null;
      }
    } catch (error) {
      console.error(`Failed to get ${courierName} rate:`, error);
      return null;
    }
  }

  private async getAramexRate(order: any, weight: number): Promise<CourierRates | null> {
    const config = this.courierConfigs.aramex;
    
    // Aramex API call implementation
    const payload = {
      Shipments: [{
        Shipper: {
          Reference1: order.saylogixNumber,
          Reference2: "",
          AccountNumber: config.accountNumber,
          PartyAddress: {
            Line1: "Warehouse Address",
            City: "Riyadh",
            StateOrProvinceCode: "",
            PostCode: "",
            CountryCode: "SA"
          },
          Contact: {
            PersonName: "Saylogix Warehouse",
            CompanyName: "Saylogix",
            PhoneNumber1: "+966123456789",
            EmailAddress: "warehouse@saylogix.com"
          }
        },
        Consignee: {
          Reference1: order.saylogixNumber,
          Reference2: "",
          PartyAddress: {
            Line1: order.shippingAddress.address1,
            City: order.shippingAddress.city,
            StateOrProvinceCode: order.shippingAddress.province,
            PostCode: order.shippingAddress.zip,
            CountryCode: "SA"
          },
          Contact: {
            PersonName: order.customerName,
            PhoneNumber1: order.customerPhone,
            EmailAddress: order.customerEmail
          }
        },
        ShippingDateTime: new Date().toISOString(),
        DueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        Details: {
          Dimensions: {
            Length: 20,
            Width: 15,
            Height: 10,
            Unit: "CM"
          },
          ActualWeight: {
            Value: weight,
            Unit: "KG"
          },
          ProductGroup: "EXP",
          ProductType: "PDX",
          PaymentType: "P",
          PaymentOptions: "",
          Services: "",
          NumberOfPieces: 1,
          DescriptionOfGoods: "General Merchandise",
          GoodsOriginCountry: "SA"
        }
      }],
      ClientInfo: {
        UserName: config.username,
        Password: config.password,
        Version: "v1.0",
        AccountNumber: config.accountNumber,
        AccountPin: config.apiKey,
        AccountEntity: "RUH",
        AccountCountryCode: "SA"
      }
    };

    // Mock response for now - implement actual API call
    return {
      courier: 'aramex',
      service: 'Express',
      rate: 25.00,
      transitTime: '1-2 business days'
    };
  }

  private async getSmsaRate(order: any, weight: number): Promise<CourierRates | null> {
    // SMSA API implementation
    return {
      courier: 'smsa',
      service: 'Express',
      rate: 22.00,
      transitTime: '1-2 business days'
    };
  }

  private async getNaqelRate(order: any, weight: number): Promise<CourierRates | null> {
    // Naqel API implementation
    return {
      courier: 'naqel',
      service: 'Standard',
      rate: 20.00,
      transitTime: '2-3 business days'
    };
  }

  private selectOptimalCourier(rates: CourierRates[], order: any): string {
    if (rates.length === 0) {
      return 'aramex'; // Default fallback
    }

    // Business rules for courier selection
    // 1. Priority orders prefer fastest courier
    if (order.priority === 'high') {
      return rates.reduce((best, current) => 
        current.transitTime < best.transitTime ? current : best
      ).courier;
    }

    // 2. Standard orders prefer cheapest courier
    return rates.reduce((best, current) => 
      current.rate < best.rate ? current : best
    ).courier;
  }

  async createShipment(orderId: number): Promise<string> {
    try {
      const order = await storage.getOrder(orderId);
      if (!order || !order.courierAssigned) {
        throw new Error(`Order ${orderId} not found or courier not assigned`);
      }

      const trackingNumber = await this.generateShipmentLabel(order);

      // Update order with tracking number
      await storage.updateOrder(orderId, {
        trackingNumber,
        status: 'shipped',
        dispatched: new Date()
      });

      // Emit shipment created event
      await eventBus.emitEvent('EV079', {
        entityType: 'order',
        entityId: orderId,
        payload: { trackingNumber, courier: order.courierAssigned },
        source: 'courier'
      });

      return trackingNumber;
    } catch (error) {
      console.error("Failed to create shipment:", error);
      throw error;
    }
  }

  private async generateShipmentLabel(order: any): Promise<string> {
    const courier = order.courierAssigned;
    const config = this.courierConfigs[courier];

    if (!config.apiKey) {
      // Generate internal tracking number if API not configured
      return `SLX${Date.now().toString().slice(-8)}`;
    }

    // Implement actual courier API calls here
    switch (courier) {
      case 'aramex':
        return await this.createAramexShipment(order);
      case 'smsa':
        return await this.createSmsaShipment(order);
      case 'naqel':
        return await this.createNaqelShipment(order);
      default:
        return `SLX${Date.now().toString().slice(-8)}`;
    }
  }

  private async createAramexShipment(order: any): Promise<string> {
    // Implement Aramex shipment creation
    return `ARX${Date.now().toString().slice(-8)}`;
  }

  private async createSmsaShipment(order: any): Promise<string> {
    // Implement SMSA shipment creation
    return `SMS${Date.now().toString().slice(-8)}`;
  }

  private async createNaqelShipment(order: any): Promise<string> {
    // Implement Naqel shipment creation
    return `NQL${Date.now().toString().slice(-8)}`;
  }

  async trackShipment(trackingNumber: string): Promise<TrackingUpdate[]> {
    try {
      // Determine courier from tracking number prefix
      let courier = 'unknown';
      if (trackingNumber.startsWith('ARX')) courier = 'aramex';
      else if (trackingNumber.startsWith('SMS')) courier = 'smsa';
      else if (trackingNumber.startsWith('NQL')) courier = 'naqel';

      return await this.getCourierTracking(courier, trackingNumber);
    } catch (error) {
      console.error("Failed to track shipment:", error);
      return [];
    }
  }

  private async getCourierTracking(courier: string, trackingNumber: string): Promise<TrackingUpdate[]> {
    // Implement actual courier tracking APIs
    // For now, return mock data
    return [
      {
        trackingNumber,
        status: 'In Transit',
        location: 'Riyadh Hub',
        timestamp: new Date(),
        description: 'Package is on route to destination'
      }
    ];
  }

  async handleWebhook(payload: any, headers: any): Promise<void> {
    try {
      // Process courier webhook updates
      const courierType = this.determineCourierFromHeaders(headers);
      
      switch (courierType) {
        case 'aramex':
          await this.handleAramexWebhook(payload);
          break;
        case 'smsa':
          await this.handleSmsaWebhook(payload);
          break;
        case 'naqel':
          await this.handleNaqelWebhook(payload);
          break;
        default:
          console.log('Unknown courier webhook received');
      }
    } catch (error) {
      console.error("Failed to handle courier webhook:", error);
      throw error;
    }
  }

  private determineCourierFromHeaders(headers: any): string {
    if (headers['x-aramex-signature']) return 'aramex';
    if (headers['x-smsa-webhook']) return 'smsa';
    if (headers['x-naqel-signature']) return 'naqel';
    return 'unknown';
  }

  private async handleAramexWebhook(payload: any): Promise<void> {
    // Process Aramex status updates
    console.log('Processing Aramex webhook:', payload);
  }

  private async handleSmsaWebhook(payload: any): Promise<void> {
    // Process SMSA status updates
    console.log('Processing SMSA webhook:', payload);
  }

  private async handleNaqelWebhook(payload: any): Promise<void> {
    // Process Naqel status updates
    console.log('Processing Naqel webhook:', payload);
  }
}

export const courierService = new CourierService();
