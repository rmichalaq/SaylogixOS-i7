# 🧪 Replit Test Prompt – SPL Live Product Endpoint (Production Safe)

> ⚠️ This prompt is for testing the **live SPL product endpoint** from Replit.  
> All test calls will count toward your **500/month quota**, so use carefully.

---

## 🔐 Use These .env Variables

Create or update your `.env` file in Replit:

```
SPL_BASE_URL=https://api.address.gov.sa
SPL_PRODUCT_PATH=/NationalAddress/FullNAByShortAddressforSaylogix
SPL_API_KEY=932efe58b0ec40a1a9633a9ba9f19806
```

> These values are pulled directly from the official SPL production configuration for Saylogix.

---

## 🧪 Sample Test Code (Node.js Fetch)

```js
const fetch = require('node-fetch');

const BASE_URL = process.env.SPL_BASE_URL;
const ENDPOINT = process.env.SPL_PRODUCT_PATH;
const API_KEY = process.env.SPL_API_KEY;

const NAS_CODE = 'RESB3139';

async function testSPLVerification() {
  const url = `${BASE_URL}${ENDPOINT}?shortaddress=${NAS_CODE}&format=json&language=en&encode=utf8&api_key=${API_KEY}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api_key': API_KEY
    }
  });

  const data = await response.json();
  console.log('✅ SPL Response:', data);
}

testSPLVerification();
```

---

## ✅ Test Protocol

- Only run **one call per valid NAS** unless retrying a known failure
- Do not store response into `OrdersDB` or `VerifiedAddressesDB`
- Log output to console only
- Check **SPL Product dashboard** to verify the request was counted

---

## 📉 Notes

- You are limited to 500 API calls/month
- Each test call **uses 1 quota**
- Use `console.log()` to verify results — no writes to production

---

## 🎯 Objective

To ensure:
- Correct use of the new `https://api.address.gov.sa` base
- Correct routing through `FullNAByShortAddressforSaylogix`
- SPL dashboard logs the call under your Product

