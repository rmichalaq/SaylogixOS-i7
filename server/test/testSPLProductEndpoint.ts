/**
 * TEST FILE - DO NOT USE IN PRODUCTION
 * This file tests the product-specific SPL endpoint for Saylogix
 * Product: FullNAByShortAddressforSaylogix
 */

import fetch from 'node-fetch';

const PRODUCT_ENDPOINT = 'https://apina.address.gov.sa/NationalAddress/FullNAByShortAddressforSaylogix';
const TEST_API_KEY = '932efe58b0ec40a1a9633a9ba9f19806';
const TEST_NAS_CODE = 'RESB3139';

interface TestResult {
  timestamp: string;
  endpoint: string;
  nasCode: string;
  requestUrl: string;
  responseStatus: number;
  responseHeaders: any;
  responseBody: string;
  success: boolean;
  error?: string;
  duration: number;
}

export async function testSPLProductEndpoint(): Promise<TestResult> {
  const startTime = Date.now();
  const result: TestResult = {
    timestamp: new Date().toISOString(),
    endpoint: 'FullNAByShortAddressforSaylogix',
    nasCode: TEST_NAS_CODE,
    requestUrl: '',
    responseStatus: 0,
    responseHeaders: {},
    responseBody: '',
    success: false,
    duration: 0
  };

  try {
    // Build test URL with all required parameters
    const url = `${PRODUCT_ENDPOINT}?format=json&language=en&encode=utf8&shortaddress=${TEST_NAS_CODE}&api_key=${TEST_API_KEY}`;
    result.requestUrl = url.replace(TEST_API_KEY, 'REDACTED');

    console.log(`[SPL PRODUCT TEST] Testing product endpoint...`);
    console.log(`[SPL PRODUCT TEST] URL: ${result.requestUrl}`);
    console.log(`[SPL PRODUCT TEST] NAS Code: ${TEST_NAS_CODE}`);
    console.log(`[SPL PRODUCT TEST] Timestamp: ${result.timestamp}`);

    // Make the request
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SaylogixOS-Test/1.0',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    result.responseStatus = response.status;
    result.responseHeaders = Object.fromEntries(response.headers.entries());
    
    const responseText = await response.text();
    result.responseBody = responseText.substring(0, 500); // First 500 chars for logging

    console.log(`[SPL PRODUCT TEST] Response Status: ${response.status}`);
    console.log(`[SPL PRODUCT TEST] Response Headers:`, result.responseHeaders);
    console.log(`[SPL PRODUCT TEST] Response Body (first 500 chars):`, result.responseBody);

    if (response.ok) {
      result.success = true;
      console.log(`[SPL PRODUCT TEST] ✅ SUCCESS - Product endpoint working`);
      
      // Try to parse JSON response
      try {
        const data = JSON.parse(responseText);
        console.log(`[SPL PRODUCT TEST] Parsed Data Keys:`, Object.keys(data));
      } catch (e) {
        console.log(`[SPL PRODUCT TEST] Response is not JSON format`);
      }
    } else {
      result.error = `HTTP ${response.status}: ${responseText}`;
      console.error(`[SPL PRODUCT TEST] ❌ FAILED - ${result.error}`);
    }

  } catch (error) {
    result.error = error.message;
    console.error(`[SPL PRODUCT TEST] ❌ ERROR:`, error);
  } finally {
    result.duration = Date.now() - startTime;
    console.log(`[SPL PRODUCT TEST] Test completed in ${result.duration}ms`);
  }

  return result;
}

// Test execution function - call this to run the test
export async function runProductEndpointTest() {
  console.log('='.repeat(60));
  console.log('SPL PRODUCT ENDPOINT TEST - NON-PRODUCTION');
  console.log('Testing: FullNAByShortAddressforSaylogix');
  console.log('='.repeat(60));
  
  const result = await testSPLProductEndpoint();
  
  console.log('\n📊 TEST SUMMARY:');
  console.log(`- Success: ${result.success ? '✅ YES' : '❌ NO'}`);
  console.log(`- Status Code: ${result.responseStatus}`);
  console.log(`- Duration: ${result.duration}ms`);
  console.log(`- Error: ${result.error || 'None'}`);
  console.log('='.repeat(60));
  
  return result;
}

// Only run if called directly
// For ESM modules, check if file is being run directly
import { fileURLToPath } from 'url';
import { argv } from 'process';

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  runProductEndpointTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Test failed:', err);
      process.exit(1);
    });
}