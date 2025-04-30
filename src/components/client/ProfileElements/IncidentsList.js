// src/components/ListaIncidencias.js
import React, { useState, useEffect } from 'react';
import { obtenerIncidencias } from '../services/api'; // Importa la función para obtener las incidencias

function IncidentsList() {
    const [incidencias, setIncidencias] = useState([]);

    useEffect(() => {
        const fetchIncidencias = async () => {
            try {
                const data = await obtenerIncidencias();
                setIncidencias(data);
            } catch (error) {
                console.error('Error al obtener las incidencias:', error);
                // Considera mostrar un mensaje de error al usuario
            }
        };

        fetchIncidencias();
    }, []);

    return (
        <div>
            {incidencias.length === 0 ? (
                <p>No has reportado ninguna incidencia aún.</p>
            ) : (
                <ul>
                    {incidencias.map((incidencia) => (
                        <li key={incidencia.id}>
                            <strong>{incidencia.titulo}</strong> - {incidencia.categoria} ({incidencia.estado})
                            {/* Aquí podrías añadir más detalles o un botón para ver el detalle */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default IncidentsList;