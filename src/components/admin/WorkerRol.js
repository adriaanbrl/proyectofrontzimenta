import React, { useState } from "react";
import { Card, Form, Button, Row, Col, Alert, Container } from "react-bootstrap";
import axios from "axios";

function WorkerRol() {
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        email: "",
        usuario: "", // New field for username
        password: "", // New field for password
        contacto: "",
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        let value = e.target.value;
        if (e.target.name === "contacto") {
            // Allow only digits for contact
            value = value.replace(/[^0-9]/g, '');
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        // Basic validation for all fields
        if (!formData.nombre || !formData.apellidos || !formData.email ||
            !formData.usuario || !formData.password || !formData.contacto) {
            setErrorMessage("Todos los campos son obligatorios.");
            setLoading(false);
            return;
        }

        // Validate contact before parsing
        if (!/^\d+$/.test(formData.contacto)) {
            setErrorMessage("El campo 'Contacto' debe ser un número válido.");
            setLoading(false);
            return;
        }

        // Validate email format
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setErrorMessage("El formato del email no es válido.");
            setLoading(false);
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
            setErrorMessage("Error: Token de autenticación no encontrado.");
            setLoading(false);
            return;
        }

        let customerId = null;

        try {
            // --- Step 1: Create Customer ---
            const customerData = {
                name: formData.nombre,
                surname: formData.apellidos,
                email: formData.email,
                username: formData.usuario,
                password: formData.password, // Ensure your backend handles password hashing
                rol_id: 3, // Default rol_id for customer
            };

            const customerResponse = await axios.post(
                "http://localhost:8080/auth/admin/customers", // CORRECTED API PATH
                customerData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Log the full response data to help debug the missing ID
            console.log("Customer creation response data:", customerResponse.data);

            // Check if the response is HTML (indicating a security redirection)
            if (typeof customerResponse.data === 'string' && customerResponse.data.startsWith('<!DOCTYPE html>')) {
                setErrorMessage("Error de autenticación o autorización. El servidor devolvió una página HTML de inicio de sesión. Por favor, verifica tu token de autenticación y la configuración de seguridad en el backend para /auth/admin/customers.");
                setLoading(false);
                return;
            }

            if (customerResponse.status === 201 || customerResponse.status === 200) {
                // Check if 'id' exists directly on the data object
                customerId = customerResponse.data.id;

                // If your backend returns the ID nested, e.g., { customer: { id: 123 } },
                // you might need to adjust this line. For example:
                // customerId = customerResponse.data.customer?.id;

                if (!customerId) {
                    setErrorMessage("Error: No se recibió el ID del cliente después de la creación. Por favor, revisa la consola para ver la respuesta del servidor.");
                    setLoading(false);
                    return;
                }
                setSuccessMessage("Cliente creado con éxito. Procediendo a crear trabajador...");
            } else {
                setErrorMessage(`Error al crear el cliente: ${customerResponse.statusText || 'Error desconocido'}`);
            }

            // --- Step 2: Create Worker using the obtained Customer ID ---
            const workerData = {
                contact: parseInt(formData.contacto, 10),
                // Corrected: Send customerId nested within a 'customer' object
                customer: { id: customerId },
            };

            const workerResponse = await axios.post(
                "http://localhost:8080/auth/admin/workers", // CORRECTED API PATH
                workerData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (workerResponse.status === 201 || workerResponse.status === 200) {
                setSuccessMessage("Trabajador y Cliente creados con éxito!");
                // Reset form fields
                setFormData({
                    nombre: "",
                    apellidos: "",
                    email: "",
                    usuario: "",
                    password: "",
                    contacto: "",
                });
            } else {
                setErrorMessage(`Error al crear el trabajador: ${workerResponse.statusText || 'Error desconocido'}`);
            }

        } catch (error) {
            console.error("Error en la creación:", error);
            if (error.response) {
                // Specific error messages from backend
                setErrorMessage(
                    `Error: ${error.response.data.message || error.response.data || error.response.statusText || "Error al conectar con el servidor"}`
                );
            } else if (error.request) {
                // No response from server
                setErrorMessage("No se pudo conectar con el servidor. Por favor, revisa tu conexión.");
            } else {
                setErrorMessage(`Error al enviar la solicitud: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <Card className="mt-4 p-3 shadow-sm card-custom">
                <Card.Title className="mb-3 text-custom">
                    Crear Nuevo Trabajador y Cliente
                </Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group controlId="formNombre">
                                <Form.Label className="fw-bold">Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nombre"
                                    placeholder="Ingrese el nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group controlId="formApellidos">
                                <Form.Label className="fw-bold">Apellido</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="apellidos"
                                    placeholder="Ingrese los apellidos"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group controlId="formEmail">
                                <Form.Label className="fw-bold">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    placeholder="Ingrese el email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group controlId="formUsuario">
                                <Form.Label className="fw-bold">Usuario</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="usuario"
                                    placeholder="Ingrese el nombre de usuario"
                                    value={formData.usuario}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group controlId="formPassword">
                                <Form.Label className="fw-bold">Contraseña</Form.Label>
                                <Form.Control
                                    type="password"
                                    name="password"
                                    placeholder="Ingrese la contraseña"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group controlId="formContacto">
                                <Form.Label className="fw-bold">Contacto (Número de Teléfono)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contacto"
                                    placeholder="Ingrese el número de contacto"
                                    value={formData.contacto}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="mb-3">
                        <Col md={12}>
                            <Button
                                type="submit"
                                variant="btn btn-outline-custom"
                                className="w-100 mt-3"
                                disabled={loading}
                            >
                                {loading ? "Creando..." : "Crear Trabajador y Cliente"}
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {successMessage && (
                    <Alert variant="success" className="mt-3">
                        {successMessage}
                    </Alert>
                )}
                {errorMessage && (
                    <Alert variant="danger" className="mt-3">
                        {errorMessage}
                    </Alert>
                )}
            </Card>
        </Container>
    );
}

export default WorkerRol;
