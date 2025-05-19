import React, { useState, useEffect } from 'react';
import { TypeH1 } from 'react-bootstrap-icons';
import { useParams } from 'react-router-dom';

function ContactList() {
    const { buildingId } = useParams();
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                console.log(`Fetching workers for building ID: ${buildingId}`); // Add this line
                const response = await fetch(`/api/buildings/${buildingId}/workers`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Received data:', data);
                setWorkers(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error); // Add this line
                setError(error);
                setLoading(false);
            }
        };

        if (buildingId) {
            fetchWorkers();
        }
    }, [buildingId]);

    if (loading) {
        return <div>Cargando lista de contactos...</div>;
    }

    if (error) {
        return <div>Error al cargar la lista de contactos: {error.message}</div>;
    }

    return (
        <>
            <h1>Lista de Contactos</h1>
            {workers.length > 0 ? (
                <ul>
                    {workers.map(worker => (
                        <li key={worker.id}>
                            {worker.name} ({worker.email})
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
