import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  ListGroup,
  Alert,
  Spinner,
  Form,
  Button,
  Modal,
  Image,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// --- NEW IMPORT ---
import IncidentEditModal from "./IncidentEditModal"; // You'll need to create this file

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token in BuildingIncidentsSection:", error);
    return true;
  }
};

const BuildingIncidentsSection = ({ buildingData }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageBase64, setCurrentImageBase64] = useState("");

  // --- NEW STATES FOR EDITING ---
  const [showEditIncidentModal, setShowEditIncidentModal] = useState(false);
  const [currentIncidentToEdit, setCurrentIncidentToEdit] = useState(null);
  const [loadingIncidentAction, setLoadingIncidentAction] = useState(false); // To show spinner on save
  const [incidentActionError, setIncidentActionError] = useState(null); // To show error on save

  const fetchIncidents = useCallback(async (buildingId) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("authToken");

    if (!token || isTokenExpired(token)) {
      setError(
        "Su sesión ha expirado o no está autenticado. Por favor, inicie sesión de nuevo."
      );
      setLoading(false);
      if (token) localStorage.removeItem("authToken");
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
      setIncidents(response.data);
    } catch (err) {
      console.error("Error al obtener los incidentes:", err);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          localStorage.removeItem("authToken");
          setError("Acceso denegado. Su sesión ha expirado.");
        } else if (err.response.status === 404) {
          setError("No se encontraron incidentes para esta construcción.");
        } else {
          setError(
            `Error al cargar los incidentes: ${
              err.response.data.message || err.message
            }`
          );
        }
      } else {
        setError(
          `Error de red: ${err.message || "Por favor, revise su conexión."}`
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (buildingData && buildingData.id) {
      fetchIncidents(buildingData.id);
    } else {
      setError(
        "No se proporcionó el ID del edificio para cargar los incidentes."
      );
      setLoading(false);
    }
  }, [buildingData, fetchIncidents]);

  const handleStatusChange = async (incidentId, newStatus) => {
    setUpdatingStatus(true);
    setError(null);

    const token = localStorage.getItem("authToken");
    if (!token || isTokenExpired(token)) {
      setError(
        "Su sesión ha expirado o no está autenticado. Por favor, inicie sesión de nuevo."
      );
      setUpdatingStatus(false);
      if (token) localStorage.removeItem("authToken");
      return;
    }

    const originalIncidents = [...incidents];

    try {
      setIncidents((prevIncidents) =>
        prevIncidents.map((inc) =>
          inc.id === incidentId ? { ...inc, status: newStatus } : inc
        )
      );

      const body = { status: newStatus };
      if (
        newStatus === "Resuelta" &&
        !originalIncidents.find((inc) => inc.id === incidentId)?.resolutionDate
      ) {
        body.resolutionDate = new Date().toISOString().split("T")[0];
      } else if (
        newStatus !== "Resuelta" &&
        originalIncidents.find((inc) => inc.id === incidentId)?.resolutionDate
      ) {
        body.resolutionDate = null;
      }

      const response = await axios.put(
        `http://localhost:8080/api/buildings/${buildingData.id}/incidents/${incidentId}/status`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // After successful status change, re-fetch all incidents to ensure consistency
      fetchIncidents(buildingData.id);
    } catch (err) {
      console.error("Error al actualizar el estado del incidente:", err);
      setIncidents(originalIncidents);
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          localStorage.removeItem("authToken");
          setError("Acceso denegado. Su sesión ha expirado.");
        } else {
          setError(
            `Error al actualizar el estado: ${
              err.response.data.message || err.message
            }`
          );
        }
      } else {
        setError(
          `Error de red: ${err.message || "Por favor, revise su conexión."}`
        );
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  // --- NEW: handleEditIncident function ---
  const handleEditIncident = (incident) => {
    setCurrentIncidentToEdit(incident);
    setShowEditIncidentModal(true);
    setIncidentActionError(null); // Clear any previous errors
  };

  // --- NEW: handleIncidentSaved function (callback from modal) ---
  const handleIncidentSaved = async (updatedIncidentData) => {
    setLoadingIncidentAction(true);
    setIncidentActionError(null);
    const token = localStorage.getItem("authToken");

    if (!token || isTokenExpired(token)) {
      setIncidentActionError("Su sesión ha expirado o no está autenticado.");
      setLoadingIncidentAction(false);
      if (token) localStorage.removeItem("authToken");
      return;
    }

    try {
      // Backend endpoint for updating an incident (ensure this exists and accepts PUT with incident ID)
      const response = await axios.put(
        `http://localhost:8080/api/buildings/${buildingData.id}/incidents/${updatedIncidentData.id}`,
        updatedIncidentData.formData, // Assuming your modal returns formData directly
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // No 'Content-Type' for FormData, Axios handles it.
          },
        }
      );
      // After successful update, re-fetch all incidents for this building
      fetchIncidents(buildingData.id);
      setShowEditIncidentModal(false); // Close modal on success
      setCurrentIncidentToEdit(null); // Clear edited incident data
    } catch (err) {
      console.error("Error al actualizar el incidente:", err);
      if (axios.isAxiosError(err) && err.response) {
        setIncidentActionError(
          `Error al actualizar incidente: ${
            err.response.data.message || err.message
          }`
        );
      } else {
        setIncidentActionError(
          `Error de red: ${err.message || "Por favor, revise su conexión."}`
        );
      }
    } finally {
      setLoadingIncidentAction(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const statusOptions = ["Pendiente", "En Revisión", "Resuelta", "Cerrada"];

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Pendiente":
        return "warning";
      case "En Revisión":
        return "primary";
      case "Resuelta":
        return "success";
      case "Cerrada":
        return "secondary";
      default:
        return "info";
    }
  };

  const handleImageClick = (imageBase64) => {
    setCurrentImageBase64(imageBase64);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setCurrentImageBase64("");
  };

  const pendingAndReviewIncidents = incidents.filter(
    (inc) => inc.status === "Pendiente" || inc.status === "En Revisión"
  );
  const resolvedAndClosedIncidents = incidents.filter(
    (inc) => inc.status === "Resuelta" || inc.status === "Cerrada"
  );

  return (
    <Card className="mb-4 shadow border-0">
      <Card.Header className="bg-custom border-bottom fw-bold text-white">
        Incidentes de "{buildingData?.title || buildingData?.address || "N/A"}"
      </Card.Header>
      <Card.Body className="px-4 py-3">
        {loading ? (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando incidentes...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            {/* Incidentes Pendientes / En Revisión */}
            {pendingAndReviewIncidents.length > 0 && (
              <div className="mb-5">
                <h5 className="mb-3">
                  Incidentes Pendientes y En Revisión (
                  {pendingAndReviewIncidents.length})
                </h5>
                <ListGroup>
                  {pendingAndReviewIncidents.map((incident) => (
                    <ListGroup.Item
                      key={incident.id}
                      className="py-3 px-3 d-flex flex-column flex-md-row align-items-start justify-content-between"
                    >
                      <div className="me-md-4 flex-grow-1">
                        <h6 className="fw-bold mb-1">{incident.title}</h6>
                        <p className="text-muted small mb-2">
                          {incident.description}
                        </p>
                        <div className="d-flex flex-wrap align-items-center gap-2 small">
                          <span className="text-dark">
                            Creado el: {formatDate(incident.creationDate)}
                          </span>
                          <Badge bg={getStatusBadgeVariant(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                        {incident.image && (
                          <div className="mt-3">
                            <Image
                              src={`data:image/jpeg;base64,${incident.image}`}
                              thumbnail
                              style={{
                                maxWidth: "120px",
                                height: "auto",
                                cursor: "pointer",
                              }}
                              onClick={() => handleImageClick(incident.image)}
                            />
                          </div>
                        )}
                      </div>
                      <div className="mt-3 mt-md-0">
                        <Form.Select
                          size="sm"
                          value={incident.status}
                          onChange={(e) =>
                            handleStatusChange(incident.id, e.target.value)
                          }
                          disabled={updatingStatus}
                          className="w-auto"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Form.Select>
                        {updatingStatus && (
                          <Spinner
                            animation="border"
                            size="sm"
                            className="ms-2"
                          />
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}

            {/* Incidentes Resueltos / Cerrados */}
            {resolvedAndClosedIncidents.length > 0 && (
              <div>
                <h5 className="mb-3">
                  Incidentes Resueltos y Cerrados (
                  {resolvedAndClosedIncidents.length})
                </h5>
                <ListGroup>
                  {resolvedAndClosedIncidents.map((incident) => (
                    <ListGroup.Item
                      key={incident.id}
                      className="py-3 px-3 d-flex flex-column flex-md-row align-items-start justify-content-between bg-light"
                    >
                      <div className="me-md-4 flex-grow-1">
                        <h6 className="fw-bold text-muted mb-1">
                          {incident.title}
                        </h6>
                        <p className="text-muted small mb-2">
                          {incident.description}
                        </p>
                        <div className="d-flex flex-wrap align-items-center gap-2 small">
                          <span className="text-dark">
                            Creado el: {formatDate(incident.creationDate)}
                          </span>
                          {incident.resolutionDate && (
                            <span className="text-dark">
                              Resuelto el: {formatDate(incident.resolutionDate)}
                            </span>
                          )}
                          <Badge bg={getStatusBadgeVariant(incident.status)}>
                            {incident.status}
                          </Badge>
                        </div>
                        {incident.image && (
                          <div className="mt-3">
                            <Image
                              src={`data:image/jpeg;base64,${incident.image}`}
                              thumbnail
                              style={{
                                maxWidth: "120px",
                                height: "auto",
                                cursor: "pointer",
                              }}
                              onClick={() => handleImageClick(incident.image)}
                            />
                          </div>
                        )}
                      </div>
                      <div className="mt-3 mt-md-0 d-flex flex-column flex-md-row gap-2">
                        {" "}
                        {/* Added flex layout for buttons */}
                        <Form.Select
                          size="sm"
                          value={incident.status}
                          onChange={(e) =>
                            handleStatusChange(incident.id, e.target.value)
                          }
                          disabled={updatingStatus} // Allow status change for resolved/closed
                          className="w-auto"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Form.Select>
                        {/* --- NEW: Edit Button for Resolved/Closed Incidents --- */}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditIncident(incident)}
                          disabled={loadingIncidentAction}
                        >
                          {loadingIncidentAction ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            "✏️ Editar"
                          )}
                        </Button>
                        {updatingStatus && (
                          <Spinner
                            animation="border"
                            size="sm"
                            className="ms-2"
                          />
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}

            {pendingAndReviewIncidents.length === 0 &&
              resolvedAndClosedIncidents.length === 0 && (
                <Alert variant="info">
                  No hay incidentes registrados en esta construcción.
                </Alert>
              )}
          </>
        )}
      </Card.Body>

      {/* Image Viewer Modal */}
      <Modal
        show={showImageModal}
        onHide={handleCloseImageModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Imagen del Incidente</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          {currentImageBase64 ? (
            <Image
              src={`data:image/jpeg;base64,${currentImageBase64}`}
              fluid
              style={{ maxHeight: "80vh", objectFit: "contain" }}
            />
          ) : (
            <p>No se pudo cargar la imagen.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseImageModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- NEW: Incident Edit Modal --- */}
      {currentIncidentToEdit && ( // Only render if an incident is selected for editing
        <IncidentEditModal
          show={showEditIncidentModal}
          onHide={() => setShowEditIncidentModal(false)}
          incidentData={currentIncidentToEdit}
          onSave={handleIncidentSaved}
          isLoading={loadingIncidentAction}
          error={incidentActionError}
          // Pass setters down to the modal if it needs to manage its own loading/error
          setLoading={setLoadingIncidentAction}
          setError={setIncidentActionError}
        />
      )}
    </Card>
  );
};
export default BuildingIncidentsSection;
