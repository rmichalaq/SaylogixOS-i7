
# 📦 SaylogixOS — Unified NAS Verification Prompt (Replit)

## ✅ TASK: Refactor and unify the NAS verification screen

### 1. 🔧 Menu & Navigation
- Rename `"Address Verify (NAS)"` to `"Verify NAS"`
- Delete `"SPL Address Verification"` menu
- Under `"Verify NAS"`, implement:
  - `Single Verification` tab (default active)

---

### 2. 📦 API Integration (SPL Connector)
Use the following backend module to fetch NAS (shortcode) data from SPL:

```ts
import fetch from 'node-fetch'

const SPL_API_URL = 'https://api.splonline.com.sa/v1/addresses'
const SPL_API_TOKEN = process.env.SPL_API_TOKEN

export async function fetchAddressFromSPL(shortcode) {
  if (!shortcode) throw new Error('Missing NAS')

  const url = `${SPL_API_URL}?shortcode=${shortcode}`
  const headers = {
    'Authorization': `Bearer ${SPL_API_TOKEN}`,
    'Accept': 'application/json'
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`SPL API Error: ${response.status} ${errorText}`)
  }

  const data = await response.json()

  return {
    shortCode: data.shortcode,
    fullAddress: `${data.buildingNumber}, ${data.street}, ${data.district}, ${data.city}`,
    postalCode: data.postalCode,
    additionalCode: data.additionalCode,
    coordinates: {
      lat: data.coordinates?.lat,
      lng: data.coordinates?.lng
    }
  }
}
```

---

### 3. 🧠 Verification Logic
When user enters a NAS shortcode and clicks **Verify**, execute:
1. Try SPL API (see above)
2. If fails, fallback to internal NAS verification (if exists)
3. Display result:
   - Full address
   - Postal code
   - Additional code
   - Coordinates (lat/lng)
   - Source: `SPL` or `fallback`

---

### 4. 🛒 Shopify & Marketplace Order NAS Parsing
- Every fetched order from Shopify must be reflected in the **Verify NAS** screen
- Implement function to:
  - Inspect address fields (shipping address, notes, etc.)
  - Search for valid **NAS** (format: `ABCD1234`, where:
    - First 4 characters are letters `[A-Z]{4}`
    - Last 4 characters are digits `[0-9]{4}`
  - If found, trigger SPL verification logic
  - Replace shipping address in the order with SPL-verified full address
  - Mark order as `verified` in NAS module
- Orders without a valid NAS must be flagged as `pending verification`

---

### 5. 🔐 SPL API Configuration
Inside `Settings > Integrations`:
- Add SPL card:
  - Toggle on/off
  - Token input field
  - Save + Test connection button
  - Show status: ✅ Last tested success / ❌ Last error

---

### 6. 🧪 Testing & Logs
- Console logs for SPL errors/success
- UI handles SPL failures without crashing
- Keep API token hidden from frontend

---

### 7. 🚫 Remove Redundant/Incorrect UI
- ❌ Remove "SPL Address Verification" menu
  > “NAS = National Address Service” → ✅ “NAS = National Address Shortcode”

---

### ✅ Expected Outcome
- Cleaned-up, unified NAS verification UI
- SPL integration fully working with API key config
- Accurate NAS detection from marketplace orders
- Verified addresses automatically used for shipping
