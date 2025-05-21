import React, { useState } from "react"; // Removed useEffect as it's not used in this version
import { Card, Form, Button, Row, Col, Alert, Container } from "react-bootstrap"; // <-- ADDED Container HERE
import axios from "axios";

function WorkerRol() {
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        contacto: "", // Keep this as a string for input handling
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        let value = e.target.value;
        if (e.target.name === "contacto") {
            // Only allow digits for contact, but keep it as a string in formData
            value = value.replace(/[^0-9]/g, '');
            // You can also add a length limit here if needed, e.g., .slice(0, 9);
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        // Basic validation for all fields
        if (!formData.nombre || !formData.apellidos || !formData.contacto) {
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

        const workerData = {
            contact: parseInt(formData.contacto, 10), // Now it's explicitly an integer
            name: formData.nombre,
            surname: formData.apellidos,
        };

        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setErrorMessage("Error: Token de autenticación no encontrado.");
                setLoading(false);
                return;
            }

            const response = await axios.post("http://localhost:8080/api/workers", workerData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 201 || response.status === 200) {
                setSuccessMessage("Trabajador creado con éxito!");
                setFormData({ nombre: "", apellidos: "", contacto: "" }); // Reset form
            } else {
                setErrorMessage(`Error al crear trabajador: ${response.statusText || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("Error al crear el trabajador:", error);
            if (error.response) {
                setErrorMessage(
                    `Error: ${error.response.data.message || error.response.data || error.response.statusText || "Error al conectar con el servidor"}`
                );
            } else if (error.request) {
                setErrorMessage("No se pudo conectar con el servidor. Por favor, revisa tu conexión.");
            } else {
                setErrorMessage(`Error al enviar la solicitud: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container> {/* This is the Container that needed to be imported */}
            <Card className="mt-4 p-3 shadow-sm card-custom">
                <Card.Title className="mb-3 text-custom">
                    Crear Nuevo Trabajador
                </Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Row className="mb-3">
                        <Col md={12}>
                            <Form.Group controlId="formNombre">
                                <Form.Label className="fw-bold">Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nombre"
                                    placeholder="Ingrese su nombre"
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
                                    placeholder="Ingrese sus apellidos"
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
                            <Form.Group controlId="formContacto">
                                <Form.Label className="fw-bold">Contacto</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contacto"
                                    placeholder="Ingrese su número de contacto"
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
                                {loading ? "Creando..." : "Crear Trabajador"}
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