import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Alert, Container, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './Historic.css';
import { ChevronLeft } from 'lucide-react';

const Historic = () => {
  const location = useLocation();
  const navigate = useNavigate();
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const resolvedIncidents = incidents
      .filter(incident => incident.status.toLowerCase() === 'resuelta')
      .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

  const pendingIncidents = incidents
      .filter(incident => incident.status.toLowerCase() === 'pendiente')
      .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

  const otherIncidents = incidents
      .filter(
          incident => incident.status.toLowerCase() !== 'resuelta' && incident.status.toLowerCase() !== 'pendiente'
      )
      .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
      <Container className="historic-container py-4">
        <Row className="justify-content-center">
          <Col md={8}>
            <div className="d-flex justify-content-center align-items-center mb-3">
              <Button
                  variant="link"
                  onClick={handleGoBack}
                  className="back-button me-3"
                  aria-label="Volver atrás"
                  style={{ padding: 0 }}
              >
                <ChevronLeft size={20} color="orange" />
              </Button>
              <h2 className="historic-title text-center mb-0">Historial de Incidentes</h2>
            </div>
            {error && <Alert variant="danger">{error}</Alert>}
            {!buildingId && !error && <p className="text-muted text-center">Esperando el ID del edificio...</p>}
            {buildingId && incidents.length > 0 ? (
                <>
                  {pendingIncidents.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-muted">Pendientes</h4>
                        {pendingIncidents.map((incident) => (
                            <Card key={incident.id} className="incident-card mb-3 shadow-sm">
                              <Card.Body className="p-3">
                                <Card.Title className="incident-card-title mb-2">{incident.title}</Card.Title>
                                <ListGroup variant="flush">
                                  <ListGroup.Item><strong>Descripción:</strong> <span className="text-muted">{incident.description}</span></ListGroup.Item>
                                  <ListGroup.Item><strong>Estado:</strong> <span className={`status-${incident.status.toLowerCase().replace(' ', '-')}`}>{incident.status}</span></ListGroup.Item>
                                  <ListGroup.Item><strong>Creado el:</strong> <span className="text-muted">{formatDate(incident.creationDate)}</span></ListGroup.Item>
                                  {incident.resolutionDate && (
                                      <ListGroup.Item><strong>Fecha de Resolución:</strong> <span className="text-muted">{formatDate(incident.resolutionDate)}</span></ListGroup.Item>
                                  )}
                                  {/* --- ADD THIS PART FOR THE IMAGE (Base64) --- */}
                                  {incident.image && ( // 'image' is the field name from your backend
                                      <ListGroup.Item className="text-center">
                                        <strong>Imagen:</strong>
                                        <div className="incident-image-container mt-2">
                                          {/* Assuming images are JPEGs. Adjust 'image/jpeg' if needed */}
                                          <img
                                              src={`data:image/jpeg;base64,${incident.image}`}
                                              alt={`Incidente: ${incident.title}`}
                                              className="incident-image img-fluid rounded"
                                              style={{ maxWidth: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }}
                                          />
                                        </div>
                                      </ListGroup.Item>
                                  )}
                                  {/* --- END ADDITION --- */}
                                </ListGroup>
                              </Card.Body>
                            </Card>
                        ))}
                      </div>
                  )}

                  {resolvedIncidents.length > 0 && (
                      <div className="mb-4">
                        {pendingIncidents.length > 0 && <hr className="my-3" />}
                        <h4 className="text-muted">Resueltos</h4>
                        {resolvedIncidents.map((incident) => (
                            <Card key={incident.id} className="incident-card mb-3 shadow-sm">
                              <Card.Body className="p-3">
                                <Card.Title className="incident-card-title mb-2">{incident.title}</Card.Title>
                                <ListGroup variant="flush">
                                  <ListGroup.Item><strong>Descripción:</strong> <span className="text-muted">{incident.description}</span></ListGroup.Item>
                                  <ListGroup.Item><strong>Estado:</strong> <span className={`status-${incident.status.toLowerCase().replace(' ', '-')}`}>{incident.status}</span></ListGroup.Item>
                                  <ListGroup.Item><strong>Creado el:</strong> <span className="text-muted">{formatDate(incident.creationDate)}</span></ListGroup.Item>
                                  {incident.resolutionDate && (
                                      <ListGroup.Item><strong>Fecha de Resolución:</strong> <span className="text-muted">{formatDate(incident.resolutionDate)}</span></ListGroup.Item>
                                  )}
                                  {/* --- ADD THIS PART FOR THE IMAGE (Base64) --- */}
                                  {incident.image && (
                                      <ListGroup.Item className="text-center">
                                        <strong>Imagen:</strong>
                                        <div className="incident-image-container mt-2">
                                          <img
                                              src={`data:image/jpeg;base64,${incident.image}`}
                                              alt={`Incidente: ${incident.title}`}
                                              className="incident-image img-fluid rounded"
                                              style={{ maxWidth: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }}
                                          />
                                        </div>
                                      </ListGroup.Item>
                                  )}
                                  {/* --- END ADDITION --- */}
                                </ListGroup>
                              </Card.Body>
                            </Card>
                        ))}
                      </div>
                  )}

                  {otherIncidents.length > 0 && (
                      <div>
                        {(resolvedIncidents.length > 0 || pendingIncidents.length > 0) && <hr className="my-3" />}
                        <h4 className="text-muted">Otros</h4>
                        {otherIncidents.map((incident) => (
                            <Card key={incident.id} className="incident-card mb-3 shadow-sm">
                              <Card.Body className="p-3">
                                <Card.Title className="incident-card-title mb-2">{incident.title}</Card.Title>
                                <ListGroup variant="flush">
                                  <ListGroup.Item><strong>Descripción:</strong> <span className="text-muted">{incident.description}</span></ListGroup.Item>
                                  <ListGroup.Item><strong>Estado:</strong> <span className={`status-${incident.status.toLowerCase().replace(' ', '-')}`}>{incident.status}</span></ListGroup.Item>
                                  <ListGroup.Item><strong>Creado el:</strong> <span className="text-muted">{formatDate(incident.creationDate)}</span></ListGroup.Item>
                                  {incident.resolutionDate && (
                                      <ListGroup.Item><strong>Fecha de Resolución:</strong> <span className="text-muted">{formatDate(incident.resolutionDate)}</span></ListGroup.Item>
                                  )}
                                  {/* --- ADD THIS PART FOR THE IMAGE (Base64) --- */}
                                  {incident.image && (
                                      <ListGroup.Item className="text-center">
                                        <strong>Imagen:</strong>
                                        <div className="incident-image-container mt-2">
                                          <img
                                              src={`data:image/jpeg;base64,${incident.image}`}
                                              alt={`Incidente: ${incident.title}`}
                                              className="incident-image img-fluid rounded"
                                              style={{ maxWidth: '100%', height: 'auto', maxHeight: '200px', objectFit: 'contain' }}
                                          />
                                        </div>
                                      </ListGroup.Item>
                                  )}
                                  {/* --- END ADDITION --- */}
                                </ListGroup>
                              </Card.Body>
                            </Card>
                        ))}
                      </div>
                  )}
                </>
            ) : (
                buildingId && !error && <p className="text-muted text-center">No hay incidentes registrados para este edificio.</p>
            )}
          </Col>
        </Row>
      </Container>
  );
};

export default Historic;