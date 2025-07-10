# 📬 SaylogixOS – SPL National Address API Integration

This document explains how to set up and use the **SPL National Address API** (Saudi Post) to verify addresses via NAS shortcode in your Saylogix app.

---

## 🔧 1. API Overview

- **Base URL:**  
  `http://apina.address.gov.sa/NationalAddress/NationalAddressByShortAddress`

- **Endpoint:**  
  `GET /NationalAddressByShortAddress`

- **Purpose:**  
  Fetch full address from 8-character NAS code (e.g. `ABCD1234`)

---

## 🔐 2. Authentication

The API key can be passed either:

- **As a Header:**  
  `api_key: YOUR_API_KEY`

- **Or as a Query Param:**  
  `?api_key=YOUR_API_KEY`

You already have this API key saved in your Saylogix integrations table or `.env` file.

---

## 🛠 3. Full Request Example

```
GET http://apina.address.gov.sa/NationalAddress/NationalAddressByShortAddress/NationalAddressByShortAddress
    ?format=json
    &language=en
    &encode=utf8
    &shortaddress=ABCD1234
    &api_key=YOUR_API_KEY
```

Or using headers:
```http
GET http://apina.address.gov.sa/NationalAddress/NationalAddressByShortAddress/NationalAddressByShortAddress?format=json&language=en&encode=utf8&shortaddress=ABCD1234
Headers:
  api_key: YOUR_API_KEY
  Accept: application/json
```

---

## 🧠 4. In-App Integration Steps

### ✅ Extract NAS Code from Order Address
Use a RegEx to find 8-character codes in order addresses:
```ts
const NAS_REGEX = /\b[A-Z]{4}\d{4}\b/i
const nasCode = orderAddress.match(NAS_REGEX)?.[0]
```

### ✅ Call SPL API
```ts
const url = `http://apina.address.gov.sa/.../NationalAddressByShortAddress?format=json&language=en&encode=utf8&shortaddress=${nasCode}`
const headers = { 'api_key': YOUR_API_KEY }

const response = await fetch(url, { headers })
```

### ✅ Replace and Store
- Store the verified address in `VerifiedAddressesDB`
- Overwrite the order's `shippingAddress`
- Add `verifiedNAS: true` and `coordinates` to the order record

---

## 💾 5. Future Enhancements

- Auto-retry if SPL fails
- Alert if address mismatch
- Manual override fallback
- Sync verified address for reuse in future orders

---

## 🧪 6. Local Testing Tools

Use **Postman** or `curl` to verify manually:
```bash
curl -X GET "http://apina.address.gov.sa/...&shortaddress=ABCD1234&api_key=YOUR_API_KEY"
```

---

## ✅ Done

You're ready to fetch and verify addresses using Saudi NAS codes. This unlocks faster courier assignment, better SLA performance, and fewer customer service complaints.

