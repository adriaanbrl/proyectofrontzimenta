import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { Card, Button, Accordion, Row, Col, Form, Image, Spinner, Alert } from 'react-bootstrap'; // Added Spinner, Alert
import { Link } from 'react-router-dom';
import { PencilSquare } from 'react-bootstrap-icons';
import { jwtDecode } from 'jwt-decode'; // Make sure you have 'jwt-decode' installed

const ProfileImage = ({ imageUrl, onImageChange }) => (
    <div className="position-relative d-inline-block ms-3">
        <Image
            src={imageUrl || 'https://placehold.co/80x80/cccccc/333333?text=Perfil'} // Imagen por defecto
            alt="Perfil del Trabajador"
            roundedCircle
            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
        />
        <Form.Group className="position-absolute bottom-0 end-0 mb-1 me-1">
            <Form.Control
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="d-none"
                id="upload-profile-image"
            />
            <Form.Label htmlFor="upload-profile-image" className="bg-light border rounded-circle p-1" style={{ cursor: 'pointer' }}>
                <PencilSquare size={16} className="text-secondary" />
            </Form.Label>
        </Form.Group>
    </div>
);

const WorkerView = () => {
    const [workerImage, setWorkerImage] = useState(null);
    const [workerName, setWorkerName] = useState("Cargando...");
    const [workerRole, setWorkerRole] = useState("Cargando...");
    const [workerId, setWorkerId] = useState(null); // State to store worker ID
    const [workerConstructions, setWorkerConstructions] = useState([]); // State for constructions
    const [loadingConstructions, setLoadingConstructions] = useState(true); // Loading state for constructions
    const [errorConstructions, setErrorConstructions] = useState(null); // Error state for constructions

    // Memoize the fetch function for constructions
    const fetchWorkerConstructions = useCallback(async (id, token) => {
        setLoadingConstructions(true);
        setErrorConstructions(null);
        try {
            const response = await fetch(`http://localhost:8080/auth/worker/${id}/buildings`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al cargar construcciones: ${response.statusText}`);
            }

            const data = await response.json();
            setWorkerConstructions(data);
        } catch (err) {
            console.error("Error fetching worker constructions:", err);
            setErrorConstructions(err.message);
        } finally {
            setLoadingConstructions(false);
        }
    }, []); // Empty dependency array as it only depends on props/state that don't change frequently

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (token) {
            try {
                const decodedToken = jwtDecode(token);

                setWorkerName(`${decodedToken.name || "Trabajador"} ${decodedToken.lastName || ""}`);
                setWorkerRole(decodedToken.role || "Desconocido");

                // Assuming the worker's ID is available in the token as 'id' or 'worker_id'
                const currentWorkerId = decodedToken.id || decodedToken.worker_id;
                setWorkerId(currentWorkerId);

                if (currentWorkerId) {
                    fetchWorkerConstructions(currentWorkerId, token);
                } else {
                    setErrorConstructions("ID del trabajador no encontrado en el token.");
                    setLoadingConstructions(false);
                }

            } catch (error) {
                console.error("Error al decodificar el token:", error);
                setWorkerName("Error de Carga");
                setWorkerRole("Error de Carga");
                setErrorConstructions("Error de autenticación. Por favor, inicie sesión de nuevo.");
                setLoadingConstructions(false);
                // Optionally redirect to login if token is invalid
                // setTimeout(() => navigate('/login'), 2000);
            }
        } else {
            console.warn("No se encontró ningún token de autenticación en localStorage.");
            setWorkerName("No Disponible");
            setWorkerRole("No Disponible");
            setErrorConstructions("No se encontró el token de autenticación.");
            setLoadingConstructions(false);
        }
    }, [fetchWorkerConstructions]); // Add fetchWorkerConstructions to dependencies

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setWorkerImage(reader.result);
                // Aquí podrías guardar la imagen en tu backend o estado global
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="container mt-4">
            <div className="bg-light p-4 rounded shadow-sm mb-4 d-flex align-items-center justify-content-between">
                <div className="text-start">
                    <h2 className="mb-0 text fw-bold">{workerName}</h2>
                    <p className="mb-0 text fw-bold">ROL: {workerRole}</p>
                </div>
                <ProfileImage imageUrl={workerImage} onImageChange={handleImageChange} />
            </div>
            <h4 className="mb-3 text-secondary">CONSTRUCCIONES ASOCIADAS:</h4>

            {loadingConstructions ? (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Cargando construcciones...</span>
                    </Spinner>
                    <p className="mt-2">Cargando construcciones...</p>
                </div>
            ) : errorConstructions ? (
                <Alert variant="danger">{errorConstructions}</Alert>
            ) : workerConstructions.length > 0 ? (
                <Accordion defaultActiveKey="0">
                    {workerConstructions.map((construction, index) => (
                        <Card key={construction.id} className="mb-3 shadow-sm">
                            <Accordion.Item eventKey={index.toString()}>
                                <Accordion.Header className="bg-white border-bottom">
                                    <strong>{construction.address}</strong> {/* Assuming 'address' is the name field */}
                                    <span className="ms-2 text-muted">({construction.id})</span> {/* Display ID for clarity */}
                                </Accordion.Header>
                                <Accordion.Body className="p-3">
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Dirección:</Col>
                                        <Col md={8}>{construction.address}</Col>
                                    </Row>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Fecha de Inicio:</Col>
                                        <Col md={8}>{construction.startDate ? new Date(construction.startDate).toLocaleDateString() : 'N/A'}</Col>
                                    </Row>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Fecha de Finalización:</Col>
                                        <Col md={8}>{construction.endDate ? new Date(construction.endDate).toLocaleDateString() : 'N/A'}</Col>
                                    </Row>
                                    <hr/>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Subir Imágenes:</Col>
                                        <Col md={8}>
                                            <Button variant="btn btn-outline-custom" className="w-100">Subir</Button>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Cambiar Estado:</Col>
                                        <Col md={8}>
                                            <Button variant="btn btn-outline-custom" className="w-100">Cambiar</Button>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Eventos y Día:</Col>
                                        <Col md={8}>
                                            <Button variant="btn btn-outline-custom" className="w-100">Poner</Button>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Documentación Legal:</Col>
                                        <Col md={8}>
                                            <Button variant="btn btn-outline-custom" className="w-100">Subir</Button>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Facturas:</Col>
                                        <Col md={8}>
                                            <Button variant="btn btn-outline-custom" className="w-100">Subir</Button>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Presupuestos:</Col>
                                        <Col md={8}>
                                            <Button variant="btn btn-outline-custom" className="w-100">Subir</Button>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Manual Usuario:</Col>
                                        <Col md={8}>
                                            <Button variant="btn btn-outline-custom" className="w-100">Subir</Button>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Historial Incidencias:</Col>
                                        <Col md={8}>
                                            <Button variant="btn btn-outline-custom" className="w-100">Ver</Button>
                                        </Col>
                                    </Row>
                                    <Row className="align-items-center">
                                        <Col md={4} className="text-muted">Estado Incidencia:</Col>
                                        <Col md={8}>
                                            <Button variant="btn btn-outline-custom" className="w-100">Cambiar</Button>
                                        </Col>
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Card>
                    ))}
                </Accordion>
            ) : (
                <Alert variant="info">No hay construcciones asociadas a este trabajador.</Alert>
            )}
        </div>
    );
};

export default WorkerView;
