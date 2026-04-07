const Gym = require('../models/gym')
const Package = require('../models/Package')
const cache = require('../lib/cache')
const { fetchNearbyGymsOSM } = require('../lib/osmOverpass')

function toRad(v) {
  return (v * Math.PI) / 180
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

exports.discoverGyms = async (req, res) => {
  try {
    const lat = Number(req.query.lat)
    const lng = Number(req.query.lng)
    const radiusKm = Number(req.query.radiusKm || 10)

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: 'lat and lng are required numbers' })
    }

    const r = Math.max(1, Math.min(50, radiusKm))
    const cacheKey = `discover:${lat.toFixed(3)}:${lng.toFixed(3)}:${r}`
    const cached = cache.get(cacheKey)
    if (cached) return res.json(cached)

    const partnerGyms = await Gym.find({
      isPartner: true,
      partnerStatus: 'active',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: r * 1000,
        },
      },
    }).lean()

    const partnerIds = partnerGyms.map((g) => g._id)
    const packages = await Package.find({ gym: { $in: partnerIds }, isActive: true }).lean()

    const packagesByGym = new Map()
    for (const p of packages) {
      const k = String(p.gym)
      if (!packagesByGym.has(k)) packagesByGym.set(k, [])
      packagesByGym.get(k).push(p)
    }

    const partnerPlaceIds = new Set(partnerGyms.map((g) => g.googlePlaceId).filter(Boolean))

    const partnerGymsWithPackages = partnerGyms
      .map((g) => {
        const gymLng = g.location?.coordinates?.[0]
        const gymLat = g.location?.coordinates?.[1]
        const distanceKm =
          Number.isFinite(gymLat) && Number.isFinite(gymLng)
            ? Number(haversineKm(lat, lng, gymLat, gymLng).toFixed(2))
            : null

        return {
          source: 'partner',
          _id: g._id,
          name: g.name,
          address: g.address || '',
          phone: g.phone || '',
          city: g.city || '',
          logoUrl: g.logoUrl || '',
          googlePlaceId: g.googlePlaceId || '',
          location: { lat: gymLat, lng: gymLng },
          distanceKm,
          packages: packagesByGym.get(String(g._id)) || [],
        }
      })
      .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))

    let publicGyms = []
    let publicStatus = 'ok'

    try {
      const raw = await fetchNearbyGymsOSM({ lat, lng, radiusKm: r })
      publicGyms = raw
        .filter((x) => !partnerPlaceIds.has(x.googlePlaceId))
        .map((x) => {
          const d = haversineKm(lat, lng, x.location.lat, x.location.lng)
          return { ...x, distanceKm: Number(d.toFixed(2)) }
        })
        .sort((a, b) => a.distanceKm - b.distanceKm)
    } catch {
      publicStatus = 'unavailable'
      publicGyms = []
    }

    const payload = {
      center: { lat, lng },
      radiusKm: r,
      partnerGyms: partnerGymsWithPackages,
      nearbyGyms: publicGyms,
      totalNearby: publicGyms.length,
      publicStatus,
    }

    cache.set(cacheKey, payload, 10 * 60 * 1000)
    return res.json(payload)
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Server error' })
  }
}