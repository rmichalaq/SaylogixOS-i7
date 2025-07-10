# 🧪 Replit Debug Prompt – SPL NAS Verification API Usage Issues

We have observed unexpected outcomes in our usage of the SPL National Address API (support.address.gov.sa). Out of **29 total requests**:
- ✅ 2 were **successful**
- ❌ 4 were **blocked**
- ❓ 23 were marked as **“other”** (likely malformed or failed silently)

This prompt is to **verify implementation compliance with the SPL OpenAPI spec** and identify why most calls are failing.

---

## ✅ Confirmed API Specification (from support.json)

- **Base URL:** `https://apina.address.gov.sa/NationalAddress/NationalAddressByShortAddress`
- **Endpoint:** `GET /NationalAddressByShortAddress`
- **Required Query Parameters:**
  - `shortaddress=XXXXNNNN`
  - `format=json` (MUST be used to get a proper structured response)
  - `encode=utf8` (to avoid charset mismatch)
  - `language=en` (optional but should be consistent)
- **API Key Location:** Either
  - Header: `api_key: YOUR_KEY`
  - Query: `&api_key=YOUR_KEY`

---

## ❗ Questions to Resolve

### 1. Are we always passing `format=json`?
- This is explicitly required for proper output formatting.
- If omitted or set to `xml`, system may treat result as “unsupported”.

### 2. Are we setting `encode=utf8` consistently?
- Default is `windows-1256` → may break parser if not overridden

### 3. Are we double-sending the API key?
- Sending in both header + query is safe
- Not sending it = blocked or “other”

### 4. Are we calling the correct endpoint?
Ensure all requests go to:

```
https://apina.address.gov.sa/NationalAddress/NationalAddressByShortAddress?shortaddress=XXXX0000&format=json&encode=utf8&language=en
```

### 5. Are NAS codes always in valid format?
- RegEx: `^[A-Z]{4}[0-9]{4}$`
- Log actual shortaddress values attempted (verify not empty or invalid)

---

## 🛠 Debugging Actions Required

- [ ] Log all 29 request payloads and HTTP status codes
- [ ] Compare headers + query string from failed vs successful attempts
- [ ] Add console logging for `shortaddress`, `api_key`, `format`, `encode`
- [ ] Ensure fallback to `json` and `utf8` is **enforced**, not optional
- [ ] Store raw SPL response for each request in `verificationAttempts[]` for later auditing

---

## ✅ Recommendation

### Always use this standard request format:

```
GET https://apina.address.gov.sa/NationalAddress/NationalAddressByShortAddress
  ?shortaddress=XXXX1234
  &format=json
  &language=en
  &encode=utf8
  &api_key=YOUR_KEY
```

OR send the key as a header:
```
api_key: YOUR_KEY
```

---

## 🎯 Goal

Ensure we:
- Remove reliance on mock or malformed requests
- Maximize SPL call success rate
- Improve observability of verification outcomes

