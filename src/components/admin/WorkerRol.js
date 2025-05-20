import React, { useState } from "react";
import { Container, Row, Col, Button, Card, Form, Alert } from "react-bootstrap";
import axios from "axios";

function WorkerRol() {
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        contacto: "",
    });
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (e) => {
        let value = e.target.value;
        if (e.target.name === "contacto") {
            value = value.replace(/[^0-9]/g, '').slice(0, 9);
        }
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        const workerData = {
            contact: parseInt(formData.contacto, 10), 
            name: formData.nombre,
            surname: formData.apellidos,
        };

        try {
            const response = await axios.post("http://localhost:8080/api/workers", workerData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            if (response.status === 201 || response.status === 200) {
                setSuccessMessage("Trabajador creado con éxito!");
                setFormData({ nombre: "", apellidos: "", contacto: "" });
            } else {
                setErrorMessage(`Error al crear trabajador: ${response.statusText || 'Error desconocido'}`);
            }
        } catch (error) {
            console.error("Error al crear el trabajador:", error);
            if (error.response) {
                setErrorMessage(
                    `Error: ${error.response.data.message || error.response.data || "Error al conectar con el servidor"}`
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
        <Container>
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
