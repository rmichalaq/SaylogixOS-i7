import fetch from 'node-fetch';

// SPL API Configuration (from your provided credentials)
const SPL_BASE_URL = 'https://api.address.gov.sa';
const SPL_PRODUCT_PATH = '/NationalAddress/FullNAByShortAddressforSaylogix';
const SPL_API_KEY = '932efe58b0ec40a1a9633a9ba9f19806';

// Test NAS codes
const TEST_NAS_CODES = [
  'RESB3139', // Your example
  'KUGA4386', // From existing mock data
  'RQRA6790', // From existing mock data
  'RIYD2342'  // From existing mock data
];

async function testSPLVerification(nasCode) {
  console.log(`\n🧪 Testing SPL API with NAS Code: ${nasCode}`);
  
  const url = `${SPL_BASE_URL}${SPL_PRODUCT_PATH}?shortaddress=${nasCode}&format=json&language=en&encode=utf8&api_key=${SPL_API_KEY}`;
  
  console.log(`📡 Request URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api_key': SPL_API_KEY
      }
    });
    
    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(response.headers));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error: ${response.status} - ${errorText}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`✅ SPL Response:`, JSON.stringify(data, null, 2));
    
    // Check if we got valid address data
    if (data && (data.Address || data.FullAddress)) {
      console.log(`✅ Valid address data received for ${nasCode}`);
      return data;
    } else {
      console.log(`⚠️ No valid address data in response for ${nasCode}`);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Network Error for ${nasCode}:`, error.message);
    return null;
  }
}

async function runSPLTests() {
  console.log('🚀 Starting SPL API Live Test');
  console.log('⚠️ Each call uses 1 quota from your 500/month limit');
  
  let successCount = 0;
  let failureCount = 0;
  
  for (const nasCode of TEST_NAS_CODES) {
    const result = await testSPLVerification(nasCode);
    
    if (result) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Wait 1 second between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Test Results Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📈 Success Rate: ${(successCount / TEST_NAS_CODES.length * 100).toFixed(1)}%`);
  
  if (successCount > 0) {
    console.log(`\n🎉 SPL API integration is working correctly!`);
    console.log(`✅ Base URL: ${SPL_BASE_URL}`);
    console.log(`✅ Product Path: ${SPL_PRODUCT_PATH}`);
    console.log(`✅ API Key: ${SPL_API_KEY.substring(0, 8)}...`);
  } else {
    console.log(`\n⚠️ All tests failed. Check API credentials and endpoints.`);
  }
}

// Run the tests
runSPLTests().catch(console.error);