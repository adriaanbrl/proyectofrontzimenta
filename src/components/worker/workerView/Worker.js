import React, { useState, useEffect, useCallback } from 'react';
import {
    Card, Button, Accordion, Row, Col, Spinner, Alert, Modal, Container
} from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

import UploadImageModal from './UploadImageModal';
import BuildingIncidentsSection from './BuildingIncidentsSection';
import EventDayModal from './EventDayModal';
import LegalDocumentModal from './LegalDocumentModal';
import InvoiceUploadModal from './InvoiceUploadModal';
import BudgetUploadForm from './BudgetUploadForm';
import ManualUploadModal from './ManualUploadModal'; 
import { Link } from 'react-router-dom';

const WorkerView = () => {
    const [workerImage, setWorkerImage] = useState(null);
    const [workerName, setWorkerName] = useState("Cargando...");
    const [workerRole, setWorkerRole] = useState("Cargando...");
    const [workerId, setWorkerId] = useState(null);
    const [workerConstructions, setWorkerConstructions] = useState([]);
    const [loadingConstructions, setLoadingConstructions] = useState(true);
    const [errorConstructions, setErrorConstructions] = useState(null);

    const [showUploadImageModal, setShowUploadImageModal] = useState(false);
    const [selectedBuildingForUpload, setSelectedBuildingForUpload] = useState(null);

    const [showEventDayModal, setShowEventDayModal] = useState(false);
    const [selectedBuildingForEventDay, setSelectedBuildingForEventDay] = useState(null);

    const [showLegalDocumentModal, setShowLegalDocumentModal] = useState(false);
    const [selectedBuildingForLegalDocument, setSelectedBuildingForLegalDocument] = useState(null);

    const [showInvoiceUploadModal, setShowInvoiceUploadModal] = useState(false);
    const [selectedBuildingForInvoiceUpload, setSelectedBuildingForInvoiceUpload] = useState(null);

    const [showBudgetUploadModal, setShowBudgetUploadModal] = useState(false);
    const [selectedBuildingForBudgetUpload, setSelectedBuildingForBudgetUpload] = useState(null);

    const [showIncidentsHistoryModal, setShowIncidentsHistoryModal] = useState(false);
    const [selectedBuildingForIncidents, setSelectedBuildingForIncidents] = useState(null);

    const [showManualUploadModal, setShowManualUploadModal] = useState(false);
    const [selectedBuildingForManualUpload, setSelectedBuildingForManualUpload] = useState(null);


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
                setWorkerName("Error de Carga");
                setWorkerRole("Error de Carga");
                setErrorConstructions("Error de autenticación.");
                setLoadingConstructions(false);
            }
        } else {
            setWorkerName("No Disponible");
            setWorkerRole("No Disponible");
            setErrorConstructions("No se encontró el token.");
            setLoadingConstructions(false);
        }
    }, [fetchWorkerConstructions]);

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setWorkerImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUploadImageClick = (building) => {
        setSelectedBuildingForUpload(building);
        setShowUploadImageModal(true);
    };

    const handleCloseUploadImageModal = () => {
        setShowUploadImageModal(false);
        setSelectedBuildingForUpload(null);
    };

    const handleEventDayClick = (building) => {
        setSelectedBuildingForEventDay(building);
        setShowEventDayModal(true);
    };

    const handleCloseEventDayModal = () => {
        setShowEventDayModal(false);
        setSelectedBuildingForEventDay(null);
    };

    const handleLegalDocumentClick = (building) => {
        setSelectedBuildingForLegalDocument(building);
        setShowLegalDocumentModal(true);
    };

    const handleCloseLegalDocumentModal = () => {
        setShowLegalDocumentModal(false);
        setSelectedBuildingForLegalDocument(null);
    };

    const handleInvoiceUploadClick = (building) => {
        setSelectedBuildingForInvoiceUpload(building);
        setShowInvoiceUploadModal(true);
    };

    const handleCloseInvoiceUploadModal = () => {
        setShowInvoiceUploadModal(false);
        setSelectedBuildingForInvoiceUpload(null);
    };

    const handleBudgetUploadClick = (building) => {
        setSelectedBuildingForBudgetUpload(building);
        setShowBudgetUploadModal(true);
    };

    const handleCloseBudgetUploadModal = () => {
        setShowBudgetUploadModal(false);
        setSelectedBuildingForBudgetUpload(null);
    };

    const handleViewIncidentsClick = (building) => {
        setSelectedBuildingForIncidents(building);
        setShowIncidentsHistoryModal(true);
    };

    const handleCloseIncidentsHistoryModal = () => {
        setShowIncidentsHistoryModal(false);
        setSelectedBuildingForIncidents(null);
    };

    const handleManualUploadClick = (building) => {
        setSelectedBuildingForManualUpload(building);
        setShowManualUploadModal(true);
    };

    const handleCloseManualUploadModal = () => {
        setShowManualUploadModal(false);
        setSelectedBuildingForManualUpload(null);
    };

    return (
        <Container className="container mt-4">
            <div className="bg-light p-4 rounded shadow-sm mb-4 d-flex align-items-center justify-content-between">
                <div className="text-start">
                    <h2 className="mb-0 text fw-bold">{workerName}</h2>
                    <p className="mb-0 text fw-bold">ROL: {workerRole}</p>
                </div>

            </div>

            <h4 className="mb-3 text-custom fw-bold">CONSTRUCCIONES ASOCIADAS:</h4>

            {loadingConstructions ? (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                    <p className="mt-2">Cargando construcciones...</p>
                </div>
            ) : errorConstructions ? (
                <Alert variant="danger">{errorConstructions}</Alert>
            ) : workerConstructions.length > 0 ? (
                <Accordion>
                    {workerConstructions.map((construction, index) => (
                        <Card key={construction.id} className="mb-3 shadow-sm">
                            <Accordion.Item eventKey={index.toString()}>
                                <Accordion.Header>
                                    <strong>{construction.title || construction.address}</strong>
                                    <span className="ms-2 text-muted">({construction.id})</span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    <Row className="mb-2"><Col md={4}>Título:</Col><Col>{construction.title || 'N/A'}</Col></Row>
                                    <Row className="mb-2"><Col md={4}>Dirección:</Col><Col>{construction.address}</Col></Row>
                                    <Row className="mb-2"><Col md={4}>Inicio:</Col><Col>{construction.startDate ? new Date(construction.startDate).toLocaleDateString() : 'N/A'}</Col></Row>
                                    <Row className="mb-2"><Col md={4}>Final:</Col><Col>{construction.endDate ? new Date(construction.endDate).toLocaleDateString() : 'N/A'}</Col></Row>
                                    <hr />
                                    <Row className="mb-2"><Col md={4}>Imágenes:</Col><Col><Button onClick={() => handleUploadImageClick(construction)} className="w-50">Subir</Button></Col></Row>
                                    <Row className="mb-2"><Col md={4}>Eventos:</Col><Col><Button onClick={() => handleEventDayClick(construction)} className="w-50">Añadir</Button></Col></Row>
                                    <Row className="mb-2"><Col md={4}>Documentos legales:</Col><Col><Button onClick={() => handleLegalDocumentClick(construction)} className="w-50">Subir</Button></Col></Row>
                                    <Row className="mb-2"><Col md={4}>Facturas:</Col><Col><Button onClick={() => handleInvoiceUploadClick(construction)} className="w-50">Subir</Button></Col></Row>
                                    <Row className="mb-2"><Col md={4}>Presupuesto:</Col><Col><Button onClick={() => handleBudgetUploadClick(construction)} className="w-50">Subir Excel</Button></Col></Row>
                                    {/* New button for Manual Upload */}
                                    <Row className="mb-2"><Col md={4}>Manuales de Usuario:</Col><Col><Button onClick={() => handleManualUploadClick(construction)} className="w-50">Subir</Button></Col></Row>
                                    <Row className="mb-2"><Col md={4}>Incidencias:</Col><Col><Button onClick={() => handleViewIncidentsClick(construction)} className="w-50">Ver</Button></Col></Row>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Card>
                    ))}
                </Accordion>
            ) : (
                <Alert variant="info">No hay construcciones asociadas.</Alert>
            )}

            {selectedBuildingForUpload && (
                <UploadImageModal
                    show={showUploadImageModal}
                    onHide={handleCloseUploadImageModal}
                    buildingId={selectedBuildingForUpload.id}
                    buildingDetails={selectedBuildingForUpload}
                    onUploadSuccess={handleCloseUploadImageModal}
                />
            )}

            {selectedBuildingForEventDay && (
                <EventDayModal
                    show={showEventDayModal}
                    onHide={handleCloseEventDayModal}
                    buildingId={selectedBuildingForEventDay.id}
                    buildingTitle={selectedBuildingForEventDay.title || selectedBuildingForEventDay.address}
                />
            )}

            {selectedBuildingForLegalDocument && (
                <LegalDocumentModal
                    show={showLegalDocumentModal}
                    onHide={handleCloseLegalDocumentModal}
                    buildingId={selectedBuildingForLegalDocument.id}
                    buildingTitle={selectedBuildingForLegalDocument.title || selectedBuildingForLegalDocument.address}
                />
            )}

            {selectedBuildingForInvoiceUpload && (
                <InvoiceUploadModal
                    show={showInvoiceUploadModal}
                    onHide={handleCloseInvoiceUploadModal}
                    buildingId={selectedBuildingForInvoiceUpload.id}
                    buildingTitle={selectedBuildingForInvoiceUpload.title || selectedBuildingForInvoiceUpload.address}
                />
            )}

            {selectedBuildingForBudgetUpload && (
                <Modal show={showBudgetUploadModal} onHide={handleCloseBudgetUploadModal} size="md" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Subir Presupuesto Excel para {selectedBuildingForBudgetUpload ? (selectedBuildingForBudgetUpload.title || selectedBuildingForBudgetUpload.address) : 'Edificio Seleccionado'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <BudgetUploadForm
                            buildingId={selectedBuildingForBudgetUpload.id}
                            buildingTitle={selectedBuildingForBudgetUpload.title || selectedBuildingForBudgetUpload.address}
                            onUploadSuccess={handleCloseBudgetUploadModal}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseBudgetUploadModal}>Cerrar</Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* New ManualUploadModal component */}
            {selectedBuildingForManualUpload && (
                <ManualUploadModal
                    show={showManualUploadModal}
                    onHide={handleCloseManualUploadModal}
                    buildingId={selectedBuildingForManualUpload.id}
                    buildingTitle={selectedBuildingForManualUpload.title || selectedBuildingForManualUpload.address}
                    onUploadSuccess={handleCloseManualUploadModal} // Or a function to refresh data
                />
            )}

            {selectedBuildingForIncidents && (
                <Modal show={showIncidentsHistoryModal} onHide={handleCloseIncidentsHistoryModal} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Historial de Incidentes - {selectedBuildingForIncidents.title || selectedBuildingForIncidents.address}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <BuildingIncidentsSection buildingData={selectedBuildingForIncidents} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleCloseIncidentsHistoryModal}>Cerrar</Button>
                    </Modal.Footer>
                </Modal>
            )}
            <div className="mt-4">
                <Link to="/login" className={`btn  btn-outline-custom`}>
                    Volver a Inicio de Sesión
                </Link>
            </div>
        </Container>
    );
};

export default WorkerView;