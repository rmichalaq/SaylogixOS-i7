# 🛠 Replit Instructions – Fix Verify NAS Module

This guide outlines the required changes to align the Verify NAS module with correct behavior, UI structure, and automation expectations.

---

## 1. 🖼 Drawer Fixes

### ✅ Make Drawer Scrollable
- Add vertical scroll (`overflow-y: auto`) to drawer body
- Limit drawer height to `90vh` or similar
- Ensure scrolling does not clip SPL response fields

---

### ✅ Remove Dummy / Extra Fields
Only show fields returned by the SPL API:
```json
{
  "nasCode",
  "buildingNumber",
  "street",
  "district",
  "city",
  "postalCode",
  "additionalCode",
  "latitude",
  "longitude"
}
```

**Remove:** `municipality`, `region`, `landmark`, `isActive`, and any hardcoded/dummy values.

---

## 2. ✅ Verification Flow

### ✅ Auto-Verify on Order Import
- When new order is fetched from any sales channel:
  - Parse NAS from address (use regex)
  - If valid NAS: trigger SPL API call
  - If SPL returns verified address → move to `VerifiedNAS` queue
  - If invalid or no NAS → keep in `PendingVerifyNAS`

---

### ✅ Move Verified Orders
- If `verifiedNASStatus == "verified"`:
  - Remove from `PendingVerifyNAS`
  - Add to `VerifiedNAS` tab
  - Store `verifiedAddressId` and log in `OrdersDB`

---

## 3. 📥 Manual NAS Entry in Drawer

If no NAS is found:
- Show input field: `Manual NAS Code`
- On submit:
  - Trigger SPL verification
  - If successful → promote to `VerifiedNAS`
  - If failed → keep in pending state

---

## 4. 🧾 Add Verification Log Tab in Drawer

Include a second tab to show this history:
```json
{
  "verificationAttempts": [
    {
      "timestamp": "2025-07-10T10:20:00Z",
      "status": "success" | "failed",
      "method": "parsed" | "manual" | "whatsapp",
      "nasCode": "KUGA4386"
    }
  ]
}
```

Each order in `OrdersDB` should maintain this log.

---

## 5. 📦 Shipping Logic

- Dispatch, OMS, and Courier Assignment modules must use:
  - `verifiedAddress` **if** `verifiedNASStatus == "verified"`
  - Else fall back to `originalAddress`

---

## 6. 📋 Address Verification Screen

- `PendingVerifyNAS` tab must show **all unverified orders**, regardless of whether a NAS is present or not.
- Display detection status:
  - NAS detected
  - NAS missing
  - Verification attempted (Y/N)

---

## 7. 🔄 WhatsApp Workflow (Preparation Only)

- If NAS is not found:
  - Prepare logic to send WhatsApp message to customer (not active yet)
  - Allow manual entry once customer replies

---

## 📌 Required Field Names (Strict)

Ensure the following structure is maintained:

### In `OrdersDB`
```json
{
  "originalAddress": "...",
  "verifiedAddressId": "ref:VerifiedAddressesDB",
  "verifiedNASStatus": "pending|verified|failed",
  "usedAddressType": "verified|original",
  "verificationAttempts": []
}
```

### In `VerifiedAddressesDB`
```json
{
  "nasCode": "...",
  "buildingNumber": "...",
  "street": "...",
  "district": "...",
  "city": "...",
  "postalCode": "...",
  "additionalCode": "...",
  "latitude": 00.000,
  "longitude": 00.000
}
```

---

