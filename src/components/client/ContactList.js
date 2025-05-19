import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ContactList.css';
import { jwtDecode } from "jwt-decode";

function ContactList() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [buildingId, setBuildingId] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBuildingId = () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const decodedToken = jwtDecode(token);
                    console.log('Decoded Token:', decodedToken);
                    setBuildingId(decodedToken.building_id);
                    setAuthToken(token);
                } catch (decodeError) {
                    console.error('Error decoding token:', decodeError);
                    setError('Error al decodificar el token.');
                    setLoading(false);
                }
            } else {
                setError('Token de autenticación no encontrado.');
                setLoading(false);
            }
        };

        fetchBuildingId();
    }, []);

    useEffect(() => {
        const fetchWorkers = async () => {
            if (!buildingId) {
                console.warn('buildingId is undefined or null. Cannot fetch.');
                setError('ID del edificio no encontrado.');
                setLoading(false);
                return;
            }

            if (!authToken) {
                console.warn('authToken is undefined or null. Cannot fetch.');
                setError('Token de autenticación no encontrado.');
                setLoading(false);
                return;
            }

            try {
                console.log(`Fetching workers for building ID: ${buildingId}`);
                const response = await fetch(`http://localhost:8080/api/buildings/${buildingId}/workers`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json',
                    },
                });
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

        if (buildingId && authToken) {
            fetchWorkers();
        }
    }, [buildingId, authToken]);

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

    const handleChatClick = (workerId) => {
        navigate(`/chat?workerId=${workerId}`);
    };

    return (
        <div className="contact-list-container">
            <h1 className="contact-list-heading">Lista de Contactos</h1>
            {workers.length > 0 ? (
                <div className="row g-4">
                    {workers.map((worker) => (
                        <div key={worker.id} className="col-12 col-md-6 col-lg-4">
                            <div className="contact-card">
                                <h2 className="contact-name">{worker.name}</h2>
                                <p className="contact-info">Contacto: {worker.contact}</p>
                                <Button
                                    variant="primary"
                                    onClick={() => handleChatClick(worker.id)}
                                    className="chat-button"
                                >
                                    <MessageCircle className="me-2" />
                                    Chat
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No hay contactos para este edificio.</p>
            )}
        </div>
    );
}

export default ContactList;
