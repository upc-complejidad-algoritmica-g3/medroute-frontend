// src/App.jsx
import { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import './App.css';

function App() {
  const [hospitales, setHospitales] = useState([]);
  const [ruta, setRuta] = useState([]);
  const [incidente, setIncidente] = useState(null);
  const [rutaInfo, setRutaInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Cargando datos...");

  const API_BASE = 'http://127.0.0.1:5001';

  // 1. Cargar Hospitales al iniciar
  useEffect(() => {
    fetch(`${API_BASE}/api/graph`)
      .then(res => res.json())
      .then(data => {
        // Filtramos solo los nodos que son hospitales para no saturar el mapa de React con 5000 marcadores
        const soloHospitales = data.nodes.filter(n => n.type === 'hospital');
        setHospitales(soloHospitales);
        setStatus("Listo. Haz clic en el mapa para reportar un accidente.");
      })
      .catch(err => {
        console.error(err);
        setStatus("Error al conectar con el servidor backend.");
      });
  }, []);

  // 2. Función cuando el usuario hace clic
  const handleMapClick = async (lat, lon) => {
    setIncidente([lat, lon]);
    setLoading(true);
    setStatus("Calculando ruta óptima...");
    setRuta([]); // Limpiar ruta anterior
    setRutaInfo(null);

    try {
      const response = await fetch(`${API_BASE}/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon })
      });

      if (!response.ok) throw new Error("Error en el cálculo");

      const data = await response.json();
      
      setRuta(data.path_coords);
      setRutaInfo(data);
      setStatus("Ruta calculada exitosamente.");
    } catch (error) {
      console.error(error);
      setStatus("Error al calcular la ruta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>🚑 MedRoute React</h1>
      </header>

      <div className="main-content">
        <div className="map-container">
          <MapComponent 
            hospitales={hospitales} 
            ruta={ruta} 
            incidente={incidente}
            onMapClick={handleMapClick} 
          />
        </div>

        <div className="sidebar">
          <h2>Detalles</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{status}</p>

          {loading && <div className="loader">Calculando...</div>}

          {rutaInfo && (
            <div className="info-results">
              <div className="card">
                <span className="info-label">Hospital Destino</span>
                <span className="info-value">{rutaInfo.hospital_name}</span>
              </div>

              <div className="card">
                <span className="info-label">Tiempo Estimado</span>
                <span className="info-value highlight-red">{rutaInfo.travel_time} min</span>
              </div>

              <div className="card">
                <span className="info-label">Costo Ponderado</span>
                <span className="info-value highlight-purple">{rutaInfo.total_cost}</span>
              </div>
              
              <div className="card">
                <span className="info-label">Penalización Congestión</span>
                <span className="info-value">{rutaInfo.congestion_penalty}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;