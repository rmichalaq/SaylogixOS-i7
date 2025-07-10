
# LMS Map View – Google Maps Not Configured Debug Checklist (Replit Prompt)

## 🎯 Issue Summary

Although the Table ↔ Map toggle is visible and functional, the **Map View still displays “Google Maps Not Configured”**, despite Replit confirming that the `useGoogleMaps` hook and API integration have been implemented.

---

## 🧪 Debugging Checklist

### ✅ 1. API Key Availability
- [ ] Ensure that the **Google Maps API key is saved** via `Settings → Integrations`.
- [ ] Confirm that the API key is **retrievable from the backend**, via:
  ```http
  GET /api/integrations/google-maps/config
  ```
- [ ] Ensure no trailing spaces or invalid characters exist in the key.

---

### ✅ 2. Frontend: useGoogleMaps() Hook
- [ ] Confirm that the hook **dynamically loads** the Maps script with the API key.
- [ ] Ensure this line is working:
  ```js
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY" ...>
  ```
- [ ] Add `console.log(apiKey)` in the hook to validate that a key is actually being passed.

---

### ✅ 3. Race Condition or Conditional Logic
- [ ] Check whether `window.google.maps` is available **before** rendering `GoogleMap` component.
- [ ] Ensure fallback is not triggered too early:
  ```tsx
  if (!google || !window.google.maps) {
    return <GoogleMapsNotConfigured />
  }
  ```
  → This may be firing too soon, even if Maps eventually loads.

---

### ✅ 4. Network & Browser Console
- [ ] Open DevTools → Console:
  - Look for `401`, `403`, or `RefererNotAllowed` errors
  - Check for blocked script from Google Maps

- [ ] In DevTools → Network tab:
  - Check if the Google Maps JS file is successfully loaded

---

### ✅ 5. Temporarily Hardcode API Key (For Testing)
To isolate the problem, hardcode a valid Google Maps key in `useGoogleMaps.ts`:
```tsx
loadScript(`https://maps.googleapis.com/maps/api/js?key=HARDCODED_TEST_KEY`)
```
- If map loads: the issue is in config retrieval
- If not: issue lies in script injection, timing, or DOM rendering

---

## ✅ Success Criteria

- [ ] Map view loads successfully when toggled
- [ ] No “Google Maps Not Configured” error if key is present
- [ ] All map markers (MOCK_store, hubs, drivers) are visible
