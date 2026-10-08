import { OneMapSearchResult, LocationCoordinates } from '../types/restaurant';
import { COMMON_MRT_STATIONS, POPULAR_FOODIE_HUBS } from '../data/singaporeLocations';

/**
 * Searches Singapore locations via OneMap or local MRT & landmark index.
 * OneMap provides official geocoding for SG postal codes, building names, and streets.
 */
export async function searchSingaporeLocation(query: string): Promise<LocationCoordinates[]> {
  const clean = query.trim();
  if (!clean) return [];

  const results: LocationCoordinates[] = [];

  // 1. Check local MRT stations and foodie hubs for immediate response
  const qLower = clean.toLowerCase();
  for (const mrt of COMMON_MRT_STATIONS) {
    if (mrt.name.toLowerCase().includes(qLower) || `${mrt.name} mrt`.toLowerCase().includes(qLower)) {
      results.push({
        latitude: mrt.lat,
        longitude: mrt.lng,
        label: `${mrt.name} MRT (${mrt.line})`,
        address: `${mrt.name} MRT Station, Singapore`,
      });
    }
  }

  for (const hub of POPULAR_FOODIE_HUBS) {
    if (hub.name.toLowerCase().includes(qLower) || hub.description.toLowerCase().includes(qLower)) {
      results.push({
        ...hub.coords,
        label: `${hub.name} (${hub.badge})`,
      });
    }
  }

  // 2. Query backend or OneMap public search API
  try {
    // Try backend proxy first
    const backendRes = await fetch(`/api/onemap/search?q=${encodeURIComponent(clean)}`);
    if (backendRes.ok) {
      const data = await backendRes.json();
      if (Array.isArray(data.results)) {
        for (const item of data.results) {
          const lat = parseFloat(item.LATITUDE);
          const lng = parseFloat(item.LONGITUDE);
          if (!isNaN(lat) && !isNaN(lng)) {
            const label = item.BUILDING && item.BUILDING !== 'NIL' 
              ? `${item.BUILDING} (${item.ROAD_NAME || ''})`
              : (item.ROAD_NAME ? `${item.ROAD_NAME} ${item.POSTAL ? 'S(' + item.POSTAL + ')' : ''}` : item.SEARCHVAL);
            
            // avoid duplicates
            if (!results.some(r => Math.abs(r.latitude - lat) < 0.0001 && Math.abs(r.longitude - lng) < 0.0001)) {
              results.push({
                latitude: lat,
                longitude: lng,
                label: label.trim(),
                address: item.ADDRESS || item.ROAD_NAME,
              });
            }
          }
        }
      }
    } else {
      // Direct call fallback to public OneMap API
      const oneMapDirect = await fetch(
        `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(clean)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`
      );
      if (oneMapDirect.ok) {
        const json = await oneMapDirect.json();
        if (json.results && Array.isArray(json.results)) {
          for (const item of json.results as OneMapSearchResult[]) {
            const lat = parseFloat(item.LATITUDE);
            const lng = parseFloat(item.LONGITUDE);
            if (!isNaN(lat) && !isNaN(lng)) {
              results.push({
                latitude: lat,
                longitude: lng,
                label: item.BUILDING && item.BUILDING !== 'NIL' ? item.BUILDING : (item.ROAD_NAME || item.SEARCHVAL),
                address: item.ADDRESS,
              });
            }
          }
        }
      }
    }
  } catch {
    // Graceful fallback to local matches
  }

  return results.slice(0, 8);
}

/**
 * Reverse geocode Singapore coordinates using OneMap or closest known foodie landmark
 */
export async function reverseGeocodeSG(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(`/api/onemap/revgeo?lat=${lat}&lng=${lng}`);
    if (res.ok) {
      const data = await res.json();
      if (data.address) return data.address;
    }
  } catch {
    // ignore
  }

  // Find closest known landmark
  let closestDist = Infinity;
  let closestLabel = 'Near Singapore Central';

  for (const hub of POPULAR_FOODIE_HUBS) {
    const d = Math.hypot(hub.coords.latitude - lat, hub.coords.longitude - lng);
    if (d < closestDist) {
      closestDist = d;
      closestLabel = `Near ${hub.name}`;
    }
  }

  for (const mrt of COMMON_MRT_STATIONS) {
    const d = Math.hypot(mrt.lat - lat, mrt.lng - lng);
    if (d < closestDist) {
      closestDist = d;
      closestLabel = `Near ${mrt.name} MRT`;
    }
  }

  return closestLabel;
}


