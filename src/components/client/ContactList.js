import React, { useState, useEffect } from 'react';
import { TypeH1 } from 'react-bootstrap-icons';
import { jwtDecode } from 'jwt-decode';

function ContactList() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [buildingId, setBuildingId] = useState(null);

    useEffect(() => {
        const fetchWorkers = async () => {
            if (!buildingId) {
                console.warn('buildingId is undefined or null.  Cannot fetch.');
                setError('ID del edificio no encontrado.');
                setLoading(false);
                return;
            }

            try {
                console.log(`Fetching workers for building ID: ${buildingId}`);
                const response = await fetch(`/api/buildings/${buildingId}/workers`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
                    throw new Error(`Error HTTP: ${response.status}, Mensaje: ${errorText}`);
                }
                const data = await response.json();
                console.log('Received data:', data);
                setWorkers(data);
                setLoading(false);
            } catch (error) {
                console.error('Error al obtener datos:', error);
                setError(error);
                setLoading(false);
            }
        };

        // Get buildingId from JWT
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                console.log('Decoded Token:', decodedToken); // Add this line
                setBuildingId(decodedToken.building_id);
            } catch (decodeError) {
                console.error('Error decoding token:', decodeError);
                setError('Error al decodificar el token.');
                setLoading(false);
                return;
            }
        } else {
            setError('Token de autenticación no encontrado.');
            setLoading(false);
            return;
        }


        fetchWorkers();
    }, [buildingId]);

    if (loading) {
        return <div>Cargando lista de contactos...</div>;
    }

    if (error) {
        return (
            <div>
                <h1>Error</h1>
                <p>Se produjo un error al cargar la lista de contactos: {error.message}</p>
            </div>
        );
    }

    return (
        <>
            <h1>Lista de Contactos</h1>
            {workers.length > 0 ? (
                <ul>
                    {workers.map(worker => (
                        <li key={worker.id}>
                            {worker.name} ({worker.contact})
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay contactos para este edificio.</p>
            )}
        </>
    );
}

export default ContactList;
