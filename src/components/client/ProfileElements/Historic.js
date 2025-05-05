import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useLocation } from 'react-router-dom';


const Historic = () => {
    const location = useLocation();
    const [incidents, setIncidents] = useState([]);
    const [buildingId, setBuildingId] = useState('');
    const [error, setError] = useState(null);


    useEffect(() => {
        document.title = "Historial de Incidentes";
        if (location.state && location.state.building_id) {
            setBuildingId(location.state.building_id);
        } else {
            setError("No se proporcionó el ID del edificio.");
            console.error("No se proporcionó el ID del edificio en el estado de la ruta.");
        }
    }, [location.state]);


    useEffect(() => {
        if (buildingId) {
            const fetchIncidents = async () => {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    console.error('No se encontró el token de autenticación.');
                    setError('No se encontró el token de autenticación.');
                    return;
                }
                try {
                    const response = await axios.get(
                        `http://localhost:8080/api/buildings/${buildingId}/incidents`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    console.log("Respuesta del backend:", response.data);
                    setIncidents(response.data);
                } catch (error) {
                    console.error('Error al obtener los incidentes:', error);
                    setError('Error al cargar el historial de incidentes.');
                }
            };


            fetchIncidents();
        }
    }, [buildingId]);


    return (
        <div>
            <h2>Historial de Incidentes</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {!buildingId && !error && <p>Esperando el ID del edificio...</p>}
            {buildingId && incidents.length > 0 ? (
                incidents.map((incident) => (
                    <Card key={incident.id} className="mb-3">
                        <Card.Body>
                            <Card.Title>{incident.title}</Card.Title>
                            <ListGroup variant="flush">
                                <ListGroup.Item>Descripción: {incident.description}</ListGroup.Item>
                                <ListGroup.Item>Estado: {incident.status}</ListGroup.Item>
                                {incident.resolutionDate && (
                                    <ListGroup.Item>Fecha de Resolución: {new Date(incident.resolutionDate).toLocaleDateString()}</ListGroup.Item>
                                )}

                            </ListGroup>
                        </Card.Body>
                    </Card>
                ))
            ) : (
                buildingId && !error && <p>No hay incidentes registrados para este edificio.</p>
            )}
        </div>
    );
};


export default Historic;


