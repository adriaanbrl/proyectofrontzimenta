import React, { useState } from 'react';
import {Container, Card, Button, Accordion, Spinner, Alert, Modal, Form} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import useWorkerData from './hooks/UseWorkerData';
import EventDetailModal from './EventDetailModal';
import InvoiceEditModal from './InvoiceEditModal';
import InvoiceDeleteConfirmModal from './InvoiceDeleteConfirmModal';
import PdfViewerModal from './PdfViewerModal';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString();
};

const WorkerDataList = () => {
    const {
        workerConstructions,
        loadingConstructions,
        errorConstructions,
        eventsByBuilding,
        loadingEvents,
        errorEvents,
        invoicesByBuilding,
        loadingInvoices,
        errorInvoices,
        currentPdfUrl,
        loadingPdf,
        pdfError,
        loadingInvoiceAction,
        invoiceActionError,
        fetchEventsForBuilding,
        fetchInvoicesForBuilding,
        handleViewPdf,
        handleInvoiceUpdate,
        handleInvoiceDelete,
        handleEventUpdate,
        handleEventDelete,
        handleClosePdfModal,
        setLoadingPdf,
        setPdfError,
        setLoadingInvoiceAction,
        setInvoiceActionError
    } = useWorkerData();

    const [activeAccordionKey, setActiveAccordionKey] = useState(null);
    const [activeInnerAccordionKey, setActiveInnerAccordionKey] = useState({});
    const [showEventModal, setShowEventModal] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
    const [currentInvoiceToEdit, setCurrentInvoiceToEdit] = useState(null);
    const [showDeleteInvoiceModal, setShowDeleteInvoiceModal] = useState(false);
    const [invoiceToDeleteId, setInvoiceToDeleteId] = useState(null);
    const [showPdfModal, setShowPdfModal] = useState(false);

    const handleAccordionSelect = (eventKey) => {
        setActiveAccordionKey(eventKey);
        setActiveInnerAccordionKey({});
    };

    const handleInnerAccordionSelect = (buildingId, innerEventKey) => {
        setActiveInnerAccordionKey(prev => ({
            ...prev,
            [buildingId]: prev[buildingId] === innerEventKey ? null : innerEventKey
        }));

        if (innerEventKey === "events-section") {
            if (!eventsByBuilding[buildingId] || eventsByBuilding[buildingId].length === 0 || errorEvents[buildingId]) {
                fetchEventsForBuilding(buildingId);
            }
        } else if (innerEventKey === "invoices-section") {
            if (!invoicesByBuilding[buildingId] || invoicesByBuilding[buildingId].length === 0 || errorInvoices[buildingId]) {
                fetchInvoicesForBuilding(buildingId);
            }
        }
    };

    const handleEditEvent = (event, buildingId) => {
        setCurrentEvent({ ...event, buildingId });
        setShowEventModal(true);
    };

    const handleCloseEventModal = () => {
        setShowEventModal(false);
        setCurrentEvent(null);
    };

    const handleEventSaved = (updatedEvent) => {
        handleEventUpdate(updatedEvent);
        handleCloseEventModal();
    };

    const handleEventDeleted = (deletedEventId, buildingId) => {
        handleEventDelete(deletedEventId, buildingId);
        handleCloseEventModal();
    };

    const handleInvoiceEdit = (invoice) => {
        setCurrentInvoiceToEdit(invoice);
        setShowEditInvoiceModal(true);
        setInvoiceActionError(null);
    };

    const handleInvoiceEditSaved = (buildingId) => {
        handleInvoiceUpdate(buildingId);
        setShowEditInvoiceModal(false);
    };

    const handleInvoiceDeleteRequest = (invoiceId) => {
        setInvoiceToDeleteId(invoiceId);
        setShowDeleteInvoiceModal(true);
        setInvoiceActionError(null);
    };

    const handleInvoiceDeleteConfirmed = (deletedInvoiceId) => {
        handleInvoiceDelete(deletedInvoiceId);
        setShowDeleteInvoiceModal(false);
    };

    const handlePdfViewerOpen = async (invoiceId) => {
        await handleViewPdf(invoiceId); 
        setShowPdfModal(true);
    };

    const handlePdfViewerClose = () => {
        handleClosePdfModal(); 
        setShowPdfModal(false);
    };

    return (
        <Container className="my-4 p-4 rounded shadow-lg bg-light">
            <h4 className="mb-4 text-center text-primary">GESTIÓN DE EVENTOS Y FACTURAS POR CONSTRUCCIÓN:</h4>

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
                                                                                variant="outline-primary"
                                                                                size="sm"
                                                                                className="me-2"
                                                                                onClick={() => handleEditEvent(event, construction.id)}
                                                                            >
                                                                                ✏️ Editar
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
                                                                        </div>
                                                                        <div className="d-flex flex-column flex-md-row">
                                                                            <Button
                                                                                variant="outline-info"
                                                                                size="sm"
                                                                                className="mb-2 mb-md-0 me-md-2"
                                                                                onClick={() => handlePdfViewerOpen(invoice.id)}
                                                                                disabled={loadingPdf}
                                                                            >
                                                                                {loadingPdf ? <Spinner animation="border" size="sm" /> : '📄 Ver PDF'}
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline-primary"
                                                                                size="sm"
                                                                                className="mb-2 mb-md-0 me-md-2"
                                                                                onClick={() => handleInvoiceEdit(invoice)}
                                                                                disabled={loadingInvoiceAction}
                                                                            >
                                                                                {loadingInvoiceAction ? <Spinner animation="border" size="sm" /> : '✏️ Editar'}
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline-danger"
                                                                                size="sm"
                                                                                onClick={() => handleInvoiceDeleteRequest(invoice.id)}
                                                                                disabled={loadingInvoiceAction}
                                                                            >
                                                                                {loadingInvoiceAction ? <Spinner animation="border" size="sm" /> : '🗑️ Borrar'}
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

            <PdfViewerModal
                show={showPdfModal}
                onHide={handlePdfViewerClose}
                pdfUrl={currentPdfUrl}
                isLoading={loadingPdf}
                error={pdfError}
            />

            {currentInvoiceToEdit && (
                <InvoiceEditModal
                    show={showEditInvoiceModal}
                    onHide={() => setShowEditInvoiceModal(false)}
                    invoiceData={currentInvoiceToEdit}
                    onSave={handleInvoiceEditSaved}
                    isLoading={loadingInvoiceAction}
                    error={invoiceActionError}
                    setLoading={setLoadingInvoiceAction}
                    setError={setInvoiceActionError}
                />
            )}

            <InvoiceDeleteConfirmModal
                show={showDeleteInvoiceModal}
                onHide={() => setShowDeleteInvoiceModal(false)}
                invoiceId={invoiceToDeleteId}
                onDeleteConfirm={handleInvoiceDeleteConfirmed}
                isLoading={loadingInvoiceAction}
                error={invoiceActionError}
                setLoading={setLoadingInvoiceAction}
                setError={setInvoiceActionError}
            />
        </Container>
    );
};

export default WorkerDataList;