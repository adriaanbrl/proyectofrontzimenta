import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Alert, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './Historic.css';

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
        <Container className="historic-container py-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2 className="historic-title text-center mb-4">Historial de Incidentes</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {!buildingId && !error && <p className="text-muted text-center">Esperando el ID del edificio...</p>}
                    {buildingId && incidents.length > 0 ? (
                        incidents.map((incident) => (
                            <Card key={incident.id} className="incident-card mb-3 shadow-sm">
                                <Card.Body className="p-3">
                                    <Card.Title className="incident-card-title mb-2">{incident.title}</Card.Title>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item className="incident-list-item">
                                            <strong>Descripción:</strong> <span className="text-muted">{incident.description}</span>
                                        </ListGroup.Item>
                                        <ListGroup.Item className="incident-list-item">
                                            <strong>Estado:</strong> <span className={`status-${incident.status.toLowerCase()}`}>{incident.status}</span>
                                        </ListGroup.Item>
                                        {incident.resolutionDate && (
                                            <ListGroup.Item className="incident-list-item">
                                                <strong>Fecha de Resolución:</strong> <span className="text-muted">{new Date(incident.resolutionDate).toLocaleDateString()}</span>
                                            </ListGroup.Item>
                                        )}
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        ))
                    ) : (
                        buildingId && !error && <p className="text-muted text-center">No hay incidentes registrados para este edificio.</p>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default Historic;