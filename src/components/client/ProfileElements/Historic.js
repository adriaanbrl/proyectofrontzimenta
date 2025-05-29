import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Alert, Container, Row, Col, Button, Modal, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './Historic.css';
import { ChevronLeft, Edit, Trash2 } from 'lucide-react';

const Historic = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [buildingId, setBuildingId] = useState('');
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentIncident, setCurrentIncident] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    status: '', // Se mantiene en el estado para lógica interna, pero no en el formulario
    categoryId: '',
    roomId: '',
    resolutionDate: '',
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Define el color principal de la aplicación
  const appColor = '#f5922c';

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
      fetchIncidents();
      fetchCategories();
      fetchRooms();
    }
  }, [buildingId]);

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
      console.log("Respuesta del backend (incidentes):", response.data);
      setIncidents(response.data);
      setError(null);
    } catch (error) {
      console.error('Error al obtener los incidentes:', error);
      setError('Error al cargar el historial de incidentes.');
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get(`http://localhost:8080/api/categorias`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error al cargar las categorías:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchRooms = async () => {
    setLoadingRooms(true);
    const token = localStorage.getItem('authToken');
    try {
      const response = await axios.get(`http://localhost:8080/api/estancias`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRooms(response.data);
    } catch (error) {
      console.error('Error al cargar las estancias:', error);
    } finally {
      setLoadingRooms(false);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const resolvedIncidents = incidents
      .filter(incident => incident.status && incident.status.toLowerCase() === 'resuelta')
      .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

  const pendingIncidents = incidents
      .filter(incident => incident.status && incident.status.toLowerCase() === 'pendiente')
      .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

  const otherIncidents = incidents
      .filter(
          incident => incident.status && incident.status.toLowerCase() !== 'resuelta' && incident.status.toLowerCase() !== 'pendiente'
      )
      .sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleEditClick = (incident) => {
    // Solo permitir la edición si el estado no es 'Resuelta' o 'Cerrada'
    if (incident.status.toLowerCase() === 'resuelta' || incident.status.toLowerCase() === 'cerrada') {
      alert('No se pueden editar incidentes con estado "Resuelta" o "Cerrada".');
      return;
    }
    setCurrentIncident(incident);
    setEditFormData({
      title: incident.title,
      description: incident.description,
      status: incident.status, // Se mantiene aquí para la lógica de resolutionDate
      categoryId: incident.categoryId ? String(incident.categoryId) : '',
      roomId: incident.roomId ? String(incident.roomId) : '',
      resolutionDate: incident.resolutionDate ? formatDateForInput(incident.resolutionDate) : '',
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = async (incidentId, incidentStatus) => {
    // Solo permitir la eliminación si el estado no es 'Resuelta' o 'Cerrada'
    if (incidentStatus.toLowerCase() === 'resuelta' || incidentStatus.toLowerCase() === 'cerrada') {
      alert('No se pueden eliminar incidentes con estado "Resuelta" o "Cerrada".');
      return;
    }
    if (window.confirm('¿Estás seguro de que quieres eliminar este incidente?')) {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No se encontró el token de autenticación.');
        return;
      }
      try {
        await axios.delete(
            `http://localhost:8080/api/buildings/${buildingId}/incidents/${incidentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );
        setSuccessMessage('Incidente eliminado con éxito.');
        fetchIncidents();
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error('Error al eliminar el incidente:', error);
        setError('Error al eliminar el incidente.');
      }
    }
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setCurrentIncident(null);
    setEditFormData({
      title: '',
      description: '',
      status: '',
      categoryId: '',
      roomId: '',
      resolutionDate: '',
    });
    setError(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveEdit = async () => {
    if (!currentIncident || !buildingId) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('No se encontró el token de autenticación.');
      return;
    }

    try {
      const payload = {
        title: editFormData.title,
        description: editFormData.description,
        // Al editar desde esta vista, el status siempre debe ser "Pendiente"
        status: "Pendiente",
        categoryId: editFormData.categoryId ? parseInt(editFormData.categoryId) : null,
        roomId: editFormData.roomId ? parseInt(editFormData.roomId) : null,
        // La fecha de resolución se gestiona si el estado es 'Resuelta' (aunque no debería ocurrir desde aquí)
        resolutionDate: editFormData.status.toLowerCase() === 'resuelta' && editFormData.resolutionDate ? editFormData.resolutionDate : null,
      };
      console.log("Payload para actualizar:", payload);

      await axios.put(
          `http://localhost:8080/api/buildings/${buildingId}/incidents/${currentIncident.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
      );
      setSuccessMessage('Incidente actualizado con éxito.');
      handleModalClose();
      fetchIncidents();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error al actualizar el incidente:', error.response ? error.response.data : error.message);
      setError('Error al actualizar el incidente: ' + (error.response ? error.response.data.message || error.response.data : error.message));
    }
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
            {successMessage && <Alert variant="success">{successMessage}</Alert>}
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
                                </ListGroup>
                                <div className="d-flex justify-content-end mt-3">
                                  <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="me-2 px-4 py-2 rounded shadow-sm"
                                      onClick={() => handleEditClick(incident)}
                                      aria-label="Editar incidente"
                                      style={{ borderColor: appColor, color: appColor }} // Estilo personalizado
                                  >
                                    <Edit size={16} className="me-1" /> Editar
                                  </Button>
                                  <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="px-4 py-2 rounded shadow-sm"
                                      onClick={() => handleDeleteClick(incident.id, incident.status)}
                                      aria-label="Eliminar incidente"
                                  >
                                    <Trash2 size={16} className="me-1" /> Eliminar
                                  </Button>
                                </div>
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
                                </ListGroup>
                                {/* Condición para no mostrar los botones si el incidente está resuelto o cerrado */}
                                {incident.status.toLowerCase() !== 'resuelta' && incident.status.toLowerCase() !== 'cerrada' && (
                                    <div className="d-flex justify-content-end mt-3">
                                      <Button
                                          variant="outline-primary"
                                          size="sm"
                                          className="me-2 px-4 py-2 rounded shadow-sm"
                                          onClick={() => handleEditClick(incident)}
                                          aria-label="Editar incidente"
                                          style={{ borderColor: appColor, color: appColor }} // Estilo personalizado
                                      >
                                        <Edit size={16} className="me-1" /> Editar
                                      </Button>
                                      <Button
                                          variant="outline-danger"
                                          size="sm"
                                          className="px-4 py-2 rounded shadow-sm"
                                          onClick={() => handleDeleteClick(incident.id, incident.status)}
                                          aria-label="Eliminar incidente"
                                      >
                                        <Trash2 size={16} className="me-1" /> Eliminar
                                      </Button>
                                    </div>
                                )}
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
                                </ListGroup>
                                {/* Condición para no mostrar los botones si el incidente está resuelto o cerrado */}
                                {incident.status.toLowerCase() !== 'resuelta' && incident.status.toLowerCase() !== 'cerrada' && (
                                    <div className="d-flex justify-content-end mt-3">
                                      <Button
                                          variant="outline-primary"
                                          size="sm"
                                          className="me-2 px-4 py-2 rounded shadow-sm"
                                          onClick={() => handleEditClick(incident)}
                                          aria-label="Editar incidente"
                                          style={{ borderColor: appColor, color: appColor }} // Estilo personalizado
                                      >
                                        <Edit size={16} className="me-1" /> Editar
                                      </Button>
                                      <Button
                                          variant="outline-danger"
                                          size="sm"
                                          className="px-4 py-2 rounded shadow-sm"
                                          onClick={() => handleDeleteClick(incident.id, incident.status)}
                                          aria-label="Eliminar incidente"
                                      >
                                        <Trash2 size={16} className="me-1" /> Eliminar
                                      </Button>
                                    </div>
                                )}
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

        {/* Modal de Edición */}
        <Modal show={showEditModal} onHide={handleModalClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>Editar Incidente</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Título</Form.Label>
                <Form.Control
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleFormChange}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={editFormData.description}
                    onChange={handleFormChange}
                />
              </Form.Group>
              {/* No se muestra el campo de estado para que los clientes no puedan cambiarlo,
                  y se forzará a 'Pendiente' en el payload si se edita desde aquí. */}

              {/* Dropdown para Categorías */}
              <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                {loadingCategories ? (
                    <Spinner animation="border" size="sm" />
                ) : (
                    <Form.Select
                        name="categoryId"
                        value={editFormData.categoryId}
                        onChange={handleFormChange}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                      ))}
                    </Form.Select>
                )}
              </Form.Group>

              {/* Dropdown para Estancias/Habitaciones */}
              <Form.Group className="mb-3">
                <Form.Label>Estancia/Habitación</Form.Label>
                {loadingRooms ? (
                    <Spinner animation="border" size="sm" />
                ) : (
                    <Form.Select
                        name="roomId"
                        value={editFormData.roomId}
                        onChange={handleFormChange}
                    >
                      <option value="">Selecciona una estancia</option>
                      {rooms.map(room => (
                          <option key={room.id} value={room.id}>
                            {room.name}
                          </option>
                      ))}
                    </Form.Select>
                )}
              </Form.Group>

              {/* La fecha de resolución se muestra si el incidente ya está resuelto y tiene una fecha
                  (esto es una medida de seguridad, pero en teoría no se debería llegar aquí si el incidente no es 'Pendiente') */}
              {editFormData.status.toLowerCase() === 'resuelta' && (
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha de Resolución</Form.Label>
                    <Form.Control
                        type="date"
                        name="resolutionDate"
                        value={editFormData.resolutionDate}
                        onChange={handleFormChange}
                        disabled={true} // Deshabilitado porque el usuario no debería cambiarlo si ya está resuelto
                    />
                  </Form.Group>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Cancelar
            </Button>
            <Button
                variant="primary"
                onClick={handleSaveEdit}
                style={{ backgroundColor: appColor, borderColor: appColor }} // Estilo personalizado
            >
              Guardar Cambios
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
  );
};

export default Historic;
