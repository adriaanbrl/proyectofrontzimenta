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

function WorkerContactList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workerId, setWorkerId] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkerId = () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
     
          setWorkerId(decodedToken.id);
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

    fetchWorkerId();
  }, []);

  useEffect(() => {
    const fetchContacts = async () => {
      if (!workerId) {

        setError("ID del trabajador no encontrado.");
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
          `http://localhost:8080/auth/worker/${workerId}/assigned-customers`,
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

        setContacts(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (workerId && authToken) {
      fetchContacts();
    }
  }, [workerId, authToken]);

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

    const handleChatClick = (contact) => { // Recibimos el objeto contact completo
    navigate(`/chatTrabajador?contactId=${contact.id}&contactName=${contact.name}`);
  };

  return (
    <Container className=" p-4  rounded-4 ">
      <div className="header-section d-flex align-items-center justify-content-center mb-4">
        <h1 className=" flex-grow-1 text-title text-center mb-5 fw-bold fs-2 mt-5">
          Contactos Disponibles
        </h1>
      </div>
      <Row className="gy-4">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <Col key={contact.id} xs={12} md={6} lg={4}>
              <Card className="h-100 shadow rounded-3">
                <Card.Body className="p-4">
                  <Card.Title className="text-custom mb-3 fs-4 fw-bold">
                    {contact.name}
                  </Card.Title>
                  <Card.Subtitle className="mb-4 text-muted fs-6">
                    Email: {contact.email || "N/A"}
                  </Card.Subtitle>
                  <Button
                    onClick={() => handleChatClick(contact)} // Pasamos el objeto contact completo
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
            <Alert variant="info">No tienes clientes asignados.</Alert>
          </Col>
        )}
      </Row>
    </Container>
  );
}
export default WorkerContactList;