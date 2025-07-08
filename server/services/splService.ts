import fetch from 'node-fetch';

const SPL_API_URL = 'https://api.splonline.com.sa/v1/addresses';
const SPL_API_TOKEN = process.env.SPL_API_TOKEN;

export interface SPLAddressData {
  shortCode: string;
  fullAddress: string;
  postalCode: string;
  additionalCode: string;
  coordinates: {
    lat?: number;
    lng?: number;
  };
}

export async function fetchAddressFromSPL(shortcode: string): Promise<SPLAddressData> {
  if (!shortcode) {
    throw new Error('Missing NAS shortcode');
  }

  if (!SPL_API_TOKEN) {
    throw new Error('SPL API token not configured. Please set SPL_API_TOKEN environment variable.');
  }

  const url = `${SPL_API_URL}?shortcode=${shortcode}`;
  const headers = {
    'Authorization': `Bearer ${SPL_API_TOKEN}`,
    'Accept': 'application/json'
  };

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SPL API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as any;

    return {
      shortCode: data.shortcode || shortcode,
      fullAddress: `${data.buildingNumber || ''}, ${data.street || ''}, ${data.district || ''}, ${data.city || ''}`.replace(/^, |, $|, , /g, ', ').trim(),
      postalCode: data.postalCode || '',
      additionalCode: data.additionalCode || '',
      coordinates: {
        lat: data.coordinates?.lat,
        lng: data.coordinates?.lng
      }
    };
  } catch (error) {
    console.error('SPL API Error:', error);
    throw new Error(`Failed to fetch address from SPL: ${error.message}`);
  }
}

export async function testSPLConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!SPL_API_TOKEN) {
      return {
        success: false,
        message: 'SPL API token not configured'
      };
    }

    // Test with a sample NAS code
    const testNas = 'RIYD2342';
    await fetchAddressFromSPL(testNas);
    
    return {
      success: true,
      message: 'SPL connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}