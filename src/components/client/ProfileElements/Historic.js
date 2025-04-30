
import React, { useState, useEffect } from 'react';
import { obtenerIncidenciasPorEdificio } from '../../../Api'; // Ajusta la ruta si es diferente
import './Historic.css'; // Importa estilos CSS

function Historic({ buildingId }) {
    const [incidencias, setIncidencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('jwtToken'); // Obtén el token JWT

    useEffect(() => {
        const fetchIncidencias = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await obtenerIncidenciasPorEdificio(buildingId, token);
                setIncidencias(data);
            } catch (err) {
                setError('Error al cargar el historial de incidencias.');
                console.error('Error fetching incidencias:', err);
            } finally {
                setLoading(false);
            }
        };

        if (buildingId && token) {
            fetchIncidencias();
        }
    }, [buildingId, token]);

    if (loading) {
        return <div>Cargando historial de incidencias...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!incidencias || incidencias.length === 0) {
        return <div>No hay incidencias reportadas para este edificio.</div>;
    }

    return (
        <div className="historial-incidencias-container">
            <h2>Historial de Incidencias</h2>
            <ul className="incidencias-lista">
                {incidencias.map((incidencia) => (
                    <li key={incidencia.id} className="incidencia-item">
                        <div className="incidencia-header">
                            <h3 className="incidencia-titulo">{incidencia.title}</h3>
                            <span className={`incidencia-status ${incidencia.status.toLowerCase().replace(' ', '-')}`}>
                {incidencia.status}
              </span>
                        </div>
                        <p className="incidencia-descripcion">{incidencia.description}</p>
                        <div className="incidencia-detalles">
              <span className="incidencia-fecha-creacion">
                Creada: {new Date(incidencia.creationDate).toLocaleDateString()}
              </span>
                            {incidencia.resolutionDate && (
                                <span className="incidencia-fecha-resolucion">
                  Resuelta: {new Date(incidencia.resolutionDate).toLocaleDateString()}
                </span>
                            )}
                        </div>
                        {/* Aquí podrías añadir más detalles visuales como botones para ver detalles, adjuntos, etc. */}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Historic;