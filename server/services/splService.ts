import fetch from 'node-fetch';

const SPL_API_URL = 'https://apina.address.gov.sa/NationalAddress/NationalAddressByShortAddress';
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
  city?: string;
  district?: string;
  street?: string;
  buildingNumber?: string;
}

export async function fetchAddressFromSPL(shortcode: string): Promise<SPLAddressData> {
  const startTime = Date.now();
  const logContext = {
    shortcode,
    timestamp: new Date().toISOString(),
    apiKey: SPL_API_KEY ? 'configured' : 'missing',
    url: '',
    requestHeaders: {},
    responseStatus: 0,
    responseHeaders: {},
    responseBody: '',
    error: null as any,
    duration: 0
  };

  try {
    if (!shortcode) {
      throw new Error('Missing NAS shortcode');
    }

    // If no API key is configured, throw error
    if (!SPL_API_KEY) {
      console.error('[SPL API] No API key configured');
      logContext.error = 'No API key configured';
      logContext.duration = Date.now() - startTime;
      console.log('[SPL API] Request Log:', JSON.stringify(logContext, null, 2));
      throw new Error('SPL API key not configured. Please contact system administrator.');
    }

    // Validate NAS code format (8 characters: 4 letters + 4 digits)
    const NAS_REGEX = /^[A-Z]{4}\d{4}$/i;
    if (!NAS_REGEX.test(shortcode)) {
      throw new Error('Invalid NAS code format. Expected format: ABCD1234');
    }

    // Build URL with query parameters as specified in Saudi Post API
    const url = `${SPL_API_URL}?format=json&language=en&encode=utf8&shortaddress=${shortcode.toUpperCase()}&api_key=${SPL_API_KEY}`;
    logContext.url = url.replace(SPL_API_KEY, 'REDACTED');

    const headers = {
      'Accept': 'application/json',
      'User-Agent': 'SaylogixOS/1.0',
      'Content-Type': 'application/json',
      'api_key': SPL_API_KEY // Add API key to headers as well for redundancy
    };
    logContext.requestHeaders = { ...headers, api_key: 'REDACTED' };

    console.log(`[SPL API] Request initiated for NAS: ${shortcode}`);
    console.log(`[SPL API] URL: ${logContext.url}`);
    console.log(`[SPL API] Request params: format=json, language=en, encode=utf8, shortaddress=${shortcode.toUpperCase()}, api_key=REDACTED`);
    
    const response = await fetch(url, { 
      headers,
      timeout: 30000 // 30 second timeout
    });

    logContext.responseStatus = response.status;
    logContext.responseHeaders = Object.fromEntries(response.headers.entries());
    
    console.log(`[SPL API] Response Status: ${response.status}`);
    console.log(`[SPL API] Response Headers:`, logContext.responseHeaders);

    const responseText = await response.text();
    logContext.responseBody = responseText.substring(0, 1000); // Log first 1000 chars

    if (!response.ok) {
      console.error(`[SPL API] Error Response (${response.status}):`, responseText);
      logContext.error = `API returned ${response.status}`;
      logContext.duration = Date.now() - startTime;
      console.log('[SPL API] Full Request Log:', JSON.stringify(logContext, null, 2));
      
      // Throw specific errors for different status codes
      if (response.status === 401) {
        throw new Error('Saudi Post API authentication failed. Please check your API key.');
      } else if (response.status === 404) {
        throw new Error('NAS code not found in Saudi Post database.');
      } else if (response.status === 500) {
        throw new Error('Saudi Post API server error. Please try again later.');
      }
      
      throw new Error(`Saudi Post API Error: ${response.status} ${responseText}`);
    }

    console.log(`[SPL API] Raw Response (first 500 chars): ${responseText.substring(0, 500)}`);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error(`[SPL API] JSON Parse Error:`, parseError);
      console.error(`[SPL API] Invalid JSON Response:`, responseText);
      logContext.error = `JSON parse error: ${parseError.message}`;
      logContext.duration = Date.now() - startTime;
      console.log('[SPL API] Full Request Log:', JSON.stringify(logContext, null, 2));
      throw new Error('Invalid response format from Saudi Post API.');
    }

    console.log(`[SPL API] Parsed Response Data:`, JSON.stringify(data, null, 2));

    // Validate expected fields exist - handle various response formats
    if (!data.Address && !data.FullAddress && !data.address && !data.fullAddress) {
      console.warn(`[SPL API] Missing address fields in response`);
      console.warn(`[SPL API] Available fields:`, Object.keys(data));
      logContext.error = 'Missing address fields in response';
      logContext.duration = Date.now() - startTime;
      console.log('[SPL API] Full Request Log:', JSON.stringify(logContext, null, 2));
      throw new Error('Incomplete address data received from Saudi Post API.');
    }

    // Parse Saudi Post API response format with multiple fallbacks
    const result = {
      shortCode: shortcode.toUpperCase(),
      fullAddress: data.Address || data.FullAddress || data.address || data.fullAddress || '',
      postalCode: data.PostCode || data.PostalCode || data.postCode || data.postalCode || '',
      additionalCode: data.AdditionalNumber || data.AdditionalCode || data.additionalNumber || data.additionalCode || '',
      coordinates: {
        lat: parseFloat(data.Latitude || data.latitude || data.lat || '0') || undefined,
        lng: parseFloat(data.Longitude || data.longitude || data.lng || '0') || undefined
      },
      city: data.City || data.city || '',
      district: data.District || data.district || '',
      street: data.Street || data.street || '',
      buildingNumber: data.BuildingNumber || data.buildingNumber || ''
    };

    logContext.duration = Date.now() - startTime;
    console.log(`[SPL API] Success: Verified NAS ${shortcode} in ${logContext.duration}ms`);
    console.log(`[SPL API] Result:`, JSON.stringify(result, null, 2));
    console.log('[SPL API] Full Request Log:', JSON.stringify(logContext, null, 2));
    
    return result;

  } catch (error) {
    logContext.error = error.message;
    logContext.duration = Date.now() - startTime;
    console.error(`[SPL API] Request failed for ${shortcode} after ${logContext.duration}ms:`, error);
    console.log('[SPL API] Full Request Log:', JSON.stringify(logContext, null, 2));
    
    // Re-throw the error to be handled by the calling function
    throw error;
  }
}

function getMockAddressData(shortcode: string): SPLAddressData {
  const mockAddresses = {
    'KUGA4386': {
      fullAddress: '4386 Al Nasbah 53, 6887, Al Muruj Dist., UMLUJ, Tabuk, 48333',
      postalCode: '48333',
      additionalCode: '6887',
      coordinates: { lat: 25.0218, lng: 37.2685 },
      city: 'UMLUJ',
      district: 'Al Muruj District',
      street: 'Al Nasbah Street',
      buildingNumber: '4386'
    },
    'RQRA6790': {
      fullAddress: '6790 Al Badour, Ar Rawabi RQRA6790 Riyadh 14213',
      postalCode: '14213',
      additionalCode: '6790',
      coordinates: { lat: 24.7136, lng: 46.6753 },
      city: 'Riyadh',
      district: 'Ar Rawabi',
      street: 'Al Badour Street',
      buildingNumber: '6790'
    },
    'RIYD2342': {
      fullAddress: '2342 King Fahd Road, Riyadh 12345',
      postalCode: '12345',
      additionalCode: '2342',
      coordinates: { lat: 24.7136, lng: 46.6753 },
      city: 'Riyadh',
      district: 'Al Olaya',
      street: 'King Fahd Road',
      buildingNumber: '2342'
    }
  };

  const mockData = mockAddresses[shortcode.toUpperCase()];
  if (mockData) {
    return {
      shortCode: shortcode.toUpperCase(),
      ...mockData
    };
  }

  // Generic mock data for any other NAS code
  return {
    shortCode: shortcode.toUpperCase(),
    fullAddress: `Mock Address for ${shortcode.toUpperCase()}, Saudi Arabia`,
    postalCode: '12345',
    additionalCode: '1234',
    coordinates: {
      lat: 24.7136,
      lng: 46.6753
    },
    city: 'Riyadh',
    district: 'Generic District',
    street: 'Generic Street',
    buildingNumber: '1234'
  };
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