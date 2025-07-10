# 📦 SaylogixOS – Verified NAS Address Implementation

This document defines the correct behavior and field usage for verifying addresses using Saudi NAS codes, storing verified data, and handling it across OMS → WMS → DMS → Dispatch modules.

---

## ✅ Address Fields: Canonical Names

### From Marketplace Order (`OrdersDB`)
```json
{
  "orderId": "string",
  "originalAddress": "4386 Al Nasbah St, UMLUJ, 48333",
  "shippingCoordinates": null,
  "verifiedNASStatus": "pending" | "verified" | "failed",
  "verifiedAddressId": "string|null"
}
```

---

### From SPL API (`VerifiedAddressesDB`)
```json
{
  "nasCode": "KUGA4386",
  "fullAddress": "4386 Al Nasbah 53, 6887, Al Muruj Dist., UMLUJ, Tabuk, 48333",
  "postalCode": "48333",
  "additionalCode": "6887",
  "latitude": 25.0218,
  "longitude": 37.2685,
  "city": "UMLUJ",
  "district": "Al Muruj District",
  "street": "Al Nasbah Street",
  "buildingNumber": "4386"
}
```

> ⚠️ No derived fields like `landmark`, `municipality`, `region`, or `isActive` should be shown in the UI.

---

## 🔄 Status Workflow Logic

### Address Verification Status:
- `"pending"` → Awaiting NAS code parsing or manual entry
- `"verified"` → NAS validated via SPL API
- `"failed"` → Invalid NAS, no SPL result, or timeout

---

## 🧠 Verification Triggers

### Automatic:
- Triggered immediately after importing a new order from any marketplace
- If NAS is found → call SPL API
- If NAS is missing → still show in `PendingVerifyNAS` queue

### Manual:
- Operator can paste NAS code into drawer UI
- Verifies address on the spot

---

## 🧭 Dispatch Behavior Logic

| Condition                       | Address Used         | Action                                                      |
|--------------------------------|----------------------|-------------------------------------------------------------|
| `verifiedNASStatus == "verified"` | `verifiedAddress.fullAddress` | Use SPL result, including GPS coordinates                     |
| Any other case                 | `originalAddress`    | Proceed with shipment; log that address is unverified       |

- After dispatch, no overwrite occurs. System logs what was used.
- `OrdersDB` is updated with `usedAddressType: "verified" | "original"`

---

## 🖼 Drawer UI Behavior

- Show SPL-returned fields only
- Make drawer scrollable
- If NAS missing, show input field for manual entry

### ➕ Add Verification Log Tab

Include a second tab in the drawer:
```json
{
  "verificationAttempts": [
    {
      "timestamp": "2025-07-10T10:20:00Z",
      "status": "failed" | "success",
      "method": "parsed" | "manual" | "whatsapp",
      "nasCode": "KUGA4386"
    },
    ...
  ]
}
```

This should track:
- Whether NAS was auto-parsed, manually entered, or received via WhatsApp
- Timestamp of each verification attempt
- Result of each call (success/failed)
- SPL response code/message (optional)

---

## 📁 Storage Links

- `OrdersDB` stores:
  - `originalAddress`
  - `verifiedAddressId` (FK to `VerifiedAddressesDB`)
  - `verifiedNASStatus`
  - `usedAddressType`
  - `verificationAttempts[]`

- `VerifiedAddressesDB` stores:
  - All SPL-returned fields
  - `nasCode` (as primary key or indexed field)

---

## 🚨 Troubleshooting SPL API Calls

As per your SPL usage dashboard:
- 22 total calls made
- 2 succeeded
- 20 are marked as “other” (likely failures or malformed)

### Possible causes:
1. ❌ **Empty or invalid NAS code** (e.g. bad regex match)
2. ❌ **Incorrect header or missing `api_key`**
3. ❌ **Wrong API endpoint structure or encoding**
4. ⚠️ **Timeout or non-UTF8 responses** not handled
5. ❌ **Response parsing error** on client side

### Next Actions:
- Log SPL response for each attempt (status code + payload)
- Confirm NAS codes passed are valid 4-letter + 4-digit format
- Capture all failed responses in `verificationAttempts[]` for analysis
- Compare “other” call timestamps with order import events to trace sources

---

## 📤 Future Roadmap

- Allow WhatsApp request to customer for NAS code
- Show “Last Verified At” timestamp
- Trigger retry if NAS fails once, but code is valid
- Add UI visual cue when shipping with `originalAddress` vs `verifiedAddress`

---
