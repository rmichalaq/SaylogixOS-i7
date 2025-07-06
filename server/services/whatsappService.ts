import { storage } from "../storage";
import { eventBus } from "./eventBus";

interface WhatsAppMessage {
  to: string;
  type: string;
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components: any[];
  };
}

class WhatsAppService {
  private apiKey: string;
  private phoneNumberId: string;
  private apiEndpoint: string;

  constructor() {
    this.apiKey = process.env.WHATSAPP_API_KEY || process.env.WHATSAPP_ACCESS_TOKEN || "";
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    this.apiEndpoint = process.env.WHATSAPP_API_ENDPOINT || "https://graph.facebook.com/v18.0";
    
    if (!this.apiKey || !this.phoneNumberId) {
      console.warn("WhatsApp API credentials not configured. Please set WHATSAPP_API_KEY and WHATSAPP_PHONE_NUMBER_ID environment variables.");
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('966') && !cleaned.startsWith('+966')) {
      // Assume Saudi Arabia if no country code
      if (cleaned.startsWith('0')) {
        cleaned = '966' + cleaned.substring(1);
      } else if (cleaned.startsWith('5')) {
        cleaned = '966' + cleaned;
      } else {
        cleaned = '966' + cleaned;
      }
    }
    
    return cleaned.replace('+', '');
  }

  async sendMessage(to: string, message: WhatsAppMessage): Promise<string> {
    if (!this.apiKey || !this.phoneNumberId) {
      throw new Error("WhatsApp API credentials not configured");
    }

    try {
      const formattedPhone = this.formatPhoneNumber(to);
      
      const payload = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: message.type,
        text: message.text
      };

      const response = await fetch(`${this.apiEndpoint}/${this.phoneNumberId}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`WhatsApp API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      const messageId = data.messages?.[0]?.id;
      
      if (!messageId) {
        throw new Error("No message ID returned from WhatsApp API");
      }

      console.log(`WhatsApp message sent to ${formattedPhone}, ID: ${messageId}`);
      return messageId;
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
      throw error;
    }
  }

  async sendTextMessage(to: string, text: string): Promise<string> {
    const message: WhatsAppMessage = {
      to,
      type: "text",
      text: { body: text }
    };

    return await this.sendMessage(to, message);
  }

  async sendAddressVerificationMessage(to: string, orderNumber: string, address: any): Promise<string> {
    const addressText = `${address.address1}${address.address2 ? ', ' + address.address2 : ''}, ${address.city}, ${address.province} ${address.zip}`;
    
    const message = `مرحباً! نحتاج للتأكد من عنوان التوصيل لطلبكم رقم ${orderNumber}

العنوان المسجل:
${addressText}

يرجى الرد بـ:
✅ "صحيح" إذا كان العنوان صحيح
📝 العنوان الصحيح إذا كان يحتاج تعديل

شكراً لكم
فريق سايلوجيكس`;

    return await this.sendTextMessage(to, message);
  }

  async sendOrderUpdateMessage(to: string, orderNumber: string, status: string, trackingNumber?: string): Promise<string> {
    let message = `تحديث طلبكم ${orderNumber}:\n\n`;

    switch (status) {
      case 'processing':
        message += '🔄 طلبكم قيد المعالجة';
        break;
      case 'picked':
        message += '📦 تم تجهيز طلبكم';
        break;
      case 'packed':
        message += '📋 طلبكم جاهز للشحن';
        break;
      case 'shipped':
        message += `🚚 تم شحن طلبكم\nرقم التتبع: ${trackingNumber}`;
        break;
      case 'delivered':
        message += '✅ تم تسليم طلبكم بنجاح';
        break;
      default:
        message += `حالة الطلب: ${status}`;
    }

    message += '\n\nشكراً لاختياركم سايلوجيكس';

    return await this.sendTextMessage(to, message);
  }

  async sendDeliveryNotification(to: string, orderNumber: string, driverName: string, estimatedTime: string): Promise<string> {
    const message = `🚚 طلبكم ${orderNumber} في الطريق إليكم!

السائق: ${driverName}
الوقت المتوقع للوصول: ${estimatedTime}

يرجى التأكد من وجودكم في العنوان المحدد.

شكراً لكم`;

    return await this.sendTextMessage(to, message);
  }

  async sendDeliveryConfirmation(to: string, orderNumber: string): Promise<string> {
    const message = `✅ تم تسليم طلبكم ${orderNumber} بنجاح!

نتمنى أن تكونوا راضين عن خدماتنا.
نرحب بملاحظاتكم وتقييمكم.

شكراً لاختياركم سايلوجيكس`;

    return await this.sendTextMessage(to, message);
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      console.log('Processing WhatsApp webhook:', JSON.stringify(payload, null, 2));
      
      const entry = payload.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        for (const message of value.messages) {
          await this.processIncomingMessage(message, value.metadata);
        }
      }

      if (value?.statuses) {
        for (const status of value.statuses) {
          await this.processMessageStatus(status);
        }
      }
    } catch (error) {
      console.error("Failed to process WhatsApp webhook:", error);
      throw error;
    }
  }

  private async processIncomingMessage(message: any, metadata: any): Promise<void> {
    try {
      const from = message.from;
      const messageText = message.text?.body || '';
      const messageId = message.id;

      console.log(`Incoming WhatsApp message from ${from}: ${messageText}`);

      // Check if this is an address verification response
      if (messageText.toLowerCase().includes('صحيح') || 
          messageText.toLowerCase().includes('correct') ||
          messageText.toLowerCase().trim() === '✅') {
        await this.handleAddressConfirmation(from, messageText, true);
      } else if (messageText.length > 10) {
        // Assume this is a corrected address
        await this.handleAddressConfirmation(from, messageText, false);
      }

      // Store message for audit trail
      await storage.createEvent({
        eventId: 'WHATSAPP_MSG',
        eventType: 'whatsapp.message.received',
        entityType: 'customer',
        entityId: 0,
        payload: { from, messageText, messageId },
        source: 'whatsapp'
      });
    } catch (error) {
      console.error("Failed to process incoming WhatsApp message:", error);
    }
  }

  private async handleAddressConfirmation(customerPhone: string, response: string, isConfirmed: boolean): Promise<void> {
    try {
      // Find orders pending address verification for this customer
      const recentOrders = await storage.getRecentOrders(50);
      const pendingOrder = recentOrders.find(order => 
        order.customerPhone.includes(customerPhone.replace('966', '')) && 
        !order.nasVerified
      );

      if (!pendingOrder) {
        console.warn(`No pending address verification found for ${customerPhone}`);
        return;
      }

      // Use NAS service to handle the response
      const { nasService } = await import('./nasService');
      await nasService.handleWhatsAppResponse(pendingOrder.id, response);

    } catch (error) {
      console.error("Failed to handle address confirmation:", error);
    }
  }

  private async processMessageStatus(status: any): Promise<void> {
    try {
      const messageId = status.id;
      const statusType = status.status; // sent, delivered, read, failed
      
      console.log(`WhatsApp message ${messageId} status: ${statusType}`);

      // Update webhook logs or delivery status as needed
      await storage.createEvent({
        eventId: 'WHATSAPP_STATUS',
        eventType: 'whatsapp.status.update',
        entityType: 'notification',
        entityId: 0,
        payload: { messageId, status: statusType },
        source: 'whatsapp'
      });
    } catch (error) {
      console.error("Failed to process message status:", error);
    }
  }

  // Template message methods
  async sendTemplateMessage(to: string, templateName: string, language: string, components: any[]): Promise<string> {
    const message: WhatsAppMessage = {
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: language },
        components
      }
    };

    return await this.sendMessage(to, message);
  }

  // Bulk messaging for promotional or notification campaigns
  async sendBulkMessages(recipients: Array<{phone: string, message: string}>): Promise<{sent: number, failed: number}> {
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      try {
        await this.sendTextMessage(recipient.phone, recipient.message);
        sent++;
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to send message to ${recipient.phone}:`, error);
        failed++;
      }
    }

    console.log(`Bulk messaging completed: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }

  // Check if phone number is valid WhatsApp number
  async isValidWhatsAppNumber(phone: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      // This would call WhatsApp Business API to check if number exists
      // For now, return true for Saudi numbers
      return formattedPhone.startsWith('966') && formattedPhone.length >= 12;
    } catch (error) {
      console.error("Failed to validate WhatsApp number:", error);
      return false;
    }
  }
}

export const whatsappService = new WhatsAppService();
