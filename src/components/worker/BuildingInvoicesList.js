import React, { useState, useEffect, useCallback } from 'react';
import {
    Container, Card, Button, Accordion, Spinner, Alert, Modal
} from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const BuildingInvoicesList = () => {
    const [workerId, setWorkerId] = useState(null);
    const [workerConstructions, setWorkerConstructions] = useState([]);
    const [loadingConstructions, setLoadingConstructions] = useState(true);
    const [errorConstructions, setErrorConstructions] = useState(null);
    const [invoicesByBuilding, setInvoicesByBuilding] = useState({});
    const [loadingInvoices, setLoadingInvoices] = useState({});
    const [errorInvoices, setErrorInvoices] = useState({});
    const [activeAccordionKey, setActiveAccordionKey] = useState(null);

    // NUEVOS ESTADOS para el visor de PDF
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState(null);

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

    // NUEVA Función para obtener y mostrar el PDF de una factura
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
        if (eventKey) {
            const buildingId = workerConstructions[parseInt(eventKey)].id;
            if (!invoicesByBuilding[buildingId] || invoicesByBuilding[buildingId].length === 0 || errorInvoices[buildingId]) {
                fetchInvoicesForBuilding(buildingId);
            }
        }
    };

    // Función auxiliar para formatear fechas
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
            <h4 className="mb-4 text-center text-primary">GESTIÓN DE FACTURAS POR CONSTRUCCIÓN:</h4>

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
                                    <Accordion>
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
                                                                            <h6 className="mb-1">Factura</h6>
                                                                            <p className="mb-0 text-muted small">Monto: ${invoice.amount ? invoice.amount.toFixed(2) : '0.00'}</p>
                                                                            <p className="mb-0 text-muted small">Fecha: {formatDate(invoice.date)}</p>
                                                                            {invoice.description && <p className="mb-0 text-muted small">Descripción: {invoice.description}</p>}
                                                                            {/* Puedes añadir más campos de la factura aquí si tu modelo Invoices los tiene */}
                                                                            {invoice.status && <p className="mb-0 text-muted small">Estado: {invoice.status}</p>}
                                                                            {/* Ejemplo: si tu factura tiene un campo 'notes' */}
                                                                            {/* {invoice.notes && <p className="mb-0 text-muted small">Notas: {invoice.notes}</p>} */}
                                                                        </div>
                                                                        <div>
                                                                            <Button
                                                                                variant="outline-info"
                                                                                size="sm"
                                                                                onClick={() => handleViewPdf(invoice.id)}
                                                                                disabled={loadingPdf} // Deshabilitar si ya se está cargando un PDF
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

            {/* Modal para mostrar el PDF */}
            <Modal show={showPdfModal} onHide={handleClosePdfModal} size="lg" centered>
                <Modal.Header closeButton className="bg-secondary text-white py-3">
                    <Modal.Title className="fw-bold fs-5">Visualizar PDF de Factura</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0" style={{ height: '80vh' }}> {/* Ajusta la altura del modal */}
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

export default BuildingInvoicesList;
