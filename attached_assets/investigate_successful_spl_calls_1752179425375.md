# 🔍 Replit Investigation Prompt – Identify Successful SPL API Call Formats

We have confirmation from the SPL dashboard that **2 out of 30 API calls were successful**, which means the correct format and structure **was used at least twice**.

---

## 📊 What We Know:

| Type         | Successful | Blocked | Other | Total |
|--------------|------------|---------|-------|-------|
| Subscriptions | 2         | 5       | 23    | 30    |
| Product       | 0         | 0       | 0     | 0     |
| API           | 2         | 5       | 23    | 30    |

✅ These 2 calls succeeded → **we have a working call pattern**  
❌ But we don’t know which implementation method or format produced it

---

## ✅ Investigation Required

Please check the logs to compare **all attempted formats and parameters** used during the last 30 calls.

---

## 🔍 Check Each of the Following Variables

### 1. **Base URL**
Were successful requests sent to:
- ✅ `https://apina.address.gov.sa/NationalAddress/NationalAddressByShortAddress`
- ❌ Or to an incorrect or outdated URL?

---

### 2. **Query Parameters**
Did the successful calls include:
- `?shortaddress=XXXX1234`
- `&format=json`
- `&language=en`
- `&encode=utf8`

Verify if:
- `format` was set explicitly to `json`
- `encode` was set to `utf8` (important to avoid Windows-1256 default)

---

### 3. **API Key Location**
- ✅ Was the API key passed in **query param**? (`&api_key=...`)
- ✅ Or as a **header**? (`api_key: ...`)
- ❌ Or was it missing/expired on blocked calls?

Compare key usage patterns.

---

### 4. **NAS Code Validity**
Check if the 2 successful calls:
- Had NAS codes matching the pattern: `^[A-Z]{4}[0-9]{4}$`
- Came from test data or real customer records

---

### 5. **Payload Logs**
- Check SPL API response logs (if stored)
- Log request and response headers for successful vs failed attempts

---

## 🎯 Actionable Outcome

Please document which combination worked:
- Which base URL?
- Which query string?
- Which key position?
- What was the structure of the NAS code?

Replicate that for all future calls to increase success rate.

---

## 📍 Bonus Check

Can we:
- Store all SPL attempts (query + headers) in a debug log table?
- Visually compare failed vs successful payloads?

This will help catch silent formatting issues quickly.

