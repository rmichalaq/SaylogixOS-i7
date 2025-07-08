import { storage } from "../storage";

interface Coordinates {
  lat: number;
  lng: number;
}

interface GoogleMapsGeocodeResponse {
  results: Array<{
    geometry: {
      location: Coordinates;
    };
    formatted_address: string;
  }>;
  status: string;
}

interface GoogleMapsDistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      status: string;
    }>;
  }>;
  status: string;
}

export class GoogleMapsService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || "";
    
    if (!this.apiKey) {
      console.warn("Google Maps API key not configured. Please set GOOGLE_MAPS_API_KEY environment variable.");
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private async updateIntegrationStatus(success: boolean, message: string): Promise<void> {
    try {
      const integration = await storage.getIntegration("google_maps");
      if (integration) {
        const updates = success
          ? { successCount: integration.successCount + 1, lastError: null, lastSyncAt: new Date() }
          : { failureCount: integration.failureCount + 1, lastError: message };
        
        await storage.updateIntegration(integration.id, updates);
      }
    } catch (error) {
      console.error("Failed to update integration status:", error);
    }
  }

  async geocodeAddress(address: any): Promise<Coordinates | null> {
    if (!this.isConfigured()) {
      console.log("Google Maps not configured, skipping geocoding");
      return null;
    }

    try {
      // Format address string
      const addressString = [
        address.address1,
        address.address2,
        address.city,
        address.province,
        address.country,
        address.zip
      ].filter(Boolean).join(", ");

      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressString)}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data: GoogleMapsGeocodeResponse = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const coordinates = data.results[0].geometry.location;
        console.log(`Geocoded address: ${addressString} -> ${coordinates.lat}, ${coordinates.lng}`);
        
        await this.updateIntegrationStatus(true, `Address geocoded successfully`);
        return coordinates;
      } else {
        console.warn(`Geocoding failed for address: ${addressString}, status: ${data.status}`);
        await this.updateIntegrationStatus(false, `Geocoding failed: ${data.status}`);
        return null;
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      await this.updateIntegrationStatus(false, `Geocoding error: ${error.message}`);
      return null;
    }
  }

  async calculateDistanceMatrix(
    origins: Coordinates[],
    destinations: Coordinates[]
  ): Promise<GoogleMapsDistanceMatrixResponse | null> {
    if (!this.isConfigured()) {
      console.log("Google Maps not configured, skipping distance calculation");
      return null;
    }

    try {
      const originsStr = origins.map(coord => `${coord.lat},${coord.lng}`).join("|");
      const destinationsStr = destinations.map(coord => `${coord.lat},${coord.lng}`).join("|");

      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originsStr}&destinations=${destinationsStr}&key=${this.apiKey}&units=metric`;
      
      const response = await fetch(url);
      const data: GoogleMapsDistanceMatrixResponse = await response.json();

      if (data.status === "OK") {
        console.log(`Calculated distance matrix for ${origins.length} origins and ${destinations.length} destinations`);
        await this.updateIntegrationStatus(true, `Distance matrix calculated successfully`);
        return data;
      } else {
        console.warn(`Distance matrix calculation failed, status: ${data.status}`);
        await this.updateIntegrationStatus(false, `Distance matrix failed: ${data.status}`);
        return null;
      }
    } catch (error) {
      console.error("Error calculating distance matrix:", error);
      await this.updateIntegrationStatus(false, `Distance matrix error: ${error.message}`);
      return null;
    }
  }

  async optimizeRoute(orderIds: number[]): Promise<{
    optimizedOrder: number[];
    totalDistance: number;
    totalDuration: number;
  } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      // Get orders with coordinates
      const orders = [];
      for (const orderId of orderIds) {
        const order = await storage.getOrder(orderId);
        if (order && order.coordinates) {
          orders.push({ id: orderId, coordinates: order.coordinates as Coordinates });
        }
      }

      if (orders.length < 2) {
        console.log("Need at least 2 orders with coordinates for route optimization");
        return null;
      }

      // Calculate distance matrix
      const coordinates = orders.map(o => o.coordinates);
      const matrix = await this.calculateDistanceMatrix(coordinates, coordinates);

      if (!matrix) {
        return null;
      }

      // Simple greedy optimization (for production, use more sophisticated algorithms)
      const optimized = this.greedyTSP(matrix, orders.map(o => o.id));
      
      await this.updateIntegrationStatus(true, `Route optimized for ${orders.length} orders`);
      return optimized;
    } catch (error) {
      console.error("Error optimizing route:", error);
      await this.updateIntegrationStatus(false, `Route optimization error: ${error.message}`);
      return null;
    }
  }

  private greedyTSP(matrix: GoogleMapsDistanceMatrixResponse, orderIds: number[]): {
    optimizedOrder: number[];
    totalDistance: number;
    totalDuration: number;
  } {
    const n = orderIds.length;
    const visited = new Array(n).fill(false);
    const result = [0]; // Start from first order
    visited[0] = true;
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 1; i < n; i++) {
      let minDist = Infinity;
      let nextIndex = -1;

      for (let j = 0; j < n; j++) {
        if (!visited[j]) {
          const currentIndex = result[result.length - 1];
          const element = matrix.rows[currentIndex]?.elements[j];
          
          if (element && element.status === "OK" && element.distance.value < minDist) {
            minDist = element.distance.value;
            nextIndex = j;
          }
        }
      }

      if (nextIndex !== -1) {
        result.push(nextIndex);
        visited[nextIndex] = true;
        
        const currentIndex = result[result.length - 2];
        const element = matrix.rows[currentIndex]?.elements[nextIndex];
        if (element && element.status === "OK") {
          totalDistance += element.distance.value;
          totalDuration += element.duration.value;
        }
      }
    }

    return {
      optimizedOrder: result.map(index => orderIds[index]),
      totalDistance,
      totalDuration,
    };
  }

  async getOrdersWithCoordinates(): Promise<any[]> {
    try {
      const orders = await storage.getOrdersForMapping();
      return orders.filter(order => order.coordinates);
    } catch (error) {
      console.error("Error fetching orders with coordinates:", error);
      return [];
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return { success: false, message: "Google Maps API key not configured" };
    }

    try {
      // Test geocoding with a simple address
      const testAddress = "Riyadh, Saudi Arabia";
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${this.apiKey}`;
      
      const response = await fetch(url);
      const data: GoogleMapsGeocodeResponse = await response.json();

      if (data.status === "OK") {
        return {
          success: true,
          message: "Google Maps API connection successful",
        };
      } else {
        return {
          success: false,
          message: `API test failed: ${data.status}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }
}

export const googleMapsService = new GoogleMapsService();