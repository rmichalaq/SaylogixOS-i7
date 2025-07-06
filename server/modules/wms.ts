import { storage } from "../storage";
import { eventBus, EventData } from "../services/eventBus";

class WMSModule {
  private eventBus: any;
  private storage: any;

  init(eventBusInstance: any, storageInstance: any) {
    this.eventBus = eventBusInstance;
    this.storage = storageInstance;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Order ready for WMS
    this.eventBus.on('EV017', this.handleOrderReady.bind(this));
    this.eventBus.on('EV050', this.handleWmsOrderReceived.bind(this));
    
    // Inbound operations
    this.eventBus.on('EV020', this.handleInboundAnnounced.bind(this));
    this.eventBus.on('EV021', this.handleGateLogged.bind(this));
    this.eventBus.on('EV025', this.handleGrnCreated.bind(this));
    
    // Putaway operations
    this.eventBus.on('EV030', this.handlePutawayTaskGenerated.bind(this));
    this.eventBus.on('EV036', this.handlePutawayCompleted.bind(this));
    
    // Inventory management
    this.eventBus.on('EV042', this.handleAdjustmentLogged.bind(this));
    this.eventBus.on('EV043', this.handleCycleCountScheduled.bind(this));
    
    // Picking operations
    this.eventBus.on('EV051', this.handlePickTaskGenerated.bind(this));
    this.eventBus.on('EV054', this.handlePickScanned.bind(this));
    this.eventBus.on('EV058', this.handlePickCompleted.bind(this));
    
    // Packing operations
    this.eventBus.on('EV060', this.handlePackCartReceived.bind(this));
    this.eventBus.on('EV064', this.handleLabelGenerated.bind(this));
    this.eventBus.on('EV068', this.handlePackCompleted.bind(this));
  }

  // Order Management
  private async handleOrderReady(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      
      // Emit WMS order received event
      await this.eventBus.emitEvent('EV050', {
        entityType: 'order',
        entityId: orderId,
        payload: eventData.payload,
        source: 'wms'
      });
      
    } catch (error) {
      console.error("Failed to handle order ready:", error);
    }
  }

  private async handleWmsOrderReceived(eventData: EventData) {
    try {
      const orderId = eventData.entityId;
      const order = await this.storage.getOrder(orderId);
      
      if (!order) return;

      // Generate picking task
      await this.generatePickingTask(orderId);
      
    } catch (error) {
      console.error("Failed to handle WMS order received:", error);
    }
  }

  // Picking Operations
  private async generatePickingTask(orderId: number): Promise<void> {
    try {
      const order = await this.storage.getOrder(orderId);
      const orderItems = await this.storage.getOrderItems(orderId);
      
      if (!order || !orderItems.length) return;

      // Generate unique task number
      const taskNumber = `PICK-${Date.now().toString().slice(-8)}`;
      
      // Create picking task
      const pickingTask = await this.storage.createPickingTask({
        orderId,
        taskNumber,
        status: 'pending',
        priority: order.priority || 5
      });

      // Generate optimized pick path
      const pickPath = await this.optimizePickPath(orderItems);
      
      await this.storage.updatePickingTask(pickingTask.id, {
        pickPath
      });

      // Create picking task items
      for (const item of orderItems) {
        const binLocation = await this.findBestBinForSku(item.sku);
        
        if (binLocation) {
          await this.storage.createEvent({
            eventId: 'PICK_ITEM',
            eventType: 'picking.task.item.created',
            entityType: 'picking',
            entityId: pickingTask.id,
            payload: {
              orderItemId: item.id,
              sku: item.sku,
              binLocationId: binLocation.id,
              requestedQuantity: item.quantity
            },
            source: 'wms'
          });
        }
      }

      // Emit pick task generated event
      await this.eventBus.emitEvent('EV051', {
        entityType: 'picking',
        entityId: pickingTask.id,
        payload: { pickingTask, orderId },
        source: 'wms'
      });

      // Auto-optimize pick path
      await this.eventBus.emitEvent('EV052', {
        entityType: 'picking',
        entityId: pickingTask.id,
        payload: { pickPath },
        source: 'wms'
      });

      console.log(`Picking task ${taskNumber} generated for order ${order.saylogixNumber}`);
      
    } catch (error) {
      console.error("Failed to generate picking task:", error);
    }
  }

  private async handlePickTaskGenerated(eventData: EventData) {
    try {
      const pickingTaskId = eventData.entityId;
      
      // Log task generation
      await this.storage.createEvent({
        eventId: 'PICK_GENERATED',
        eventType: 'picking.task.ready',
        entityType: 'picking',
        entityId: pickingTaskId,
        payload: eventData.payload,
        source: 'wms'
      });
      
    } catch (error) {
      console.error("Failed to handle pick task generated:", error);
    }
  }

  private async handlePickScanned(eventData: EventData) {
    try {
      const { pickingTaskId, sku, binCode, quantity } = eventData.payload;
      
      // Update picking task item
      const taskItems = await this.storage.getPickingTaskItems(pickingTaskId);
      const taskItem = taskItems.find(item => item.sku === sku);
      
      if (taskItem) {
        await this.storage.createEvent({
          eventId: 'PICK_UPDATED',
          eventType: 'picking.item.scanned',
          entityType: 'picking',
          entityId: pickingTaskId,
          payload: {
            taskItemId: taskItem.id,
            scannedQuantity: quantity,
            binCode,
            scannedAt: new Date()
          },
          source: 'wms'
        });

        // Check if all items are picked
        await this.checkPickingTaskCompletion(pickingTaskId);
      }
      
    } catch (error) {
      console.error("Failed to handle pick scanned:", error);
    }
  }

  private async handlePickCompleted(eventData: EventData) {
    try {
      const pickingTaskId = eventData.entityId;
      const pickingTask = await this.storage.getPickingTasks().then(tasks => 
        tasks.find(t => t.id === pickingTaskId)
      );
      
      if (!pickingTask) return;

      // Update order status
      await this.storage.updateOrder(pickingTask.orderId, {
        status: 'picked',
        picked: new Date()
      });

      // Generate packing task
      await this.generatePackingTask(pickingTask.orderId);
      
    } catch (error) {
      console.error("Failed to handle pick completed:", error);
    }
  }

  // Packing Operations
  private async generatePackingTask(orderId: number): Promise<void> {
    try {
      const order = await this.storage.getOrder(orderId);
      
      if (!order) return;

      const taskNumber = `PACK-${Date.now().toString().slice(-8)}`;
      
      const packingTask = await this.storage.createPackingTask({
        orderId,
        taskNumber,
        status: 'pending'
      });

      // Emit pack cart received event
      await this.eventBus.emitEvent('EV060', {
        entityType: 'packing',
        entityId: packingTask.id,
        payload: { packingTask, orderId },
        source: 'wms'
      });

      console.log(`Packing task ${taskNumber} generated for order ${order.saylogixNumber}`);
      
    } catch (error) {
      console.error("Failed to generate packing task:", error);
    }
  }

  private async handlePackCartReceived(eventData: EventData) {
    try {
      const packingTaskId = eventData.entityId;
      
      // Start item verification process
      await this.eventBus.emitEvent('EV061', {
        entityType: 'packing',
        entityId: packingTaskId,
        payload: { action: 'verify_items_started' },
        source: 'wms'
      });
      
    } catch (error) {
      console.error("Failed to handle pack cart received:", error);
    }
  }

  private async handleLabelGenerated(eventData: EventData) {
    try {
      const packingTaskId = eventData.entityId;
      const { labelData, trackingNumber } = eventData.payload;
      
      // Update packing task
      await this.storage.updatePackingTask(packingTaskId, {
        labelPrinted: true
      });

      // Update order with tracking number
      const packingTasks = await this.storage.getPackingTasks();
      const packingTask = packingTasks.find(t => t.id === packingTaskId);
      
      if (packingTask) {
        await this.storage.updateOrder(packingTask.orderId, {
          trackingNumber
        });
      }
      
    } catch (error) {
      console.error("Failed to handle label generated:", error);
    }
  }

  private async handlePackCompleted(eventData: EventData) {
    try {
      const packingTaskId = eventData.entityId;
      const packingTasks = await this.storage.getPackingTasks();
      const packingTask = packingTasks.find(t => t.id === packingTaskId);
      
      if (!packingTask) return;

      // Update order status
      await this.storage.updateOrder(packingTask.orderId, {
        status: 'packed',
        packed: new Date()
      });

      console.log(`Packing completed for order ID ${packingTask.orderId}`);
      
    } catch (error) {
      console.error("Failed to handle pack completed:", error);
    }
  }

  // Inbound Operations
  private async handleInboundAnnounced(eventData: EventData) {
    try {
      const { shipmentId, expectedItems } = eventData.payload;
      
      // Create inbound receipt
      await this.storage.createEvent({
        eventId: 'INBOUND_CREATED',
        eventType: 'inbound.receipt.created',
        entityType: 'inbound',
        entityId: shipmentId,
        payload: { expectedItems },
        source: 'wms'
      });
      
    } catch (error) {
      console.error("Failed to handle inbound announced:", error);
    }
  }

  private async handleGateLogged(eventData: EventData) {
    try {
      const { shipmentId, arrivalTime, driverInfo } = eventData.payload;
      
      // Log gate entry
      await this.storage.createEvent({
        eventId: 'GATE_LOGGED',
        eventType: 'inbound.gate.logged',
        entityType: 'inbound',
        entityId: shipmentId,
        payload: { arrivalTime, driverInfo },
        source: 'wms'
      });
      
    } catch (error) {
      console.error("Failed to handle gate logged:", error);
    }
  }

  private async handleGrnCreated(eventData: EventData) {
    try {
      const { grnNumber, receivedItems } = eventData.payload;
      
      // Update inventory for received items
      for (const item of receivedItems) {
        const inventory = await this.storage.getInventoryBySku(item.sku);
        
        if (inventory) {
          await this.storage.updateInventory(item.sku, {
            availableQuantity: inventory.availableQuantity + item.receivedQuantity,
            inboundQuantity: Math.max(inventory.inboundQuantity - item.receivedQuantity, 0)
          });
        }
      }

      // Generate putaway tasks
      await this.generatePutawayTasks(receivedItems);
      
    } catch (error) {
      console.error("Failed to handle GRN created:", error);
    }
  }

  // Putaway Operations
  private async generatePutawayTasks(receivedItems: any[]): Promise<void> {
    try {
      for (const item of receivedItems) {
        // Find available bin location
        const binLocation = await this.findAvailableBin(item.sku);
        
        if (binLocation) {
          await this.eventBus.emitEvent('EV030', {
            entityType: 'putaway',
            entityId: 0,
            payload: {
              sku: item.sku,
              quantity: item.receivedQuantity,
              suggestedBin: binLocation.binCode
            },
            source: 'wms'
          });
        }
      }
    } catch (error) {
      console.error("Failed to generate putaway tasks:", error);
    }
  }

  private async handlePutawayTaskGenerated(eventData: EventData) {
    try {
      const { sku, quantity, suggestedBin } = eventData.payload;
      
      // Emit bin suggestion event
      await this.eventBus.emitEvent('EV031', {
        entityType: 'putaway',
        entityId: 0,
        payload: { sku, suggestedBin },
        source: 'wms'
      });
      
    } catch (error) {
      console.error("Failed to handle putaway task generated:", error);
    }
  }

  private async handlePutawayCompleted(eventData: EventData) {
    try {
      const { sku, quantity, binCode } = eventData.payload;
      
      // Update bin inventory
      const bin = await this.storage.getBinByCode(binCode);
      
      if (bin) {
        await this.storage.createEvent({
          eventId: 'BIN_UPDATED',
          eventType: 'bin.inventory.updated',
          entityType: 'inventory',
          entityId: bin.id,
          payload: { sku, quantity, operation: 'putaway' },
          source: 'wms'
        });
      }
      
    } catch (error) {
      console.error("Failed to handle putaway completed:", error);
    }
  }

  // Inventory Management
  private async handleAdjustmentLogged(eventData: EventData) {
    try {
      const { sku, adjustmentQuantity, reason } = eventData.payload;
      
      const inventory = await this.storage.getInventoryBySku(sku);
      
      if (inventory) {
        await this.storage.updateInventory(sku, {
          availableQuantity: inventory.availableQuantity + adjustmentQuantity
        });

        console.log(`Inventory adjustment: ${sku} ${adjustmentQuantity > 0 ? '+' : ''}${adjustmentQuantity} (${reason})`);
      }
      
    } catch (error) {
      console.error("Failed to handle adjustment logged:", error);
    }
  }

  private async handleCycleCountScheduled(eventData: EventData) {
    try {
      const { binCodes, scheduledDate } = eventData.payload;
      
      // Create cycle count tasks
      for (const binCode of binCodes) {
        await this.storage.createEvent({
          eventId: 'CYCLE_COUNT',
          eventType: 'cycle.count.task.created',
          entityType: 'inventory',
          entityId: 0,
          payload: { binCode, scheduledDate },
          source: 'wms'
        });
      }
      
    } catch (error) {
      console.error("Failed to handle cycle count scheduled:", error);
    }
  }

  // Helper Methods
  private async optimizePickPath(orderItems: any[]): Promise<any> {
    // Simple optimization - group by zone and sort by aisle/shelf
    const pickLocations = await Promise.all(
      orderItems.map(async item => {
        const binLocation = await this.findBestBinForSku(item.sku);
        return {
          sku: item.sku,
          quantity: item.quantity,
          binCode: binLocation?.binCode || '',
          zone: binLocation?.zone || '',
          aisle: binLocation?.aisle || '',
          shelf: binLocation?.shelf || ''
        };
      })
    );

    // Sort by zone, then aisle, then shelf
    pickLocations.sort((a, b) => {
      if (a.zone !== b.zone) return a.zone.localeCompare(b.zone);
      if (a.aisle !== b.aisle) return a.aisle.localeCompare(b.aisle);
      return a.shelf.localeCompare(b.shelf);
    });

    return {
      optimizedPath: pickLocations,
      estimatedPickTime: pickLocations.length * 30 // 30 seconds per pick
    };
  }

  private async findBestBinForSku(sku: string): Promise<any> {
    const inventory = await this.storage.getInventoryBySku(sku);
    if (!inventory || !inventory.primaryBinLocation) return null;

    return await this.storage.getBinByCode(inventory.primaryBinLocation);
  }

  private async findAvailableBin(sku: string): Promise<any> {
    const bins = await this.storage.getBinLocations();
    
    // Find bin with available capacity
    return bins.find(bin => 
      bin.status === 'available' && 
      bin.currentOccupancy < bin.capacity
    );
  }

  private async checkPickingTaskCompletion(pickingTaskId: number): Promise<void> {
    const taskItems = await this.storage.getPickingTaskItems(pickingTaskId);
    const allPicked = taskItems.every(item => 
      item.pickedQuantity >= item.requestedQuantity
    );

    if (allPicked) {
      await this.storage.updatePickingTask(pickingTaskId, {
        status: 'completed',
        completedTime: new Date()
      });

      await this.eventBus.emitEvent('EV058', {
        entityType: 'picking',
        entityId: pickingTaskId,
        payload: { completedAt: new Date() },
        source: 'wms'
      });
    }
  }

  // Public API methods
  async createInventoryAdjustment(sku: string, adjustmentQuantity: number, reason: string): Promise<void> {
    await this.eventBus.emitEvent('EV042', {
      entityType: 'inventory',
      entityId: 0,
      payload: { sku, adjustmentQuantity, reason },
      source: 'wms'
    });
  }

  async scheduleCycleCount(binCodes: string[], scheduledDate: Date): Promise<void> {
    await this.eventBus.emitEvent('EV043', {
      entityType: 'inventory',
      entityId: 0,
      payload: { binCodes, scheduledDate },
      source: 'wms'
    });
  }

  async processPickingScan(pickingTaskId: number, sku: string, binCode: string, quantity: number): Promise<void> {
    await this.eventBus.emitEvent('EV054', {
      entityType: 'picking',
      entityId: pickingTaskId,
      payload: { pickingTaskId, sku, binCode, quantity },
      source: 'wms'
    });
  }

  async generateShippingLabel(packingTaskId: number, boxWeight: number, dimensions: any): Promise<string> {
    try {
      // Generate tracking number (would integrate with courier API)
      const trackingNumber = `SLX-${Date.now().toString().slice(-8)}`;
      
      await this.eventBus.emitEvent('EV064', {
        entityType: 'packing',
        entityId: packingTaskId,
        payload: { 
          trackingNumber,
          boxWeight,
          dimensions,
          labelData: { /* label content */ }
        },
        source: 'wms'
      });

      return trackingNumber;
    } catch (error) {
      console.error("Failed to generate shipping label:", error);
      throw error;
    }
  }

  async completePackingTask(packingTaskId: number): Promise<void> {
    await this.storage.updatePackingTask(packingTaskId, {
      status: 'completed',
      completedTime: new Date()
    });

    await this.eventBus.emitEvent('EV068', {
      entityType: 'packing',
      entityId: packingTaskId,
      payload: { completedAt: new Date() },
      source: 'wms'
    });
  }
}

export const wmsModule = new WMSModule();
