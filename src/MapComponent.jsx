// src/MapComponent.jsx
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// --- Arreglo de iconos de Leaflet en React (Un problema común) ---
// React a veces rompe los iconos por defecto, esto lo arregla:
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Iconos personalizados
const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const incidentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Componente auxiliar para detectar clics
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapComponent({ hospitales, ruta, incidente, onMapClick }) {
  return (
   <MapContainer center={[-12.11, -77.03]} zoom={13} className="leaflet-container">
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* 1. Dibujar Hospitales */}
      {hospitales.map((h) => (
        <Marker key={h.id} position={h.pos} icon={hospitalIcon}>
          <Popup>
            <strong>{h.name}</strong><br />
            Pacientes: {h.patients}/{h.capacity}
          </Popup>
        </Marker>
      ))}

      {/* 2. Dibujar Ruta (si existe) */}
      {ruta.length > 0 && (
        <Polyline positions={ruta} color="blue" weight={6} opacity={0.8} />
      )}

      {/* 3. Dibujar Marcador de Incidente (si existe) */}
      {incidente && (
        <Marker position={incidente} icon={incidentIcon}>
          <Popup>Punto de Incidente</Popup>
        </Marker>
      )}

      {/* 4. Detectar Clics */}
      <ClickHandler onMapClick={onMapClick} />
    </MapContainer>
  );
}