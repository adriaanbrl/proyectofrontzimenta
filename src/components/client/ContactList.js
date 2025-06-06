import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);

          setBuildingId(decodedToken.building_id);
          setAuthToken(token);
        } catch (decodeError) {
          setError("Error al decodificar el token.");
          setLoading(false);
        }
      } else {
        setError("Token de autenticación no encontrado.");
        setLoading(false);
      }
    };

    fetchBuildingId();
  }, []);

  useEffect(() => {
    const fetchWorkers = async () => {
      if (!buildingId) {
        setError("ID del edificio no encontrado.");
        setLoading(false);
        return;
      }

      if (!authToken) {
        setError("Token de autenticación no encontrado.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/auth/worker/buildings/${buildingId}/workersInBuilding`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            `Error HTTP: ${response.status}, Mensaje: ${errorText}`
          );
        }
        const data = await response.json();

        setWorkers(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (buildingId && authToken) {
      fetchWorkers();
    }
  }, [buildingId, authToken]);

  if (loading) {
    return (
      <Container className="mt-5 d-flex justify-content-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>
            Se produjo un error al cargar la lista de contactos: {error.message}
          </p>
        </Alert>
      </Container>
    );
  }

  const handleChatClick = (worker) => {
    // Recibimos el objeto worker completo
    navigate(`/chat?workerId=${worker.id}&workerName=${worker.username}`);
  };

  return (
    <Container className=" p-4  rounded-4 ">
      <div className="header-section d-flex align-items-center justify-content-center mb-4">
        <h1 className=" flex-grow-1 text-title text-center mb-5 fw-bold fs-2 mt-5">
          Contactos Disponibles
        </h1>
      </div>
      <Row className="gy-4">
        {workers.length > 0 ? (
          workers.map((worker) => (
            <Col key={worker.id} xs={12} md={6} lg={4}>
              <Card className="h-100 shadow rounded-3">
                <Card.Body className="p-4">
                  <Card.Title className="text-custom mb-3 fs-4 fw-bold">
                    {worker.name}
                  </Card.Title>
                  <Card.Subtitle className="mb-4 text-muted fs-6">
                    Contacto: {worker.contact}
                  </Card.Subtitle>
                  <Button
                    color="#ff8c00"
                    onClick={() => handleChatClick(worker)} // Pasamos el objeto worker completo
                    className="w-100 fw-bold fs-6"
                  >
                    <MessageCircle className="me-2" /> Chat
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            <Alert variant="info">No hay contactos para este edificio.</Alert>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default ContactList;
