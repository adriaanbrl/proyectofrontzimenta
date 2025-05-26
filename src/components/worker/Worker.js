import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Accordion, Row, Col, Form, Image, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PencilSquare } from 'react-bootstrap-icons';
import { jwtDecode } from 'jwt-decode';
import UploadImageModal from './UploadImageModal'; // Import the new modal component

const ProfileImage = ({ imageUrl, onImageChange }) => (
    <div className="position-relative d-inline-block ms-3">
        <Image
            src={imageUrl || 'https://placehold.co/80x80/cccccc/333333?text=Perfil'}
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
    const [workerId, setWorkerId] = useState(null);
    const [workerConstructions, setWorkerConstructions] = useState([]);
    const [loadingConstructions, setLoadingConstructions] = useState(true);
    const [errorConstructions, setErrorConstructions] = useState(null);

    // State for the new UploadImageModal
    const [showUploadImageModal, setShowUploadImageModal] = useState(false);
    const [selectedBuildingForUpload, setSelectedBuildingForUpload] = useState(null);

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
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("authToken");

        if (token) {
            try {
                const decodedToken = jwtDecode(token);

                setWorkerName(`${decodedToken.name || "Trabajador"} ${decodedToken.surname || ""}`);
                setWorkerRole(decodedToken.roleNames ? decodedToken.roleNames.join(', ') : "Desconocido");

                const currentWorkerId = decodedToken.id;
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
            }
        } else {
            console.warn("No se encontró ningún token de autenticación en localStorage.");
            setWorkerName("No Disponible");
            setWorkerRole("No Disponible");
            setErrorConstructions("No se encontró el token de autenticación.");
            setLoadingConstructions(false);
        }
    }, [fetchWorkerConstructions]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setWorkerImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Function to open the UploadImageModal
    const handleUploadImageClick = (building) => {
        setSelectedBuildingForUpload(building); // Store the entire building object
        setShowUploadImageModal(true);
    };

    // Function to close the UploadImageModal
    const handleCloseUploadImageModal = () => {
        setShowUploadImageModal(false);
        setSelectedBuildingForUpload(null); // Clear selected building on close
    };

    // Callback for when an image is successfully uploaded (optional, can refresh data)
    const handleImageUploadSuccess = () => {
        // You might want to re-fetch constructions here if image count is displayed
        // or if there's any visual indication of new images.
        // For now, just close the modal.
        handleCloseUploadImageModal();
        // Optionally, re-fetch worker constructions to update the view
        // if (workerId) {
        //     const token = localStorage.getItem("authToken");
        //     fetchWorkerConstructions(workerId, token);
        // }
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
                                    <strong>{construction.title || construction.address}</strong>
                                    <span className="ms-2 text-muted">({construction.id})</span>
                                </Accordion.Header>
                                <Accordion.Body className="p-3">
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Título:</Col>
                                        <Col md={8}>{construction.title || 'N/A'}</Col>
                                    </Row>
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
                                            <Button
                                                variant="btn btn-outline-custom"
                                                className="w-100"
                                                onClick={() => handleUploadImageClick(construction)} // Pass the whole construction object
                                            >
                                                Subir
                                            </Button>
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

            {/* Render the UploadImageModal */}
            {selectedBuildingForUpload && ( // Ensure selectedBuildingForUpload is not null before rendering
                <UploadImageModal
                    show={showUploadImageModal}
                    onHide={handleCloseUploadImageModal}
                    buildingId={selectedBuildingForUpload.id}
                    buildingDetails={selectedBuildingForUpload} // Pass the entire building object
                    onUploadSuccess={handleImageUploadSuccess}
                />
            )}
        </div>
    );
};

export default WorkerView;