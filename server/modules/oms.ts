import { storage } from "../storage";
import { eventBus, EventData } from "../services/eventBus";
import { nasService } from "../services/nasService";
import { courierService } from "../services/courierService";
import { shopifyService } from "../services/shopifyService";

class OMSModule {
  private eventBus: any;
  private storage: any;

  init(eventBusInstance: any, storageInstance: any) {
    this.eventBus = eventBusInstance;
    this.storage = storageInstance;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Order fetched from external source
    this.eventBus.on('EV001', this.handleOrderFetched.bind(this));
    
    // Address verification completed
    this.eventBus.on('EV009', this.handleAddressVerified.bind(this));
    
    // Order validation and processing
    this.eventBus.on('EV010', this.handleOrderReceived.bind(this));
    
    // Inventory allocation response
    this.eventBus.on('EV014', this.handleInventoryAllocated.bind(this));
  }

  private async handleOrderFetched(eventData: EventData) {
    try {
      const order = eventData.payload.order;
      
      // Start OMS processing
      await this.eventBus.emitEvent('EV010', {
        entityType: 'order',
        entityId: order.id,
        payload: { order },
        source: 'oms'
      });

      // Start address verification in parallel
      await nasService.verifyOrderAddress(order.id);
      
    } catch (error) {
      console.error("Failed to handle order fetched:", error);
      await this.handleOrderException(eventData.entityId, 'order_processing', error.message);
    }
  }

  private async handleOrderReceived(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const order = await this.storage.getOrder(orderId);
      
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Validate order
      await this.eventBus.emitEvent('EV011', {
        entityType: 'order',
        entityId: orderId,
        payload: { order },
        source: 'oms'
      });

      const validationResult = await this.validateOrder(order);
      
      if (!validationResult.valid) {
        await this.eventBus.emitEvent('EV015', {
          entityType: 'order',
          entityId: orderId,
          payload: { errors: validationResult.errors },
          source: 'oms'
        });
        
        await this.handleOrderException(orderId, 'validation', validationResult.errors.join(', '));
        return;
      }

      // Update order status
      await this.storage.updateOrder(orderId, {
        status: 'validated',
        orderValidated: new Date()
      });

      // Prioritize order
      await this.eventBus.emitEvent('EV012', {
        entityType: 'order',
        entityId: orderId,
        payload: { order },
        source: 'oms'
      });

      const priority = await this.calculateOrderPriority(order);
      await this.storage.updateOrder(orderId, { priority });

      // Auto-assign courier if address is verified
      if (order.nasVerified) {
        await this.assignCourierToOrder(orderId);
      }

      // Allocate inventory
      await this.allocateInventoryForOrder(orderId);
      
    } catch (error) {
      console.error("Failed to process order:", error);
      await this.handleOrderException(eventData.entityId, 'order_processing', error.message);
    }
  }

  private async handleAddressVerified(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const order = await this.storage.getOrder(orderId);
      
      if (!order) return;

      // If courier not assigned yet, assign now
      if (!order.courierPartnerId) {
        await this.assignCourierToOrder(orderId);
      }

      // Check if order is ready for WMS
      await this.checkOrderReadiness(orderId);
      
    } catch (error) {
      console.error("Failed to handle address verified:", error);
    }
  }

  private async handleInventoryAllocated(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      
      // Check if order is ready for WMS
      await this.checkOrderReadiness(orderId);
      
    } catch (error) {
      console.error("Failed to handle inventory allocated:", error);
    }
  }

  private async validateOrder(order: any): Promise<{valid: boolean, errors: string[]}> {
    const errors: string[] = [];

    // Validate customer information
    if (!order.customerName || order.customerName.trim().length === 0) {
      errors.push("Customer name is required");
    }

    if (!order.customerPhone || order.customerPhone.trim().length === 0) {
      errors.push("Customer phone is required");
    }

    // Validate shipping address
    const address = order.shippingAddress;
    if (!address || !address.address1 || !address.city) {
      errors.push("Complete shipping address is required");
    }

    // Validate order items
    const orderItems = await this.storage.getOrderItems(order.id);
    if (!orderItems || orderItems.length === 0) {
      errors.push("Order must contain at least one item");
    }

    // Validate inventory availability
    for (const item of orderItems) {
      const inventory = await this.storage.getInventoryBySku(item.sku);
      if (!inventory) {
        errors.push(`SKU ${item.sku} not found in inventory`);
      } else if (inventory.availableQuantity < item.quantity) {
        errors.push(`Insufficient inventory for SKU ${item.sku}: need ${item.quantity}, have ${inventory.availableQuantity}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async calculateOrderPriority(order: any): Promise<number> {
    let priority = 5; // Default priority

    // High value orders get higher priority
    if (order.orderValue > 1000) {
      priority = Math.max(priority - 2, 1);
    }

    // Express shipping gets higher priority
    const address = order.shippingAddress;
    if (address.city === 'Riyadh' || address.city === 'Jeddah') {
      priority = Math.max(priority - 1, 1);
    }

    // Customer tier (if available)
    // This would typically come from customer data
    
    return priority;
  }

  private async assignCourierToOrder(orderId: number): Promise<void> {
    try {
      await this.eventBus.emitEvent('EV013', {
        entityType: 'order',
        entityId: orderId,
        payload: { action: 'courier_assignment_started' },
        source: 'oms'
      });

      const courierCode = await courierService.autoAssignCourier(orderId);
      
      console.log(`Courier ${courierCode} assigned to order ${orderId}`);
      
    } catch (error) {
      console.error("Failed to assign courier:", error);
      await this.handleOrderException(orderId, 'courier', error.message);
    }
  }

  private async allocateInventoryForOrder(orderId: number): Promise<void> {
    try {
      await this.eventBus.emitEvent('EV014', {
        entityType: 'order',
        entityId: orderId,
        payload: { action: 'inventory_allocation_started' },
        source: 'oms'
      });

      const orderItems = await this.storage.getOrderItems(orderId);
      
      for (const item of orderItems) {
        const inventory = await this.storage.getInventoryBySku(item.sku);
        
        if (inventory && inventory.availableQuantity >= item.quantity) {
          // Reserve inventory
          await this.storage.updateInventory(item.sku, {
            availableQuantity: inventory.availableQuantity - item.quantity,
            reservedQuantity: inventory.reservedQuantity + item.quantity
          });
        }
      }

      console.log(`Inventory allocated for order ${orderId}`);
      
    } catch (error) {
      console.error("Failed to allocate inventory:", error);
      await this.handleOrderException(orderId, 'stock', error.message);
    }
  }

  private async checkOrderReadiness(orderId: number): Promise<void> {
    try {
      const order = await this.storage.getOrder(orderId);
      
      if (!order) return;

      // Check if order is ready for WMS
      const isReady = order.nasVerified && 
                     order.courierPartnerId && 
                     order.status === 'validated';

      if (isReady) {
        await this.storage.updateOrder(orderId, {
          status: 'ready_for_wms',
          orderReleasedToWms: new Date()
        });

        await this.eventBus.emitEvent('EV017', {
          entityType: 'order',
          entityId: orderId,
          payload: { order },
          source: 'oms'
        });

        console.log(`Order ${order.saylogixNumber} released to WMS`);
      }
      
    } catch (error) {
      console.error("Failed to check order readiness:", error);
    }
  }

  private async handleOrderException(orderId: number, type: string, reason: string): Promise<void> {
    try {
      await this.storage.updateOrder(orderId, {
        status: 'exception',
        notes: `${type.toUpperCase()} Exception: ${reason}`
      });

      await this.eventBus.emitEvent('EV016', {
        entityType: 'order',
        entityId: orderId,
        payload: { 
          exceptionType: type,
          reason,
          timestamp: new Date()
        },
        source: 'oms'
      });

      console.error(`Order ${orderId} exception (${type}): ${reason}`);
      
    } catch (error) {
      console.error("Failed to handle order exception:", error);
    }
  }

  // Manual order operations
  async createManualOrder(orderData: any): Promise<any> {
    try {
      // Generate Saylogix order number
      const year = new Date().getFullYear();
      const sequence = Date.now().toString().slice(-6);
      const saylogixNumber = `SLYY-${year}-${sequence}`;

      const order = await this.storage.createOrder({
        ...orderData,
        saylogixNumber,
        sourceChannel: 'manual',
        status: 'fetched',
        orderFetched: new Date()
      });

      // Create order items
      for (const itemData of orderData.items) {
        await this.storage.createOrderItem({
          orderId: order.id,
          ...itemData
        });
      }

      // Emit order fetched event to start processing
      await this.eventBus.emitEvent('EV001', {
        entityType: 'order',
        entityId: order.id,
        payload: { order },
        source: 'manual'
      });

      return order;
      
    } catch (error) {
      console.error("Failed to create manual order:", error);
      throw error;
    }
  }

  async cancelOrder(orderId: number, reason: string): Promise<void> {
    try {
      const order = await this.storage.getOrder(orderId);
      
      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      // Release reserved inventory
      const orderItems = await this.storage.getOrderItems(orderId);
      for (const item of orderItems) {
        const inventory = await this.storage.getInventoryBySku(item.sku);
        if (inventory) {
          await this.storage.updateInventory(item.sku, {
            availableQuantity: inventory.availableQuantity + item.quantity,
            reservedQuantity: Math.max(inventory.reservedQuantity - item.quantity, 0)
          });
        }
      }

      // Update order status
      await this.storage.updateOrder(orderId, {
        status: 'cancelled',
        notes: `Cancelled: ${reason}`
      });

      // Emit cancellation event
      await this.eventBus.emitEvent('EV016', {
        entityType: 'order',
        entityId: orderId,
        payload: { 
          reason,
          cancelledAt: new Date()
        },
        source: 'oms'
      });

      console.log(`Order ${order.saylogixNumber} cancelled: ${reason}`);
      
    } catch (error) {
      console.error("Failed to cancel order:", error);
      throw error;
    }
  }

  // Shopify order sync
  async syncShopifyOrders(): Promise<number> {
    try {
      return await shopifyService.syncOrders();
    } catch (error) {
      console.error("Failed to sync Shopify orders:", error);
      throw error;
    }
  }

  // Order statistics and reporting
  async getOrderStats(dateRange?: { start: Date, end: Date }): Promise<any> {
    const orders = await this.storage.getRecentOrders(1000);
    
    return {
      total: orders.length,
      byStatus: this.groupOrdersByStatus(orders),
      byChannel: this.groupOrdersByChannel(orders),
      averageOrderValue: this.calculateAverageOrderValue(orders),
      processingTimes: this.calculateProcessingTimes(orders)
    };
  }

  private groupOrdersByStatus(orders: any[]): Record<string, number> {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  }

  private groupOrdersByChannel(orders: any[]): Record<string, number> {
    return orders.reduce((acc, order) => {
      acc[order.sourceChannel] = (acc[order.sourceChannel] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateAverageOrderValue(orders: any[]): number {
    if (orders.length === 0) return 0;
    
    const total = orders.reduce((sum, order) => sum + (parseFloat(order.orderValue) || 0), 0);
    return total / orders.length;
  }

  private calculateProcessingTimes(orders: any[]): any {
    const processedOrders = orders.filter(order => 
      order.orderFetched && order.orderValidated
    );

    if (processedOrders.length === 0) return { average: 0, median: 0 };

    const times = processedOrders.map(order => {
      const start = new Date(order.orderFetched);
      const end = new Date(order.orderValidated);
      return end.getTime() - start.getTime();
    });

    times.sort((a, b) => a - b);

    return {
      average: times.reduce((sum, time) => sum + time, 0) / times.length,
      median: times[Math.floor(times.length / 2)]
    };
  }
}

export const omsModule = new OMSModule();
