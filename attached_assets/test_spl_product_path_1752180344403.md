# 🧪 Test Instruction – Product-Specific SPL Endpoint for Saylogix

> This file outlines a **non-production test** for verifying the `FullNAByShortAddressforSaylogix` product-specific endpoint provided by SPL.  
> ❗️Do not change any production logic. This is for validation only.

---

## 📦 Product Subscription Details (SPL)

- **Product Name**: `FullNAByShortAddressforSaylogix`
- **Primary API Key**: `932efe58b0ec40a1a9633a9ba9f19806`

---

## 🎯 Test Objective

To confirm that API calls routed through this **product path**:
```
/NationalAddress/FullNAByShortAddressforSaylogix
```
…will be properly **counted in the "Products" tab** in the SPL dashboard.

---

## ✅ Test URL Format (RESB3139 Example)

```
https://apina.address.gov.sa/NationalAddress/FullNAByShortAddressforSaylogix?format=json&language=en&encode=utf8&shortaddress=RESB3139&api_key=932efe58b0ec40a1a9633a9ba9f19806
```

✅ Parameters:
- `shortaddress=RESB3139`
- `format=json`
- `language=en`
- `encode=utf8`
- `api_key=...` (passed in query or header)

---

## 🧪 How to Run Test (Safely)

1. Copy the test URL above
2. Use in Postman, cURL, or a local Replit-only script
3. Do **NOT**:
   - Modify `verifyNASForOrder()` logic
   - Replace the main endpoint in production
   - Store the test result in `OrdersDB` or `VerifiedAddressesDB`

---

## 📝 What to Log (Internally)

- Request timestamp
- Full test URL (with redacted key)
- Response code (expecting `200 OK`)
- Response body or structure
- Whether SPL Product tab registered the call

---

## 🧯 Rollback Protection

- This test must not interfere with any live order flow
- Must not overwrite any verified address fields
- Must not create noise in operational logs or DBs

---

## ✅ Success Criteria

| Step                   | Pass Condition                     |
|------------------------|-------------------------------------|
| Call returns 200       | SPL recognizes and parses NAS       |
| Product tab updates    | Usage appears under "Products" tab  |
| No side effects        | Live orders are untouched           |

---

## 🧠 Post-Test Action

If successful:
- We will update documentation to adopt this path officially
- Future calls will route via product endpoint for analytics + billing

