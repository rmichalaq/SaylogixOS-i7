import fetch from 'node-fetch';

const SPL_API_URL = 'https://api.splonline.com.sa/v1/addresses';
const SPL_API_TOKEN = process.env.SPL_API_TOKEN;

export interface SPLAddressResponse {
  shortCode: string;
  fullAddress: string;
  postalCode: string;
  additionalCode: string;
  coordinates: {
    lat?: number;
    lng?: number;
  };
}

export class SPLService {
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    this.apiToken = SPL_API_TOKEN || '';
    this.baseUrl = SPL_API_URL;
    
    if (!this.apiToken) {
      console.warn('SPL API token not configured. Please set SPL_API_TOKEN environment variable.');
    }
  }

  async fetchAddressFromSPL(shortcode: string): Promise<SPLAddressResponse> {
    if (!shortcode) {
      throw new Error('Missing NAS shortcode');
    }

    if (!this.apiToken) {
      throw new Error('SPL API token not configured. Please set SPL_API_TOKEN environment variable.');
    }

    const url = `${this.baseUrl}?shortcode=${shortcode}`;
    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`SPL API Error: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      return {
        shortCode: data.shortcode,
        fullAddress: `${data.buildingNumber}, ${data.street}, ${data.district}, ${data.city}`,
        postalCode: data.postalCode,
        additionalCode: data.additionalCode,
        coordinates: {
          lat: data.coordinates?.lat,
          lng: data.coordinates?.lng
        }
      };
    } catch (error) {
      console.error('SPL API request failed:', error);
      throw error;
    }
  }

  async validateAddress(shortcode: string): Promise<boolean> {
    try {
      await this.fetchAddressFromSPL(shortcode);
      return true;
    } catch (error) {
      console.error('Address validation failed:', error);
      return false;
    }
  }

  async batchValidateAddresses(shortcodes: string[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < shortcodes.length; i += batchSize) {
      const batch = shortcodes.slice(i, i + batchSize);
      const batchPromises = batch.map(async (shortcode) => {
        try {
          const isValid = await this.validateAddress(shortcode);
          results[shortcode] = isValid;
        } catch (error) {
          results[shortcode] = false;
        }
      });
      
      await Promise.all(batchPromises);
    }
    
    return results;
  }
}

export const splService = new SPLService();