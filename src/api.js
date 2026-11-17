// Data layer. The prototype stores people in the browser (localStorage).
// To move to Supabase later, replace loadPeople/savePeople with DB calls.
const KEY = 'church-map-people-v1';

export function loadPeople() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function savePeople(people) {
  localStorage.setItem(KEY, JSON.stringify(people));
}

// Address -> coordinates via OpenStreetMap Nominatim (free, light use only).
export async function geocode(address) {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=tt&q=' +
    encodeURIComponent(address);
  const res = await fetch(url);
  const data = await res.json();
  return data[0] ? { lat: +data[0].lat, lng: +data[0].lon } : null;
}

export function toCsv(people) {
  const cols = ['name', 'phone', 'address', 'status', 'metBy', 'dateMet', 'lat', 'lng', 'notes'];
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [cols.join(','), ...people.map((p) => cols.map((c) => esc(p[c])).join(','))].join('\n');
}
