import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({ iconUrl: icon, iconRetinaUrl: icon2x, shadowUrl: shadow });

const CENTER = [10.65, -61.4]; // Trinidad

function Clicks({ onPick }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function Fly({ focus }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 15));
  }, [focus, map]);
  return null;
}

export default function MapView({ people, draft, focus, onPick, onSelect }) {
  return (
    <MapContainer center={CENTER} zoom={10} className="map">
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Clicks onPick={onPick} />
      <Fly focus={focus} />
      {people
        .filter((p) => p.lat != null)
        .map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]} eventHandlers={{ click: () => onSelect(p) }}>
            <Popup>
              <strong>{p.name}</strong>
              <br />
              {p.address}
              <br />
              {p.phone}
              <br />
              <em>{p.status}</em>
            </Popup>
          </Marker>
        ))}
      {draft && (
        <Marker
          position={[draft.lat, draft.lng]}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              onPick({ lat, lng });
            },
          }}
        />
      )}
    </MapContainer>
  );
}
