const axios = require('axios')

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter'
]

function buildQuery({ lat, lng, radiusKm }) {
  const r = Math.max(1, Math.min(50, Number(radiusKm || 10))) * 1000
  return `
[out:json][timeout:25];
(
  node["amenity"="gym"](around:${r},${lat},${lng});
  way["amenity"="gym"](around:${r},${lat},${lng});
  relation["amenity"="gym"](around:${r},${lat},${lng});

  node["leisure"="fitness_centre"](around:${r},${lat},${lng});
  way["leisure"="fitness_centre"](around:${r},${lat},${lng});
  relation["leisure"="fitness_centre"](around:${r},${lat},${lng});
);
out center tags;
`
}

async function fetchWithEndpoint(url, query) {
  const res = await axios.post(url, query, {
    headers: { 'Content-Type': 'text/plain' },
    timeout: 25000,
    validateStatus: () => true
  })
  if (res.status === 200) return res.data
  const err = new Error(`Overpass ${res.status}`)
  err.status = res.status
  err.data = res.data
  throw err
}

function normalizeElements(data) {
  const elements = Array.isArray(data?.elements) ? data.elements : []
  return elements
    .map((el) => {
      const lat = el?.lat ?? el?.center?.lat
      const lng = el?.lon ?? el?.center?.lon
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
      const name = el?.tags?.name || 'Gym'
      const phone = el?.tags?.phone || el?.tags?.['contact:phone'] || ''
      const website = el?.tags?.website || el?.tags?.['contact:website'] || ''
      const addr =
        el?.tags?.['addr:full'] ||
        [
          el?.tags?.['addr:housenumber'],
          el?.tags?.['addr:street'],
          el?.tags?.['addr:suburb'],
          el?.tags?.['addr:city'],
        ]
          .filter(Boolean)
          .join(' ')
      return {
        source: 'public',
        osmId: `${el.type}:${el.id}`,
        name,
        address: addr || '',
        phone,
        website,
        location: { lat, lng },
      }
    })
    .filter(Boolean)
}

async function fetchNearbyGymsOSM({ lat, lng, radiusKm }) {
  const query = buildQuery({ lat, lng, radiusKm })
  let lastErr = null

  for (const url of ENDPOINTS) {
    try {
      const data = await fetchWithEndpoint(url, query)
      return normalizeElements(data)
    } catch (e) {
      lastErr = e
      if (e?.status === 429) continue
    }
  }

  const err = new Error('Overpass unavailable')
  err.cause = lastErr
  throw err
}

module.exports = { fetchNearbyGymsOSM }