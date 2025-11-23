import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corrección de iconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- DEFINICIÓN DE ICONOS (SEMÁFORO) ---
const createIcon = (url) => new L.Icon({
    iconUrl: url,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// Iconos de colores
const redIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png');
const orangeIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png');
const greenIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png');
const incidentIcon = createIcon('https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png');

// Función lógica del semáforo
const getIcon = (patients, capacity) => {
    const ratio = patients / capacity;
    if (ratio >= 0.90) return redIcon;    // Crítico (>90%) - ROJO
    if (ratio >= 0.60) return orangeIcon; // Moderado (60-90%) - NARANJA
    return greenIcon;                     // Libre (<60%) - VERDE
};

function ClickHandler({ onMapClick }) {
    useMapEvents({
        click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
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

            {/* Dibujar Hospitales con colores dinámicos */}
            {hospitales.map((h) => {
                const ratio = (h.patients / h.capacity * 100).toFixed(0);
                return (
                    <Marker key={h.id} position={h.pos} icon={getIcon(h.patients, h.capacity)}>
                        <Popup>
                            <div style={{ textAlign: 'center' }}>
                                <strong>{h.name}</strong><br/>
                                <hr style={{ margin: '5px 0' }}/>
                                Pacientes: {h.patients} / {h.capacity}<br/>
                                Ocupación: <b>{ratio}%</b><br/>
                                {ratio >= 90 ? "⛔ SATURADO" : ratio >= 60 ? "⚠️ CONCURRIDO" : "✅ DISPONIBLE"}
                            </div>
                        </Popup>
                    </Marker>
                )
            })}

            {/* Dibujar Ruta */}
            {ruta.length > 0 && <Polyline positions={ruta} color="blue" weight={5} />}

            {/* Dibujar Accidente */}
            {incidente && (
                <Marker position={incidente} icon={incidentIcon}>
                    <Popup><b>Punto de Emergencia</b></Popup>
                </Marker>
            )}

            <ClickHandler onMapClick={onMapClick} />
        </MapContainer>
    );
}