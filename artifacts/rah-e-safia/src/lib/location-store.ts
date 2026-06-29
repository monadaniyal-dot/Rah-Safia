const LOCATION_KEY = "rah-e-safia:saved-location";

export interface SavedLocation {
  lat: number;
  lon: number;
  cityName: string;
}

export function getSavedLocation(): SavedLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    return raw ? (JSON.parse(raw) as SavedLocation) : null;
  } catch {
    return null;
  }
}

export function saveLocation(loc: SavedLocation): void {
  try {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
    window.dispatchEvent(new CustomEvent("rah-e-safia:location-changed", { detail: loc }));
  } catch {}
}

export function clearSavedLocation(): void {
  localStorage.removeItem(LOCATION_KEY);
  window.dispatchEvent(new CustomEvent("rah-e-safia:location-changed", { detail: null }));
}

export async function forwardGeocodeCity(query: string): Promise<SavedLocation> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    { headers: { "Accept-Language": "en" } }
  );
  if (!res.ok) throw new Error("Geocoding failed");
  const json = await res.json();
  if (!json.length) throw new Error(`City "${query}" not found. Try a different spelling.`);
  const r = json[0];
  const lat = parseFloat(r.lat);
  const lon = parseFloat(r.lon);
  const cityName = r.display_name?.split(",").slice(0, 2).join(",").trim() ?? query;
  return { lat, lon, cityName };
}
