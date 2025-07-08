import { Router } from "express";
import { shopifyService } from "../services/shopify";
import { storage } from "../storage";

const router = Router();

// Shopify webhook endpoint
router.post("/shopify/orders", async (req, res) => {
  try {
    const signature = req.get("X-Shopify-Hmac-Sha256");
    const body = JSON.stringify(req.body);

    if (!signature) {
      console.error("Missing Shopify webhook signature");
      return res.status(401).json({ error: "Missing signature" });
    }

    // Verify webhook signature
    if (!shopifyService.verifyWebhook(body, signature)) {
      console.error("Invalid Shopify webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    console.log("Received Shopify order webhook:", req.body.id);

    // Log webhook
    await storage.createWebhookLog({
      source: "shopify",
      event: "orders/create",
      payload: req.body,
      status: "received",
    });

    // Process the order
    await shopifyService.processShopifyOrder(req.body);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing Shopify webhook:", error);
    
    // Update webhook log with error
    try {
      await storage.createWebhookLog({
        source: "shopify",
        event: "orders/create",
        payload: req.body,
        status: "error",
        errorMessage: error.message,
      });
    } catch (logError) {
      console.error("Failed to log webhook error:", logError);
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;