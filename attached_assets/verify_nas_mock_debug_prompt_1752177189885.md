# 🧪 Investigation Required – SPL NAS Verification Returns Mock Data

This prompt highlights serious inconsistencies in the SPL NAS API verification data currently shown in the app. The data shown in the drawer appears to be **mocked** or **truncated**, which violates our implementation requirement of **“only show authentic fields returned from SPL API”**.

---

## 📷 Screenshot Symptoms

In the attached screenshot for NAS Code `RESB3139`, the following values appear:
- **Full Address**: “Mock Address for RESB3139, Saudi Arabia”
- **City**: “Riyadh”
- **District**: “Generic District”
- **Street**: “Generic Street”
- **Building Number**: “1234”
- **GPS Coordinates**: `24.713600, 46.675300`

---

## 🚨 Red Flags

- `Mock Address for RESB3139` is **not a real SPL response**
- `Generic Street`, `Generic District` — strongly suggest dummy placeholders
- Repeated use of `1234`, `12345` = fallback data patterns
- `Riyadh` may not match real NAS code `RESB3139` region (which SPL would return as Tabuk, Umluj, etc.)
- SPL's OpenAPI spec does NOT document any such mock fallback logic

---

## ✅ Prompt for Replit Team

Please investigate and confirm the following:

### 1. ❓ Is the SPL response being mocked in local/dev/staging environments?
- If yes: disable mocking for all live verification flows

### 2. ❓ Are we truncating or filtering real SPL fields from the response?
- Confirm if the **raw JSON SPL response** is logged and shown
- Ensure no frontend display logic is overriding or renaming SPL field values

### 3. ❓ Is the `fullAddress` field being locally constructed?
- It should be removed unless SPL sends it directly
- If SPL returns only individual fields (building, street, city), then display those only

### 4. ❓ Are GPS coordinates (`lat`, `lng`) directly coming from SPL?
- Or are they approximated based on city lookups?
- Cross-verify coordinates with actual SPL response

### 5. ✅ Confirm Replit is parsing and storing the following fields directly:
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

---

## ✅ Resolution Criteria

- Drawer must only display raw data returned from SPL API
- No field should display `Mock`, `Generic`, or repeated placeholder values
- All values must be cross-checked with real SPL queries using actual API key + short address
- Add an internal debug mode to view raw SPL response for each NAS attempt

---

Once resolved, please regenerate the Verified NAS drawer for `RESB3139` using a real live API call and ensure the fields match the SPL database.

