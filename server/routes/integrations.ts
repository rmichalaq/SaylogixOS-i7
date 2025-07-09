import { Router } from "express";
import { storage } from "../storage";
import { shopifyService } from "../services/shopify";
import { googleMapsService } from "../services/googleMaps";
import { insertIntegrationSchema } from "@shared/schema";

const router = Router();

// Get all integrations
router.get("/", async (req, res) => {
  try {
    const integrations = await storage.getAllIntegrations();
    res.json(integrations);
  } catch (error) {
    console.error("Error fetching integrations:", error);
    res.status(500).json({ error: "Failed to fetch integrations" });
  }
});

// Create or update integration
router.post("/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const data = insertIntegrationSchema.parse(req.body);

    const existing = await storage.getIntegration(name);
    
    if (existing) {
      await storage.updateIntegration(existing.id, data);
      const updated = await storage.getIntegration(name);
      res.json(updated);
    } else {
      const integration = await storage.createIntegration({ ...data, name });
      res.json(integration);
    }
  } catch (error) {
    console.error("Error saving integration:", error);
    res.status(500).json({ error: "Failed to save integration" });
  }
});

// Test integration connection
router.post("/:name/test", async (req, res) => {
  try {
    const { name } = req.params;
    let result;

    switch (name) {
      case "shopify":
        result = await shopifyService.testConnection();
        break;
      case "google_maps":
        result = await googleMapsService.testConnection();
        break;
      default:
        return res.status(400).json({ error: "Unknown integration" });
    }

    res.json(result);
  } catch (error) {
    console.error(`Error testing ${req.params.name} integration:`, error);
    res.status(500).json({
      success: false,
      message: `Test failed: ${error.message}`,
    });
  }
});

// Fetch Shopify orders manually
router.post("/shopify/fetch-orders", async (req, res) => {
  try {
    const orders = await shopifyService.fetchOpenOrders();
    
    for (const order of orders) {
      await shopifyService.processShopifyOrder(order);
    }

    res.json({ 
      success: true, 
      message: `Processed ${orders.length} orders from Shopify`,
      count: orders.length 
    });
  } catch (error) {
    console.error("Error fetching Shopify orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Fetch Shopify SKUs
router.get("/shopify/skus", async (req, res) => {
  try {
    console.log("Fetching SKUs from Shopify");
    
    const products = await shopifyService.fetchProducts();
    const skus = products.flatMap(product => 
      product.variants.map((variant: any) => ({
        id: variant.id,
        sku: variant.sku,
        title: `${product.title} - ${variant.title}`,
        price: variant.price,
        inventoryQuantity: variant.inventory_quantity,
        productType: product.product_type,
        vendor: product.vendor
      }))
    ).filter(sku => sku.sku); // Only include variants with SKUs
    
    res.json(skus);
  } catch (error) {
    console.error("Failed to fetch SKUs from Shopify:", error);
    res.status(500).json({ error: "Failed to fetch SKUs" });
  }
});

// Get orders for map
router.get("/maps/orders", async (req, res) => {
  try {
    const orders = await googleMapsService.getOrdersWithCoordinates();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching map orders:", error);
    res.status(500).json({ error: "Failed to fetch map orders" });
  }
});

// Geocode order address
router.post("/maps/geocode/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await storage.getOrder(parseInt(orderId));
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const coordinates = await googleMapsService.geocodeAddress(order.shippingAddress);
    
    if (coordinates) {
      await storage.updateOrder(order.id, { coordinates });
      res.json({ success: true, coordinates });
    } else {
      res.status(400).json({ error: "Failed to geocode address" });
    }
  } catch (error) {
    console.error("Error geocoding address:", error);
    res.status(500).json({ error: "Failed to geocode address" });
  }
});

// Optimize route
router.post("/maps/optimize-route", async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!Array.isArray(orderIds) || orderIds.length < 2) {
      return res.status(400).json({ error: "Need at least 2 order IDs" });
    }

    const result = await googleMapsService.optimizeRoute(orderIds);
    
    if (result) {
      res.json(result);
    } else {
      res.status(400).json({ error: "Failed to optimize route" });
    }
  } catch (error) {
    console.error("Error optimizing route:", error);
    res.status(500).json({ error: "Failed to optimize route" });
  }
});

export default router;