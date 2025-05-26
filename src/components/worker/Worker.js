import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Accordion, Row, Col, Form, Image, Spinner, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PencilSquare } from 'react-bootstrap-icons';
import { jwtDecode } from 'jwt-decode';
import UploadImageModal from './UploadImageModal'; // Import the new modal component

// ProfileImage component remains unchanged
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

// EventDayModal component (remains unchanged from previous version)
const EventDayModal = ({ show, onHide, buildingId, buildingTitle }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (show) {
            setTitle('');
            setDescription('');
            setDate('');
            setError(null);
            setSuccess(false);
        }
    }, [show, buildingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const eventData = {
            title,
            description,
            date,
            buildingId: parseInt(buildingId, 10)
        };

        console.log("Submitting Event/Day data:", eventData);

        try {
            const token = localStorage.getItem("authToken");

            const response = await fetch('http://localhost:8080/api/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al guardar el evento/día: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("Evento/Día guardado exitosamente:", result);
            setSuccess(true);
        } catch (err) {
            console.error("Error saving event/day:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Añadir Evento o Día para "{buildingTitle}"</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Evento/Día guardado exitosamente!</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="eventTitle">
                        <Form.Label>Título</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduce el título del evento"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="eventDescription">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Introduce la descripción del evento"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="eventDate">
                        <Form.Label>Fecha</Form.Label>
                        <Form.Control
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="buildingIdDisplay">
                        <Form.Label>ID de Construcción</Form.Label>
                        <Form.Control
                            type="text"
                            value={buildingId}
                            readOnly
                            disabled
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Guardar Evento/Día'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};


// LegalDocumentModal component
const LegalDocumentModal = ({ show, onHide, buildingId, buildingTitle }) => {
    const [documentTitle, setDocumentTitle] = useState('');
    const [documentFile, setDocumentFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (show) {
            setDocumentTitle('');
            setDocumentFile(null);
            setError(null);
            setSuccess(false);
        }
    }, [show, buildingId]);

    const handleFileChange = (e) => {
        setDocumentFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (!documentFile) {
            setError("Por favor, selecciona un archivo.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', documentTitle);
        formData.append('file', documentFile);
        formData.append('buildingId', parseInt(buildingId, 10)); // Ensure buildingId is an integer

        console.log("Submitting Legal Document data:", {
            documentTitle,
            documentFileName: documentFile.name,
            buildingId
        });

        try {
            const token = localStorage.getItem("authToken"); // Get the authentication token

            const response = await fetch('http://localhost:8080/api/legal-documents/upload', {
                method: 'POST',
                headers: {
                    // 'Content-Type': 'multipart/form-data' is NOT needed when using FormData,
                    // the browser sets it automatically with the correct boundary.
                    'Authorization': token ? `Bearer ${token}` : '' // Include token if available
                },
                body: formData
            });

            if (!response.ok) {
                // Attempt to parse error message if available, otherwise use status text
                const errorText = await response.text(); // Get raw text to avoid JSON parsing errors
                let errorMessage = `Error al subir el documento legal: ${response.statusText}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    // If not JSON, use the raw text
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log("Documento legal subido exitosamente:", result);
            setSuccess(true);
            // Optionally, call a callback to update parent state or refresh data
            // onDocumentUploadSuccess();
        } catch (err) {
            console.error("Error uploading legal document:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Subir Documento Legal para "{buildingTitle}"</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Documento legal subido exitosamente!</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="documentTitle">
                        <Form.Label>Título del Documento</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduce el título del documento"
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="documentFile">
                        <Form.Label>Seleccionar Archivo</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={handleFileChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="buildingIdDisplayLegal">
                        <Form.Label>ID de Construcción</Form.Label>
                        <Form.Control
                            type="text"
                            value={buildingId}
                            readOnly
                            disabled
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Subir Documento Legal'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

// NEW InvoiceUploadModal component
const InvoiceUploadModal = ({ show, onHide, buildingId, buildingTitle }) => {
    const [invoiceTitle, setInvoiceTitle] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [invoiceAmount, setInvoiceAmount] = useState('');
    const [invoiceFile, setInvoiceFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (show) {
            setInvoiceTitle('');
            setInvoiceDate('');
            setInvoiceAmount('');
            setInvoiceFile(null);
            setError(null);
            setSuccess(false);
        }
    }, [show, buildingId]);

    const handleFileChange = (e) => {
        setInvoiceFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (!invoiceFile) {
            setError("Por favor, selecciona un archivo de factura.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', invoiceTitle);
        formData.append('date', invoiceDate); // Assuming date format "YYYY-MM-DD"
        formData.append('amount', parseFloat(invoiceAmount)); // Ensure amount is a number
        formData.append('file', invoiceFile);
        formData.append('buildingId', parseInt(buildingId, 10));

        console.log("Submitting Invoice data:", {
            invoiceTitle,
            invoiceDate,
            invoiceAmount,
            invoiceFileName: invoiceFile.name,
            buildingId
        });

        try {
            const token = localStorage.getItem("authToken");

            // Replace with your actual API endpoint for invoices
            const response = await fetch('http://localhost:8080/api/invoices/upload', { 
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Error al subir la factura: ${response.statusText}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log("Factura subida exitosamente:", result);
            setSuccess(true);
            // onInvoiceUploadSuccess();
        } catch (err) {
            console.error("Error uploading invoice:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Subir Factura para "{buildingTitle}"</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Factura subida exitosamente!</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="invoiceTitle">
                        <Form.Label>Título de la Factura</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduce el título de la factura"
                            value={invoiceTitle}
                            onChange={(e) => setInvoiceTitle(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="invoiceDate">
                        <Form.Label>Fecha de la Factura</Form.Label>
                        <Form.Control
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="invoiceAmount">
                        <Form.Label>Monto</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            placeholder="Introduce el monto de la factura"
                            value={invoiceAmount}
                            onChange={(e) => setInvoiceAmount(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="invoiceFile">
                        <Form.Label>Seleccionar Archivo PDF</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="buildingIdDisplayInvoice">
                        <Form.Label>ID de Construcción</Form.Label>
                        <Form.Control
                            type="text"
                            value={buildingId}
                            readOnly
                            disabled
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Subir Factura'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};


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

    // State for the new EventDayModal
    const [showEventDayModal, setShowEventDayModal] = useState(false);
    const [selectedBuildingForEventDay, setSelectedBuildingForEventDay] = useState(null);

    // State for LegalDocumentModal
    const [showLegalDocumentModal, setShowLegalDocumentModal] = useState(false);
    const [selectedBuildingForLegalDocument, setSelectedBuildingForLegalDocument] = useState(null);

    // NEW State for InvoiceUploadModal
    const [showInvoiceUploadModal, setShowInvoiceUploadModal] = useState(false);
    const [selectedBuildingForInvoiceUpload, setSelectedBuildingForInvoiceUpload] = useState(null);


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
    const handleUploadImageClick = (building) => {
        setSelectedBuildingForUpload(building);
        setShowUploadImageModal(true);
    };

    // Function to close the UploadImageModal
    const handleCloseUploadImageModal = () => {
        setShowUploadImageModal(false);
        setSelectedBuildingForUpload(null);
    };
    const handleImageUploadSuccess = () => {
        handleCloseUploadImageModal();
    };

    // Function to open the EventDayModal
    const handleEventDayClick = (building) => {
        setSelectedBuildingForEventDay(building);
        setShowEventDayModal(true);
    };

    // Function to close the EventDayModal
    const handleCloseEventDayModal = () => {
        setShowEventDayModal(false);
        setSelectedBuildingForEventDay(null);
    };

    // Function to open the LegalDocumentModal
    const handleLegalDocumentClick = (building) => {
        setSelectedBuildingForLegalDocument(building);
        setShowLegalDocumentModal(true);
    };

    // Function to close the LegalDocumentModal
    const handleCloseLegalDocumentModal = () => {
        setShowLegalDocumentModal(false);
        setSelectedBuildingForLegalDocument(null);
    };

    // NEW Function to open the InvoiceUploadModal
    const handleInvoiceUploadClick = (building) => {
        setSelectedBuildingForInvoiceUpload(building);
        setShowInvoiceUploadModal(true);
    };

    // NEW Function to close the InvoiceUploadModal
    const handleCloseInvoiceUploadModal = () => {
        setShowInvoiceUploadModal(false);
        setSelectedBuildingForInvoiceUpload(null);
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
                                                onClick={() => handleUploadImageClick(construction)}
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
                                            <Button
                                                variant="btn btn-outline-custom"
                                                className="w-100"
                                                onClick={() => handleEventDayClick(construction)}
                                            >
                                                Poner
                                            </Button>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Documentación Legal:</Col>
                                        <Col md={8}>
                                            <Button
                                                variant="btn btn-outline-custom"
                                                className="w-100"
                                                onClick={() => handleLegalDocumentClick(construction)}
                                            >
                                                Subir
                                            </Button>
                                        </Col>
                                    </Row>
                                    <Row className="mb-2 align-items-center">
                                        <Col md={4} className="text-muted">Facturas:</Col>
                                        <Col md={8}>
                                            <Button
                                                variant="btn btn-outline-custom"
                                                className="w-100"
                                                onClick={() => handleInvoiceUploadClick(construction)} // NEW: Open InvoiceUploadModal
                                            >
                                                Subir
                                            </Button>
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
            {selectedBuildingForUpload && (
                <UploadImageModal
                    show={showUploadImageModal}
                    onHide={handleCloseUploadImageModal}
                    buildingId={selectedBuildingForUpload.id}
                    buildingDetails={selectedBuildingForUpload}
                    onUploadSuccess={handleImageUploadSuccess}
                />
            )}

            {/* Render the EventDayModal */}
            {selectedBuildingForEventDay && (
                <EventDayModal
                    show={showEventDayModal}
                    onHide={handleCloseEventDayModal}
                    buildingId={selectedBuildingForEventDay.id}
                    buildingTitle={selectedBuildingForEventDay.title || selectedBuildingForEventDay.address}
                />
            )}

            {/* Render the LegalDocumentModal */}
            {selectedBuildingForLegalDocument && (
                <LegalDocumentModal
                    show={showLegalDocumentModal}
                    onHide={handleCloseLegalDocumentModal}
                    buildingId={selectedBuildingForLegalDocument.id}
                    buildingTitle={selectedBuildingForLegalDocument.title || selectedBuildingForLegalDocument.address}
                />
            )}

            {/* NEW: Render the InvoiceUploadModal */}
            {selectedBuildingForInvoiceUpload && (
                <InvoiceUploadModal
                    show={showInvoiceUploadModal}
                    onHide={handleCloseInvoiceUploadModal}
                    buildingId={selectedBuildingForInvoiceUpload.id}
                    buildingTitle={selectedBuildingForInvoiceUpload.title || selectedBuildingForInvoiceUpload.address}
                />
            )}
        </div>
    );
};

export default WorkerView;
