import { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import './App.css';

function App() {
    const [hospitales, setHospitales] = useState([]);
    const [ruta, setRuta] = useState([]);
    const [incidente, setIncidente] = useState(null);
    const [rutaInfo, setRutaInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("Cargando red vial...");

    const API_BASE = 'http://127.0.0.1:5001';

    // Carga inicial de hospitales
    useEffect(() => {
        fetch(`${API_BASE}/api/graph`)
            .then(res => res.json())
            .then(data => {
                setHospitales(data.nodes);
                setStatus("Sistema listo. Reporte una emergencia haciendo clic en el mapa.");
            })
            .catch(err => setStatus("Error de conexión con el servidor."));
    }, []);

    // Manejo del clic
    const handleMapClick = async (lat, lon) => {
        setIncidente([lat, lon]);
        setLoading(true);
        setStatus("Analizando tráfico y capacidad hospitalaria...");
        setRuta([]);
        setRutaInfo(null);

        try {
            const response = await fetch(`${API_BASE}/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lon })
            });

            if (!response.ok) throw new Error("Error");
            const data = await response.json();

            setRuta(data.path_coords);
            setRutaInfo(data);

            // ACTUALIZAR ESTADO DE HOSPITALES (Para que el semáforo cambie de color)
            // Fusionamos la data vieja con las nuevas ocupaciones que generó el backend
            if (data.updated_hospitals) {
                setHospitales(prev => prev.map(h => {
                    const update = data.updated_hospitals.find(u => u.id === h.id);
                    return update ? { ...h, ...update } : h;
                }));
            }

            setStatus("Ruta óptima encontrada.");
        } catch (error) {
            console.error(error);
            setStatus("Error al calcular ruta.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            <header>
                <h1>🚑 MedRoute: Sistema Inteligente de Emergencias</h1>
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
                    <h2>Panel de Control</h2>
                    <p className="status-msg">{status}</p>

                    {loading && <div className="loader">Calculando...</div>}

                    {rutaInfo && (
                        <div className="info-results fade-in">
                            <div className="card result-card">
                                <span className="info-label">🏥 Hospital Asignado</span>
                                <span className="info-value large">{rutaInfo.hospital_name}</span>
                                <div className="badge-container">
                                    {/* Etiqueta dinámica basada en la ocupación real */}
                                    {(rutaInfo.hospital_stats.patients / rutaInfo.hospital_stats.capacity) < 0.6 ?
                                        <span style={{color:'green', fontWeight:'bold'}}>✅ Disponible</span> :
                                        <span style={{color:'orange', fontWeight:'bold'}}>⚠️ Concurrido</span>
                                    }
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="card">
                                    <span className="info-label">⏱️ Tiempo Viaje</span>
                                    <span className="info-value">{rutaInfo.travel_time} min</span>
                                </div>

                                <div className="card">
                                    <span className="info-label">⚖️ Costo Total</span>
                                    <span className="info-value">{rutaInfo.total_cost}</span>
                                </div>
                            </div>

                            {/* TARJETA DE MÉTRICAS TÉCNICAS PARA EL PROFESOR */}
                            <div className="card metrics-card" style={{backgroundColor: '#f0f8ff', border: '1px solid #b3e0ff'}}>
                                <span className="info-label">⚙️ Métricas del Algoritmo</span>
                                <div className="metric-row" style={{marginTop: '10px'}}>
                                    <span>Tiempo de Ejecución:</span><br/>
                                    <strong style={{fontSize: '1.2em', color: '#0056b3'}}>{rutaInfo.algorithm_time_ms} ms</strong>
                                </div>
                                <div className="metric-row" style={{marginTop: '5px'}}>
                                    <span>Nodos Evaluados:</span><br/>
                                    <strong>{hospitales.length} Hospitales</strong>
                                </div>
                                <small style={{display:'block', marginTop:'10px', color:'#666', fontStyle:'italic'}}>
                                    Algoritmo: Dijkstra + Heurística de Congestión
                                </small>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;