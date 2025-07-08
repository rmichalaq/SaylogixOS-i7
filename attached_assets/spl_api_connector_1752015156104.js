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
