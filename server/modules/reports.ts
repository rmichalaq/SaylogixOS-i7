import { storage } from '../storage';
import { eventEmitter } from '../services/eventEmitter';

class ReportsModule {
  async getOperationsReport(startDate: string, endDate: string): Promise<any> {
    try {
      const orders = await storage.getOrdersByDateRange(startDate, endDate);
      const events = await storage.getEventsByDateRange(startDate, endDate);
      const pickingTasks = await storage.getPickingTasksByDateRange(startDate, endDate);
      const packingTasks = await storage.getPackingTasksByDateRange(startDate, endDate);

      // Order Flow Metrics
      const orderMetrics = {
        totalOrders: orders.length,
        ordersByStatus: orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        ordersByPriority: orders.reduce((acc, order) => {
          acc[order.priority] = (acc[order.priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        ordersByChannel: orders.reduce((acc, order) => {
          acc[order.sourceChannel] = (acc[order.sourceChannel] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        averageOrderValue: orders.length > 0 ? 
          orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || '0'), 0) / orders.length : 0,
        totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || '0'), 0)
      };

      // Processing Time Analysis
      const processingTimes = this.calculateProcessingTimes(orders);
      
      // Efficiency Metrics
      const efficiencyMetrics = {
        averagePickingTime: this.calculateAverageTaskTime(pickingTasks),
        averagePackingTime: this.calculateAverageTaskTime(packingTasks),
        pickingAccuracy: this.calculatePickingAccuracy(pickingTasks),
        packingAccuracy: this.calculatePackingAccuracy(packingTasks),
        firstTimeRightRate: this.calculateFirstTimeRightRate(orders),
        exceptionRate: (orderMetrics.ordersByStatus.exception || 0) / orders.length * 100
      };

      // Throughput Analysis
      const throughputMetrics = this.calculateThroughputMetrics(orders, startDate, endDate);

      // SLA Compliance
      const slaMetrics = this.calculateSLACompliance(orders);

      return {
        dateRange: { startDate, endDate },
        orderMetrics,
        processingTimes,
        efficiencyMetrics,
        throughputMetrics,
        slaMetrics,
        eventsSummary: this.summarizeEvents(events),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating operations report:', error);
      throw error;
    }
  }

  async getCourierPerformanceReport(startDate: string, endDate: string, courier?: string): Promise<any> {
    try {
      const filters: any = { startDate, endDate };
      if (courier) filters.courierService = courier;

      const orders = await storage.getOrdersByDateRange(startDate, endDate, filters);
      const manifests = await storage.getCourierManifestsByDateRange(startDate, endDate, filters);
      const deliveryEvents = await storage.getDeliveryEventsByDateRange(startDate, endDate, filters);

      const courierStats: Record<string, any> = {};

      // Group by courier service
      for (const order of orders) {
        if (!order.courierService) continue;

        if (!courierStats[order.courierService]) {
          courierStats[order.courierService] = {
            totalOrders: 0,
            dispatchedOrders: 0,
            deliveredOrders: 0,
            returnedOrders: 0,
            exceptionOrders: 0,
            totalRevenue: 0,
            deliveryTimes: [],
            manifestCount: 0,
            averagePackagesPerManifest: 0
          };
        }

        const stats = courierStats[order.courierService];
        stats.totalOrders++;
        stats.totalRevenue += parseFloat(order.totalAmount || '0');

        if (order.dispatched) stats.dispatchedOrders++;
        if (order.delivered) {
          stats.deliveredOrders++;
          if (order.dispatched && order.delivered) {
            const deliveryTime = (new Date(order.delivered).getTime() - new Date(order.dispatched).getTime()) / (1000 * 60 * 60);
            stats.deliveryTimes.push(deliveryTime);
          }
        }
        if (order.status === 'returned') stats.returnedOrders++;
        if (order.status === 'exception') stats.exceptionOrders++;
      }

      // Add manifest data
      for (const manifest of manifests) {
        if (courierStats[manifest.courierService]) {
          courierStats[manifest.courierService].manifestCount++;
        }
      }

      // Calculate performance metrics
      for (const courierService in courierStats) {
        const stats = courierStats[courierService];
        stats.deliveryRate = stats.dispatchedOrders > 0 ? 
          (stats.deliveredOrders / stats.dispatchedOrders) * 100 : 0;
        stats.returnRate = stats.dispatchedOrders > 0 ? 
          (stats.returnedOrders / stats.dispatchedOrders) * 100 : 0;
        stats.exceptionRate = stats.totalOrders > 0 ? 
          (stats.exceptionOrders / stats.totalOrders) * 100 : 0;
        stats.averageDeliveryTime = stats.deliveryTimes.length > 0 ? 
          stats.deliveryTimes.reduce((sum, time) => sum + time, 0) / stats.deliveryTimes.length : 0;
        stats.averagePackagesPerManifest = stats.manifestCount > 0 ? 
          stats.dispatchedOrders / stats.manifestCount : 0;
        stats.onTimeDeliveryRate = this.calculateOnTimeDeliveryRate(stats.deliveryTimes);
      }

      return {
        dateRange: { startDate, endDate },
        courier,
        courierStats,
        summary: {
          totalCouriers: Object.keys(courierStats).length,
          bestPerformer: this.getBestPerformingCourier(courierStats),
          worstPerformer: this.getWorstPerformingCourier(courierStats),
          averageDeliveryRate: Object.values(courierStats).reduce((sum: number, stats: any) => 
            sum + stats.deliveryRate, 0) / Object.keys(courierStats).length || 0
        },
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating courier performance report:', error);
      throw error;
    }
  }

  async getReturnsReport(startDate: string, endDate: string): Promise<any> {
    try {
      const returnedOrders = await storage.getReturnedOrdersByDateRange(startDate, endDate);
      const returnEvents = await storage.getReturnEventsByDateRange(startDate, endDate);

      const returnAnalysis = {
        totalReturns: returnedOrders.length,
        returnsByReason: returnedOrders.reduce((acc, order) => {
          const reason = order.metadata?.rtoReason || 'Unknown';
          acc[reason] = (acc[reason] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        returnsByCourier: returnedOrders.reduce((acc, order) => {
          const courier = order.courierService || 'Unknown';
          acc[courier] = (acc[courier] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        returnsByCity: returnedOrders.reduce((acc, order) => {
          const city = order.city || 'Unknown';
          acc[city] = (acc[city] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        averageDeliveryAttempts: returnedOrders.reduce((sum, order) => 
          sum + (order.metadata?.deliveryAttempts || 0), 0) / (returnedOrders.length || 1),
        totalReturnValue: returnedOrders.reduce((sum, order) => 
          sum + parseFloat(order.totalAmount || '0'), 0)
      };

      const returnTrends = this.calculateReturnTrends(returnedOrders, startDate, endDate);
      const costAnalysis = this.calculateReturnCostAnalysis(returnedOrders);
      const recommendations = this.generateReturnRecommendations(returnAnalysis);

      return {
        dateRange: { startDate, endDate },
        returnAnalysis,
        returnTrends,
        costAnalysis,
        recommendations,
        detailedReturns: returnedOrders.slice(0, 100), // Limit for performance
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating returns report:', error);
      throw error;
    }
  }

  async getAddressQualityReport(startDate: string, endDate: string): Promise<any> {
    try {
      const orders = await storage.getOrdersByDateRange(startDate, endDate);
      const verificationEvents = await storage.getVerificationEventsByDateRange(startDate, endDate);

      const addressMetrics = {
        totalOrders: orders.length,
        verifiedAddresses: orders.filter(o => o.addressVerified).length,
        manualVerifications: orders.filter(o => 
          o.metadata?.verificationMethod === 'manual').length,
        whatsappVerifications: orders.filter(o => 
          o.metadata?.verificationMethod === 'whatsapp_confirmation').length,
        automaticVerifications: orders.filter(o => 
          o.metadata?.verificationMethod === 'nas_api').length,
        failedVerifications: orders.filter(o => 
          o.status === 'exception' && !o.addressVerified).length
      };

      const verificationRate = addressMetrics.totalOrders > 0 ? 
        (addressMetrics.verifiedAddresses / addressMetrics.totalOrders) * 100 : 0;

      const cityAnalysis = orders.reduce((acc, order) => {
        const city = order.city || 'Unknown';
        if (!acc[city]) {
          acc[city] = {
            totalOrders: 0,
            verifiedOrders: 0,
            manualVerifications: 0,
            whatsappVerifications: 0,
            failedVerifications: 0
          };
        }
        
        acc[city].totalOrders++;
        if (order.addressVerified) acc[city].verifiedOrders++;
        if (order.metadata?.verificationMethod === 'manual') acc[city].manualVerifications++;
        if (order.metadata?.verificationMethod === 'whatsapp_confirmation') acc[city].whatsappVerifications++;
        if (!order.addressVerified && order.status === 'exception') acc[city].failedVerifications++;
        
        return acc;
      }, {} as Record<string, any>);

      // Calculate verification rates by city
      for (const city in cityAnalysis) {
        const data = cityAnalysis[city];
        data.verificationRate = data.totalOrders > 0 ? 
          (data.verifiedOrders / data.totalOrders) * 100 : 0;
      }

      const qualityIssues = this.identifyAddressQualityIssues(orders);
      const improvements = this.suggestAddressQualityImprovements(addressMetrics, cityAnalysis);

      return {
        dateRange: { startDate, endDate },
        addressMetrics,
        verificationRate,
        cityAnalysis,
        qualityIssues,
        improvements,
        verificationTimeline: this.buildVerificationTimeline(verificationEvents),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating address quality report:', error);
      throw error;
    }
  }

  async getExceptionsReport(startDate: string, endDate: string): Promise<any> {
    try {
      const exceptionOrders = await storage.getExceptionOrdersByDateRange(startDate, endDate);
      const exceptionEvents = await storage.getExceptionEventsByDateRange(startDate, endDate);

      const exceptionAnalysis = {
        totalExceptions: exceptionOrders.length,
        exceptionsByType: exceptionEvents.reduce((acc, event) => {
          const type = event.eventData?.error || event.eventType;
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        exceptionsByModule: exceptionEvents.reduce((acc, event) => {
          const module = event.sourceSystem || 'Unknown';
          acc[module] = (acc[module] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        exceptionsByPriority: exceptionOrders.reduce((acc, order) => {
          const priority = order.priority || 'normal';
          acc[priority] = (acc[priority] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        resolvedExceptions: exceptionOrders.filter(o => 
          o.status !== 'exception').length,
        avgResolutionTime: this.calculateAverageResolutionTime(exceptionOrders)
      };

      const resolutionRate = exceptionAnalysis.totalExceptions > 0 ? 
        (exceptionAnalysis.resolvedExceptions / exceptionAnalysis.totalExceptions) * 100 : 0;

      const criticalExceptions = exceptionOrders.filter(o => 
        o.priority === 'urgent' || o.priority === 'high');

      const exceptionTrends = this.calculateExceptionTrends(exceptionEvents, startDate, endDate);
      const rootCauseAnalysis = this.performRootCauseAnalysis(exceptionEvents);

      return {
        dateRange: { startDate, endDate },
        exceptionAnalysis,
        resolutionRate,
        criticalExceptions: criticalExceptions.slice(0, 50),
        exceptionTrends,
        rootCauseAnalysis,
        actionItems: this.generateExceptionActionItems(exceptionAnalysis),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating exceptions report:', error);
      throw error;
    }
  }

  async getWarehouseProductivityReport(startDate: string, endDate: string): Promise<any> {
    try {
      const pickingTasks = await storage.getPickingTasksByDateRange(startDate, endDate);
      const packingTasks = await storage.getPackingTasksByDateRange(startDate, endDate);
      const putawayTasks = await storage.getPutawayTasksByDateRange(startDate, endDate);
      const inventoryAdjustments = await storage.getInventoryAdjustmentsByDateRange(startDate, endDate);

      const productivityMetrics = {
        picking: {
          totalTasks: pickingTasks.length,
          completedTasks: pickingTasks.filter(t => t.status === 'completed').length,
          averagePickTime: this.calculateAverageTaskTime(pickingTasks),
          picksPerHour: this.calculateTasksPerHour(pickingTasks),
          accuracy: this.calculatePickingAccuracy(pickingTasks),
          exceptionRate: pickingTasks.filter(t => t.status === 'exception').length / (pickingTasks.length || 1) * 100
        },
        packing: {
          totalTasks: packingTasks.length,
          completedTasks: packingTasks.filter(t => t.status === 'completed').length,
          averagePackTime: this.calculateAverageTaskTime(packingTasks),
          packsPerHour: this.calculateTasksPerHour(packingTasks),
          accuracy: this.calculatePackingAccuracy(packingTasks),
          labelSuccessRate: packingTasks.filter(t => t.labelGenerated).length / (packingTasks.length || 1) * 100
        },
        putaway: {
          totalTasks: putawayTasks.length,
          completedTasks: putawayTasks.filter(t => t.status === 'completed').length,
          averagePutawayTime: this.calculateAverageTaskTime(putawayTasks),
          putawaysPerHour: this.calculateTasksPerHour(putawayTasks),
          binAccuracy: this.calculateBinAccuracy(putawayTasks)
        },
        inventory: {
          totalAdjustments: inventoryAdjustments.length,
          positiveAdjustments: inventoryAdjustments.filter(a => a.quantity > 0).length,
          negativeAdjustments: inventoryAdjustments.filter(a => a.quantity < 0).length,
          averageAdjustmentValue: inventoryAdjustments.reduce((sum, a) => sum + Math.abs(a.quantity), 0) / (inventoryAdjustments.length || 1)
        }
      };

      const workerPerformance = await this.calculateWorkerPerformance(startDate, endDate);
      const utilizationMetrics = this.calculateWarehouseUtilization(productivityMetrics);

      return {
        dateRange: { startDate, endDate },
        productivityMetrics,
        workerPerformance,
        utilizationMetrics,
        recommendations: this.generateProductivityRecommendations(productivityMetrics),
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating warehouse productivity report:', error);
      throw error;
    }
  }

  // Helper Methods
  private calculateProcessingTimes(orders: any[]): any {
    const times = {
      orderToValidation: [],
      validationToWMS: [],
      pickingTime: [],
      packingTime: [],
      wmsToDispatch: [],
      dispatchToDelivery: [],
      orderToDelivery: []
    };

    for (const order of orders) {
      if (order.orderFetched && order.orderValidated) {
        times.orderToValidation.push(
          (new Date(order.orderValidated).getTime() - new Date(order.orderFetched).getTime()) / (1000 * 60 * 60)
        );
      }

      if (order.orderValidated && order.orderReleasedToWms) {
        times.validationToWMS.push(
          (new Date(order.orderReleasedToWms).getTime() - new Date(order.orderValidated).getTime()) / (1000 * 60 * 60)
        );
      }

      if (order.orderReleasedToWms && order.picked) {
        times.pickingTime.push(
          (new Date(order.picked).getTime() - new Date(order.orderReleasedToWms).getTime()) / (1000 * 60 * 60)
        );
      }

      if (order.picked && order.packed) {
        times.packingTime.push(
          (new Date(order.packed).getTime() - new Date(order.picked).getTime()) / (1000 * 60 * 60)
        );
      }

      if (order.packed && order.dispatched) {
        times.wmsToDispatch.push(
          (new Date(order.dispatched).getTime() - new Date(order.packed).getTime()) / (1000 * 60 * 60)
        );
      }

      if (order.dispatched && order.delivered) {
        times.dispatchToDelivery.push(
          (new Date(order.delivered).getTime() - new Date(order.dispatched).getTime()) / (1000 * 60 * 60)
        );
      }

      if (order.orderFetched && order.delivered) {
        times.orderToDelivery.push(
          (new Date(order.delivered).getTime() - new Date(order.orderFetched).getTime()) / (1000 * 60 * 60)
        );
      }
    }

    return {
      orderToValidation: this.calculateStats(times.orderToValidation),
      validationToWMS: this.calculateStats(times.validationToWMS),
      pickingTime: this.calculateStats(times.pickingTime),
      packingTime: this.calculateStats(times.packingTime),
      wmsToDispatch: this.calculateStats(times.wmsToDispatch),
      dispatchToDelivery: this.calculateStats(times.dispatchToDelivery),
      orderToDelivery: this.calculateStats(times.orderToDelivery)
    };
  }

  private calculateStats(values: number[]): any {
    if (values.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };
    
    const sorted = values.sort((a, b) => a - b);
    return {
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      count: values.length
    };
  }

  private calculateThroughputMetrics(orders: any[], startDate: string, endDate: string): any {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    return {
      ordersPerDay: orders.length / daysDiff,
      dispatchedPerDay: orders.filter(o => o.dispatched).length / daysDiff,
      deliveredPerDay: orders.filter(o => o.delivered).length / daysDiff,
      revenuePerDay: orders.reduce((sum, o) => sum + parseFloat(o.totalAmount || '0'), 0) / daysDiff,
      averageOrderSize: orders.reduce((sum, o) => sum + (o.itemCount || 0), 0) / (orders.length || 1)
    };
  }

  private calculateSLACompliance(orders: any[]): any {
    const slaTargets = {
      addressVerification: 4, // 4 hours
      orderProcessing: 24, // 24 hours
      picking: 8, // 8 hours
      packing: 4, // 4 hours
      delivery: 48 // 48 hours from dispatch
    };

    const compliance = {
      addressVerification: 0,
      orderProcessing: 0,
      picking: 0,
      packing: 0,
      delivery: 0
    };

    let counts = {
      addressVerification: 0,
      orderProcessing: 0,
      picking: 0,
      packing: 0,
      delivery: 0
    };

    for (const order of orders) {
      // Address verification SLA
      if (order.verifyStart && order.verifyCompleted) {
        counts.addressVerification++;
        const hours = (new Date(order.verifyCompleted).getTime() - new Date(order.verifyStart).getTime()) / (1000 * 60 * 60);
        if (hours <= slaTargets.addressVerification) compliance.addressVerification++;
      }

      // Order processing SLA
      if (order.orderFetched && order.orderValidated) {
        counts.orderProcessing++;
        const hours = (new Date(order.orderValidated).getTime() - new Date(order.orderFetched).getTime()) / (1000 * 60 * 60);
        if (hours <= slaTargets.orderProcessing) compliance.orderProcessing++;
      }

      // Picking SLA
      if (order.orderReleasedToWms && order.picked) {
        counts.picking++;
        const hours = (new Date(order.picked).getTime() - new Date(order.orderReleasedToWms).getTime()) / (1000 * 60 * 60);
        if (hours <= slaTargets.picking) compliance.picking++;
      }

      // Packing SLA
      if (order.picked && order.packed) {
        counts.packing++;
        const hours = (new Date(order.packed).getTime() - new Date(order.picked).getTime()) / (1000 * 60 * 60);
        if (hours <= slaTargets.packing) compliance.packing++;
      }

      // Delivery SLA
      if (order.dispatched && order.delivered) {
        counts.delivery++;
        const hours = (new Date(order.delivered).getTime() - new Date(order.dispatched).getTime()) / (1000 * 60 * 60);
        if (hours <= slaTargets.delivery) compliance.delivery++;
      }
    }

    return {
      slaTargets,
      compliance: {
        addressVerification: counts.addressVerification > 0 ? (compliance.addressVerification / counts.addressVerification) * 100 : 0,
        orderProcessing: counts.orderProcessing > 0 ? (compliance.orderProcessing / counts.orderProcessing) * 100 : 0,
        picking: counts.picking > 0 ? (compliance.picking / counts.picking) * 100 : 0,
        packing: counts.packing > 0 ? (compliance.packing / counts.packing) * 100 : 0,
        delivery: counts.delivery > 0 ? (compliance.delivery / counts.delivery) * 100 : 0
      },
      counts
    };
  }

  private calculateAverageTaskTime(tasks: any[]): number {
    const completedTasks = tasks.filter(t => t.completedAt && t.startedAt);
    if (completedTasks.length === 0) return 0;

    const totalTime = completedTasks.reduce((sum, task) => {
      return sum + (new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime());
    }, 0);

    return totalTime / completedTasks.length / (1000 * 60); // minutes
  }

  private calculatePickingAccuracy(pickingTasks: any[]): number {
    const completedTasks = pickingTasks.filter(t => t.status === 'completed');
    if (completedTasks.length === 0) return 0;

    const accuratePicks = completedTasks.filter(t => t.pickedQuantity === t.quantity);
    return (accuratePicks.length / completedTasks.length) * 100;
  }

  private calculatePackingAccuracy(packingTasks: any[]): number {
    const completedTasks = packingTasks.filter(t => t.status === 'completed');
    if (completedTasks.length === 0) return 0;

    const accuratePacks = completedTasks.filter(t => t.labelGenerated);
    return (accuratePacks.length / completedTasks.length) * 100;
  }

  private calculateFirstTimeRightRate(orders: any[]): number {
    const processedOrders = orders.filter(o => o.status !== 'received');
    if (processedOrders.length === 0) return 0;

    const firstTimeRight = processedOrders.filter(o => o.status !== 'exception');
    return (firstTimeRight.length / processedOrders.length) * 100;
  }

  private summarizeEvents(events: any[]): any {
    return {
      totalEvents: events.length,
      successfulEvents: events.filter(e => e.status === 'success').length,
      failedEvents: events.filter(e => e.status === 'failure').length,
      eventsByType: events.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      eventsBySystem: events.reduce((acc, event) => {
        acc[event.sourceSystem] = (acc[event.sourceSystem] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  private calculateOnTimeDeliveryRate(deliveryTimes: number[]): number {
    if (deliveryTimes.length === 0) return 0;
    const onTimeDeliveries = deliveryTimes.filter(time => time <= 48); // 48 hours SLA
    return (onTimeDeliveries.length / deliveryTimes.length) * 100;
  }

  private getBestPerformingCourier(courierStats: Record<string, any>): string {
    let bestCourier = '';
    let bestScore = 0;

    for (const [courier, stats] of Object.entries(courierStats)) {
      const score = (stats.deliveryRate + stats.onTimeDeliveryRate) / 2 - stats.returnRate;
      if (score > bestScore) {
        bestScore = score;
        bestCourier = courier;
      }
    }

    return bestCourier;
  }

  private getWorstPerformingCourier(courierStats: Record<string, any>): string {
    let worstCourier = '';
    let worstScore = Infinity;

    for (const [courier, stats] of Object.entries(courierStats)) {
      const score = (stats.deliveryRate + stats.onTimeDeliveryRate) / 2 - stats.returnRate;
      if (score < worstScore) {
        worstScore = score;
        worstCourier = courier;
      }
    }

    return worstCourier;
  }

  private calculateReturnTrends(returnedOrders: any[], startDate: string, endDate: string): any {
    // Implementation for return trends analysis
    return {
      dailyReturns: {},
      monthlyReturns: {},
      trendDirection: 'stable'
    };
  }

  private calculateReturnCostAnalysis(returnedOrders: any[]): any {
    const totalReturnValue = returnedOrders.reduce((sum, order) => 
      sum + parseFloat(order.totalAmount || '0'), 0);
    
    const estimatedShippingCost = returnedOrders.length * 15; // Estimated 15 SAR per return
    const estimatedHandlingCost = returnedOrders.length * 5; // Estimated 5 SAR per return

    return {
      totalReturnValue,
      estimatedShippingCost,
      estimatedHandlingCost,
      totalEstimatedCost: totalReturnValue + estimatedShippingCost + estimatedHandlingCost,
      averageCostPerReturn: (totalReturnValue + estimatedShippingCost + estimatedHandlingCost) / (returnedOrders.length || 1)
    };
  }

  private generateReturnRecommendations(returnAnalysis: any): string[] {
    const recommendations = [];

    if (returnAnalysis.returnsByReason['Address not found'] > returnAnalysis.totalReturns * 0.3) {
      recommendations.push('Improve address verification process - high percentage of address-related returns');
    }

    if (returnAnalysis.returnsByReason['Customer not available'] > returnAnalysis.totalReturns * 0.2) {
      recommendations.push('Implement delivery time slot selection for customers');
    }

    if (returnAnalysis.averageDeliveryAttempts > 2) {
      recommendations.push('Review delivery attempt strategy - consider alternative delivery methods');
    }

    return recommendations;
  }

  private identifyAddressQualityIssues(orders: any[]): any[] {
    const issues = [];

    const unverifiedRate = orders.filter(o => !o.addressVerified).length / orders.length;
    if (unverifiedRate > 0.1) {
      issues.push({
        type: 'High unverified rate',
        severity: 'high',
        description: `${(unverifiedRate * 100).toFixed(1)}% of addresses are unverified`,
        recommendation: 'Implement stricter address validation at order entry'
      });
    }

    const manualVerificationRate = orders.filter(o => 
      o.metadata?.verificationMethod === 'manual').length / orders.length;
    if (manualVerificationRate > 0.05) {
      issues.push({
        type: 'High manual verification rate',
        severity: 'medium',
        description: `${(manualVerificationRate * 100).toFixed(1)}% of addresses require manual verification`,
        recommendation: 'Improve automated verification systems or customer guidance'
      });
    }

    return issues;
  }

  private suggestAddressQualityImprovements(addressMetrics: any, cityAnalysis: any): string[] {
    const improvements = [];

    if (addressMetrics.manualVerifications > addressMetrics.totalOrders * 0.05) {
      improvements.push('Implement address autocomplete and validation at checkout');
    }

    if (addressMetrics.whatsappVerifications > addressMetrics.totalOrders * 0.1) {
      improvements.push('Provide better address format guidance to customers');
    }

    // Find cities with low verification rates
    const problematicCities = Object.entries(cityAnalysis)
      .filter(([_, data]: [string, any]) => data.verificationRate < 80)
      .map(([city, _]) => city);

    if (problematicCities.length > 0) {
      improvements.push(`Focus on improving address quality for: ${problematicCities.join(', ')}`);
    }

    return improvements;
  }

  private buildVerificationTimeline(verificationEvents: any[]): any[] {
    return verificationEvents
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(event => ({
        timestamp: event.timestamp,
        type: event.eventType,
        status: event.status,
        details: event.description
      }));
  }

  private calculateAverageResolutionTime(exceptionOrders: any[]): number {
    const resolvedOrders = exceptionOrders.filter(o => 
      o.status !== 'exception' && o.metadata?.resolutionTime);
    
    if (resolvedOrders.length === 0) return 0;

    const totalTime = resolvedOrders.reduce((sum, order) => 
      sum + (order.metadata.resolutionTime || 0), 0);
    
    return totalTime / resolvedOrders.length;
  }

  private calculateExceptionTrends(exceptionEvents: any[], startDate: string, endDate: string): any {
    // Implementation for exception trends analysis
    return {
      dailyExceptions: {},
      trendDirection: 'stable',
      peakTimes: []
    };
  }

  private performRootCauseAnalysis(exceptionEvents: any[]): any {
    const causes = exceptionEvents.reduce((acc, event) => {
      const cause = event.eventData?.error || 'Unknown';
      acc[cause] = (acc[cause] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCauses = Object.entries(causes)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);

    return {
      topCauses,
      totalCauses: Object.keys(causes).length,
      mostCommonCause: topCauses[0]?.[0] || 'None'
    };
  }

  private generateExceptionActionItems(exceptionAnalysis: any): string[] {
    const actionItems = [];

    if (exceptionAnalysis.exceptionsByModule.nas > exceptionAnalysis.totalExceptions * 0.3) {
      actionItems.push('Review and improve address verification system');
    }

    if (exceptionAnalysis.exceptionsByModule.wms > exceptionAnalysis.totalExceptions * 0.25) {
      actionItems.push('Audit warehouse management processes for efficiency improvements');
    }

    if (exceptionAnalysis.avgResolutionTime > 24) {
      actionItems.push('Implement faster exception resolution workflows');
    }

    return actionItems;
  }

  private calculateTasksPerHour(tasks: any[]): number {
    const completedTasks = tasks.filter(t => t.completedAt && t.startedAt);
    if (completedTasks.length === 0) return 0;

    const totalHours = completedTasks.reduce((sum, task) => {
      return sum + (new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime());
    }, 0) / (1000 * 60 * 60);

    return completedTasks.length / totalHours;
  }

  private calculateBinAccuracy(putawayTasks: any[]): number {
    const completedTasks = putawayTasks.filter(t => t.status === 'completed');
    if (completedTasks.length === 0) return 0;

    const accuratePutaways = completedTasks.filter(t => t.actualBin === t.suggestedBin);
    return (accuratePutaways.length / completedTasks.length) * 100;
  }

  private async calculateWorkerPerformance(startDate: string, endDate: string): Promise<any> {
    // Implementation for worker performance calculation
    return {
      topPerformers: [],
      averageProductivity: 0,
      productivityTrends: {}
    };
  }

  private calculateWarehouseUtilization(productivityMetrics: any): any {
    return {
      pickingUtilization: productivityMetrics.picking.completedTasks / productivityMetrics.picking.totalTasks * 100,
      packingUtilization: productivityMetrics.packing.completedTasks / productivityMetrics.packing.totalTasks * 100,
      putawayUtilization: productivityMetrics.putaway.completedTasks / productivityMetrics.putaway.totalTasks * 100,
      overallUtilization: 0
    };
  }

  private generateProductivityRecommendations(productivityMetrics: any): string[] {
    const recommendations = [];

    if (productivityMetrics.picking.accuracy < 95) {
      recommendations.push('Implement additional picking training to improve accuracy');
    }

    if (productivityMetrics.packing.labelSuccessRate < 98) {
      recommendations.push('Review label printing process and equipment maintenance');
    }

    if (productivityMetrics.picking.exceptionRate > 5) {
      recommendations.push('Investigate common picking exceptions and implement preventive measures');
    }

    return recommendations;
  }
}

export const reportsModule = new ReportsModule();
