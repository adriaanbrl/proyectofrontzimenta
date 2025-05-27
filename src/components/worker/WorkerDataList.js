import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Card, Button, Accordion, Row, Col, Spinner, Alert, Modal, Form
} from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const EventDetailModal = ({ show, onHide, eventData, onSave, onDelete }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (eventData) {
            setTitle(eventData.title || '');
            setDescription(eventData.description || '');
            setDate(eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : '');
        } else {
            setTitle('');
            setDescription('');
            setDate('');
        }
        setError(null);
        setIsLoading(false);
    }, [eventData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const updatedEvent = {
            ...eventData,
            title,
            description,
            date
        };

        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.put(`http://localhost:8080/auth/building/updateEvents/${eventData.id}`, updatedEvent, { headers });
            onSave(updatedEvent);
        } catch (err) {
            console.error("Error al guardar el evento:", err);
            setError(err.response?.data?.message || "Error al guardar el evento.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.delete(`http://localhost:8080/auth/building/deleteEvents/${eventData.id}`, { headers });
            onDelete(eventData.id, eventData.buildingId);
        } catch (err) {
            console.error("Error al eliminar el evento:", err);
            setError(err.response?.data?.message || "Error al eliminar el evento.");
        } finally {
            setIsLoading(false);
            setShowConfirmModal(false);
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton className="bg-primary text-white py-3">
                    <Modal.Title className="fw-bold fs-5">{eventData?.id ? 'Editar Evento' : 'Detalle del Evento'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {error && <Alert variant="danger" className="mb-3 text-center">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Título</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Introduce el título del evento"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe el evento"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            <Button variant="success" type="submit" disabled={isLoading} className="w-48 me-2 d-flex align-items-center justify-content-center">
                                {isLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" /> Guardando...
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </Button>
                            <Button variant="danger" onClick={() => setShowConfirmModal(true)} disabled={isLoading} className="w-48 ms-2 d-flex align-items-center justify-content-center">
                                {isLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" /> Eliminando...
                                    </>
                                ) : (
                                    'Eliminar Evento'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" /> Eliminando...
                            </>
                        ) : (
                            'Eliminar'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

const WorkerDataList = () => {
    const [workerId, setWorkerId] = useState(null);
    const [workerConstructions, setWorkerConstructions] = useState([]);
    const [loadingConstructions, setLoadingConstructions] = useState(true);
    const [errorConstructions, setErrorConstructions] = useState(null);

    // Estados para Eventos
    const [eventsByBuilding, setEventsByBuilding] = useState({});
    const [loadingEvents, setLoadingEvents] = useState({});
    const [errorEvents, setErrorEvents] = useState({});

    // Estados para Facturas
    const [invoicesByBuilding, setInvoicesByBuilding] = useState({});
    const [loadingInvoices, setLoadingInvoices] = useState({});
    const [errorInvoices, setErrorInvoices] = useState({});

    // Estados para el visor de PDF
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState(null);

    const [activeAccordionKey, setActiveAccordionKey] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [activeInnerAccordionKey, setActiveInnerAccordionKey] = useState({}); // Para gestionar acordeones internos

    // Función para obtener las construcciones asociadas al trabajador
    const fetchWorkerConstructions = useCallback(async (id, token) => {
        setLoadingConstructions(true);
        setErrorConstructions(null);
        try {
            const response = await axios.get(`http://localhost:8080/auth/worker/${id}/buildings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkerConstructions(response.data);
        } catch (err) {
            setErrorConstructions(err.response?.data?.message || "Error al cargar construcciones.");
        } finally {
            setLoadingConstructions(false);
        }
    }, []);

    // Función para obtener los eventos de una construcción específica
    const fetchEventsForBuilding = useCallback(async (buildingId) => {
        if (!buildingId) {
            console.warn("fetchEventsForBuilding llamado sin buildingId. Abortando.");
            setLoadingEvents(prev => ({ ...prev, [buildingId]: false }));
            return;
        }
        setLoadingEvents(prev => ({ ...prev, [buildingId]: true }));
        setErrorEvents(prev => ({ ...prev, [buildingId]: null }));
        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`http://localhost:8080/auth/building/${buildingId}/events`, { headers });
            setEventsByBuilding(prev => ({ ...prev, [buildingId]: response.data }));
        } catch (err) {
            setErrorEvents(prev => ({ ...prev, [buildingId]: err.response?.data?.message || "No hay eventos para esta construcción" }));
        } finally {
            setLoadingEvents(prev => ({ ...prev, [buildingId]: false }));
        }
    }, []);

    // Función para obtener las facturas de una construcción específica
    const fetchInvoicesForBuilding = useCallback(async (buildingId) => {
        if (!buildingId) {
            console.warn("fetchInvoicesForBuilding llamado sin buildingId. Abortando.");
            setLoadingInvoices(prev => ({ ...prev, [buildingId]: false }));
            return;
        }
        setLoadingInvoices(prev => ({ ...prev, [buildingId]: true }));
        setErrorInvoices(prev => ({ ...prev, [buildingId]: null }));
        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`http://localhost:8080/api/building/${buildingId}/invoices`, { headers });
            setInvoicesByBuilding(prev => ({ ...prev, [buildingId]: response.data }));
        } catch (err) {
            setErrorInvoices(prev => ({ ...prev, [buildingId]: err.response?.data?.message || "No hay facturas para esta construcción" }));
        } finally {
            setLoadingInvoices(prev => ({ ...prev, [buildingId]: false }));
        }
    }, []);

    // Función para obtener y mostrar el PDF de una factura
    const handleViewPdf = useCallback(async (invoiceId) => {
        setLoadingPdf(true);
        setPdfError(null);
        setCurrentPdfUrl(null); // Limpiar URL anterior
        setShowPdfModal(true); // Abrir modal inmediatamente para mostrar spinner

        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`http://localhost:8080/api/invoices/pdf/${invoiceId}`, {
                headers,
                responseType: 'blob' // Importante para manejar archivos binarios
            });

            // Crear una URL de objeto para el Blob recibido
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setCurrentPdfUrl(url);
        } catch (err) {
            console.error("Error al cargar el PDF:", err);
            setPdfError("No se pudo cargar el PDF. Inténtalo de nuevo más tarde.");
        } finally {
            setLoadingPdf(false);
        }
    }, []);

    // Efecto para obtener el ID del trabajador del token y cargar las construcciones al montar el componente
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentWorkerId = decodedToken.id;
                setWorkerId(currentWorkerId);
                fetchWorkerConstructions(currentWorkerId, token);
            } catch (error) {
                setErrorConstructions("Error de autenticación.");
                setLoadingConstructions(false);
            }
        } else {
            setErrorConstructions("No se encontró el token.");
            setLoadingConstructions(false);
        }
    }, [fetchWorkerConstructions]);

    // Manejador para el acordeón principal (construcciones)
    const handleAccordionSelect = (eventKey) => {
        setActiveAccordionKey(eventKey);
        // Resetea los acordeones internos cuando se abre una nueva construcción
        setActiveInnerAccordionKey({});
    };

    // Manejador para los acordeones internos (Eventos/Facturas)
    const handleInnerAccordionSelect = useCallback((buildingId, innerEventKey) => {
        setActiveInnerAccordionKey(prev => ({
            ...prev,
            [buildingId]: prev[buildingId] === innerEventKey ? null : innerEventKey // Abre/cierra el acordeón interno
        }));

        if (innerEventKey === "events-section") {
            // Carga eventos si aún no están cargados o hubo un error previo
            if (!eventsByBuilding[buildingId] || eventsByBuilding[buildingId].length === 0 || errorEvents[buildingId]) {
                fetchEventsForBuilding(buildingId);
            }
        } else if (innerEventKey === "invoices-section") {
            // Carga facturas si aún no están cargadas o hubo un error previo
            if (!invoicesByBuilding[buildingId] || invoicesByBuilding[buildingId].length === 0 || errorInvoices[buildingId]) {
                fetchInvoicesForBuilding(buildingId);
            }
        }
    }, [eventsByBuilding, errorEvents, invoicesByBuilding, errorInvoices, fetchEventsForBuilding, fetchInvoicesForBuilding]);


    const handleEditEvent = (event, buildingId) => {
        setCurrentEvent({ ...event, buildingId });
        setShowEventModal(true);
    };

    const handleCloseEventModal = () => {
        setShowEventModal(false);
        setCurrentEvent(null);
    };

    const handleEventSaved = (updatedEvent) => {
        fetchEventsForBuilding(updatedEvent.buildingId);
        handleCloseEventModal();
    };

    const handleEventDeleted = (deletedEventId, buildingId) => {
        if (buildingId) {
            fetchEventsForBuilding(buildingId);
        } else {
            let buildingIdOfDeletedEvent = null;
            for (const bId in eventsByBuilding) {
                if (eventsByBuilding[bId].some(event => event.id === deletedEventId)) {
                    buildingIdOfDeletedEvent = bId;
                    break;
                }
            }
            if (buildingIdOfDeletedEvent) {
                fetchEventsForBuilding(buildingIdOfDeletedEvent);
            }
        }
        handleCloseEventModal();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString();
    };

    // Función para cerrar el modal del PDF y revocar la URL del objeto
    const handleClosePdfModal = () => {
        setShowPdfModal(false);
        if (currentPdfUrl) {
            URL.revokeObjectURL(currentPdfUrl); // Liberar la memoria
            setCurrentPdfUrl(null);
        }
        setPdfError(null);
    };

    return (
        <Container className="my-4 p-4 rounded shadow-lg bg-light">
            <h4 className="mb-4 text-center text-custom">GESTIÓN DE EVENTOS Y FACTURAS POR CONSTRUCCIÓN:</h4>

            {loadingConstructions ? (
                <div className="text-center my-5">
                    <Spinner animation="border" />
                    <p className="mt-2">Cargando construcciones...</p>
                </div>
            ) : errorConstructions ? (
                <Alert variant="danger">{errorConstructions}</Alert>
            ) : workerConstructions.length > 0 ? (
                <Accordion activeKey={activeAccordionKey} onSelect={handleAccordionSelect}>
                    {workerConstructions.map((construction, index) => (
                        <Card key={construction.id} className="mb-3 shadow-sm">
                            <Accordion.Item eventKey={index.toString()}>
                                <Accordion.Header>
                                    <strong>{construction.title || construction.address}</strong>
                                    <span className="ms-2 text-muted">({construction.id})</span>
                                </Accordion.Header>
                                <Accordion.Body>
                                    {/* Acordeón interno para Eventos y Facturas */}
                                    <Accordion
                                        activeKey={activeInnerAccordionKey[construction.id]}
                                        onSelect={(key) => handleInnerAccordionSelect(construction.id, key)}
                                    >
                                        {/* Sección de Eventos */}
                                        <Accordion.Item eventKey="events-section">
                                            <Accordion.Header>Eventos</Accordion.Header>
                                            <Accordion.Body>
                                                {loadingEvents[construction.id] ? (
                                                    <div className="text-center my-3">
                                                        <Spinner animation="border" size="sm" /> Cargando eventos...
                                                    </div>
                                                ) : errorEvents[construction.id] ? (
                                                    <Alert variant="danger">{errorEvents[construction.id]}</Alert>
                                                ) : (
                                                    <>
                                                        {eventsByBuilding[construction.id] && eventsByBuilding[construction.id].length > 0 ? (
                                                            eventsByBuilding[construction.id].map(event => (
                                                                <Card key={event.id} className="mb-2 p-2 shadow-sm">
                                                                    <Card.Body className="d-flex justify-content-between align-items-center py-2">
                                                                        <div>
                                                                            <h6 className="mb-1">{event.title}</h6>
                                                                            <p className="mb-0 text-muted small">{event.description}</p>
                                                                            <p className="mb-0 text-muted small">Fecha: {formatDate(event.date)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <Button
                                                                                variant="outline-custom"
                                                                                size="sm"
                                                                                className="me-2"
                                                                                onClick={() => handleEditEvent(event, construction.id)}
                                                                            >
                                                                                Editar
                                                                            </Button>
                                                                        </div>
                                                                    </Card.Body>
                                                                </Card>
                                                            ))
                                                        ) : (
                                                            <Alert variant="info">No hay eventos registrados para esta construcción.</Alert>
                                                        )}
                                                    </>
                                                )}
                                            </Accordion.Body>
                                        </Accordion.Item>

                                        {/* Sección de Facturas */}
                                        <Accordion.Item eventKey="invoices-section">
                                            <Accordion.Header>Facturas</Accordion.Header>
                                            <Accordion.Body>
                                                {loadingInvoices[construction.id] ? (
                                                    <div className="text-center my-3">
                                                        <Spinner animation="border" size="sm" /> Cargando facturas...
                                                    </div>
                                                ) : errorInvoices[construction.id] ? (
                                                    <Alert variant="danger">{errorInvoices[construction.id]}</Alert>
                                                ) : (
                                                    <>
                                                        {invoicesByBuilding[construction.id] && invoicesByBuilding[construction.id].length > 0 ? (
                                                            invoicesByBuilding[construction.id].map(invoice => (
                                                                <Card key={invoice.id} className="mb-2 p-2 shadow-sm">
                                                                    <Card.Body className="d-flex justify-content-between align-items-center py-2">
                                                                        <div>
                                                                            <h6 className="mb-1">
                                                                                Factura {invoice.title && ` - ${invoice.title}`} 
                                                                            </h6>
                                                                            <p className="mb-0 text-muted small">Monto: ${invoice.amount ? invoice.amount.toFixed(2) : '0.00'}</p>
                                                                            <p className="mb-0 text-muted small">Fecha: {formatDate(invoice.date)}</p>
                                                                            {invoice.description && <p className="mb-0 text-muted small">Descripción: {invoice.description}</p>}
                                                                            {invoice.status && <p className="mb-0 text-muted small">Estado: {invoice.status}</p>}
                                                                        </div>
                                                                        <div>
                                                                            <Button
                                                                                variant="outline-info"
                                                                                size="sm"
                                                                                onClick={() => handleViewPdf(invoice.id)}
                                                                                disabled={loadingPdf}
                                                                            >
                                                                                {loadingPdf ? <Spinner animation="border" size="sm" /> : 'Ver PDF'}
                                                                            </Button>
                                                                        </div>
                                                                    </Card.Body>
                                                                </Card>
                                                            ))
                                                        ) : (
                                                            <Alert variant="info">No hay facturas registradas para esta construcción.</Alert>
                                                        )}
                                                    </>
                                                )}
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    </Accordion>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Card>
                    ))}
                </Accordion>
            ) : (
                <Alert variant="info">No hay construcciones asociadas a este trabajador.</Alert>
            )}

            {currentEvent && (
                <EventDetailModal
                    show={showEventModal}
                    onHide={handleCloseEventModal}
                    eventData={currentEvent}
                    onSave={handleEventSaved}
                    onDelete={handleEventDeleted}
                />
            )}

            {/* Modal para mostrar el PDF */}
            <Modal show={showPdfModal} onHide={handleClosePdfModal} size="lg" centered>
                <Modal.Header closeButton className="bg-secondary text-white py-3">
                    <Modal.Title className="fw-bold fs-5">Visualizar PDF de Factura</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0" style={{ height: '80vh' }}>
                    {loadingPdf ? (
                        <div className="text-center my-5">
                            <Spinner animation="border" />
                            <p className="mt-2">Cargando PDF...</p>
                        </div>
                    ) : pdfError ? (
                        <Alert variant="danger" className="m-3 text-center">{pdfError}</Alert>
                    ) : currentPdfUrl ? (
                        <iframe src={currentPdfUrl} title="Invoice PDF" width="100%" height="100%" style={{ border: 'none' }}>
                            Tu navegador no soporta iframes, o el PDF no se pudo cargar. Puedes intentar descargar el archivo.
                        </iframe>
                    ) : (
                        <div className="text-center my-5">
                            <p>Selecciona una factura para ver su PDF.</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClosePdfModal}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default WorkerDataList;
