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
          console.log("Decoded Token:", decodedToken);
          setWorkerId(decodedToken.id); // Assuming 'id' is the worker's ID in the token
          setAuthToken(token);
        } catch (decodeError) {
          console.error("Error decoding token:", decodeError);
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
        console.warn("workerId is undefined or null. Cannot fetch contacts.");
        setError("ID del trabajador no encontrado.");
        setLoading(false);
        return;
      }

      if (!authToken) {
        console.warn("authToken is undefined or null. Cannot fetch contacts.");
        setError("Token de autenticación no encontrado.");
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching contacts for worker ID: ${workerId}`);
        const response = await fetch(
          `http://localhost:8080/auth/worker/${workerId}/contacts`, // Adjusted API endpoint
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `HTTP error! status: ${response.status}, response: ${errorText}`
          );
          throw new Error(
            `Error HTTP: ${response.status}, Mensaje: ${errorText}`
          );
        }
        const data = await response.json();
        console.log("Received contacts data:", data);
        setContacts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los contactos:", error);
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

  const handleChatClick = (contactId) => {
    navigate(`/chat?contactId=${contactId}`); // Assuming your chat route handles contactId
  };

  return (
    <Container className=" p-4  rounded-4 ">
      <h1 className="text-center mb-5  fw-bold fs-2 mt-5" style={{ color: "#f5922c" }}>
        Lista de Contactos
      </h1>
      <Row className="gy-4">
        {contacts.length > 0 ? (
          contacts.map((contact) => (
            <Col key={contact.id} xs={12} md={6} lg={4}>
              <Card className="h-100 shadow rounded-3">
                <Card.Body className="p-4">
                  <Card.Title className="text-primary mb-3 fs-4 fw-bold">
                    {contact.name}
                  </Card.Title>
                  <Card.Subtitle className="mb-4 text-muted fs-6">
                    Contacto: {contact.contact}
                  </Card.Subtitle>
                  <Button
                    color="#ff8c00"
                    onClick={() => handleChatClick(contact.id)}
                    className="w-100 fw-bold fs-6"
                  >
                    <MessageCircle className="me-2" />{" "}
                    Chat
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col>
            {" "}
            {/* Wrap Alert in Col for consistent layout */}
            <Alert variant="info">No tienes contactos asociados.</Alert>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default ContactList;