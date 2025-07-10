import fetch from 'node-fetch';

const SPL_API_URL = 'http://apina.address.gov.sa/NationalAddress/NationalAddressByShortAddress/NationalAddressByShortAddress';
const SPL_API_KEY = process.env.SPL_API_KEY;

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

  if (!SPL_API_KEY) {
    throw new Error('SPL API key not configured. Please set SPL_API_KEY environment variable.');
  }

  // Validate NAS code format (8 characters: 4 letters + 4 digits)
  const NAS_REGEX = /^[A-Z]{4}\d{4}$/i;
  if (!NAS_REGEX.test(shortcode)) {
    throw new Error('Invalid NAS code format. Expected format: ABCD1234');
  }

  // Build URL with query parameters as specified in Saudi Post API
  const url = `${SPL_API_URL}?format=json&language=en&encode=utf8&shortaddress=${shortcode.toUpperCase()}&api_key=${SPL_API_KEY}`;

  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'SaylogixOS/1.0'
  };

  try {
    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Saudi Post API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as any;

    // Parse Saudi Post API response format
    return {
      shortCode: shortcode.toUpperCase(),
      fullAddress: data.Address || '',
      postalCode: data.PostCode || '',
      additionalCode: data.AdditionalNumber || '',
      coordinates: {
        lat: data.Latitude ? parseFloat(data.Latitude) : undefined,
        lng: data.Longitude ? parseFloat(data.Longitude) : undefined
      }
    };
  } catch (error) {
    console.error('Saudi Post API Error:', error);
    throw new Error(`Failed to fetch address from Saudi Post: ${error.message}`);
  }
}

export function extractNASFromAddress(address: string): string | null {
  if (!address) return null;
  
  // RegEx to find 8-character NAS codes (4 letters + 4 digits)
  const NAS_REGEX = /\b[A-Z]{4}\d{4}\b/i;
  const match = address.match(NAS_REGEX);
  
  return match ? match[0].toUpperCase() : null;
}

export async function testSPLConnection(): Promise<{ success: boolean; message: string }> {
  try {
    if (!SPL_API_KEY) {
      return {
        success: false,
        message: 'SPL API key not configured'
      };
    }

    // Test with a sample NAS code
    const testNas = 'RIYD2342';
    await fetchAddressFromSPL(testNas);
    
    return {
      success: true,
      message: 'Saudi Post API connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}