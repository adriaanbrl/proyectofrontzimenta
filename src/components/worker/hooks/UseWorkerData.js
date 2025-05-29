import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const useWorkerData = () => {
    const [workerId, setWorkerId] = useState(null);
    const [workerConstructions, setWorkerConstructions] = useState([]);
    const [loadingConstructions, setLoadingConstructions] = useState(true);
    const [errorConstructions, setErrorConstructions] = useState(null);

    const [eventsByBuilding, setEventsByBuilding] = useState({});
    const [loadingEvents, setLoadingEvents] = useState({});
    const [errorEvents, setErrorEvents] = useState({});

    const [invoicesByBuilding, setInvoicesByBuilding] = useState({});
    const [loadingInvoices, setLoadingInvoices] = useState({});
    const [errorInvoices, setErrorInvoices] = useState({});

    const [legalDocumentsByBuilding, setLegalDocumentsByBuilding] = useState({});
    const [loadingLegalDocuments, setLoadingLegalDocuments] = useState({});
    const [errorLegalDocuments, setErrorLegalDocuments] = useState({});


    const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState(null);

    const [loadingInvoiceAction, setLoadingInvoiceAction] = useState(false);
    const [invoiceActionError, setInvoiceActionError] = useState(null);

    const [loadingLegalDocAction, setLoadingLegalDocAction] = useState(false);
    const [legalDocActionError, setLegalDocActionError] = useState(null);

    const fetchWorkerConstructions = useCallback(async (id, token) => {
        setLoadingConstructions(true);
        setErrorConstructions(null);
        try {
            const response = await axios.get(`http://localhost:8080/auth/worker/${id}/buildings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkerConstructions(response.data);
        } catch (err) {
            console.error("Error fetching worker constructions:", err);
            setErrorConstructions(err.response?.data?.message || "Error al cargar construcciones.");
        } finally {
            setLoadingConstructions(false);
        }
    }, []);

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
            console.error(`Error fetching events for building ${buildingId}:`, err);
            setErrorEvents(prev => ({ ...prev, [buildingId]: err.response?.data?.message || "No hay eventos para esta construcción" }));
        } finally {
            setLoadingEvents(prev => ({ ...prev, [buildingId]: false }));
        }
    }, []);

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
            console.error(`Error fetching invoices for building ${buildingId}:`, err);
            setErrorInvoices(prev => ({ ...prev, [buildingId]: err.response?.data?.message || "No hay facturas para esta construcción" }));
        } finally {
            setLoadingInvoices(prev => ({ ...prev, [buildingId]: false }));
        }
    }, []);

    const fetchLegalDocumentsForBuilding = useCallback(async (buildingId) => {
        if (!buildingId) {
            console.warn("fetchLegalDocumentsForBuilding llamado sin buildingId. Abortando.");
            setLoadingLegalDocuments(prev => ({ ...prev, [buildingId]: false }));
            return;
        }
        setLoadingLegalDocuments(prev => ({ ...prev, [buildingId]: true }));
        setErrorLegalDocuments(prev => ({ ...prev, [buildingId]: null }));
        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            // Ajusta la URL de la API según tu backend
            const response = await axios.get(`http://localhost:8080/api/building/${buildingId}/legal_documentation`, { headers });
            setLegalDocumentsByBuilding(prev => ({ ...prev, [buildingId]: response.data }));
        } catch (err) {
            console.error(`Error fetching legal documents for building ${buildingId}:`, err);
            setErrorLegalDocuments(prev => ({ ...prev, [buildingId]: err.response?.data?.message || "No hay documentos legales para esta construcción" }));
        } finally {
            setLoadingLegalDocuments(prev => ({ ...prev, [buildingId]: false }));
        }
    }, []);


    const handleViewPdf = useCallback(async (documentType, id) => {
        setLoadingPdf(true);
        setPdfError(null);
        setCurrentPdfUrl(null);

        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            let urlEndpoint = '';
            if (documentType === 'invoice') {
                urlEndpoint = `http://localhost:8080/api/invoices/pdf/${id}`;
            } else if (documentType === 'legal_documentation') {
                // Ajusta la URL de la API para documentos legales
                urlEndpoint = `http://localhost:8080/api/legal_documentation/pdf/${id}`;
            } else {
                throw new Error('Tipo de documento no soportado para previsualización PDF.');
            }

            const response = await axios.get(urlEndpoint, {
                headers,
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setCurrentPdfUrl(url);
        } catch (err) {
            console.error("Error al cargar el PDF:", err);
            setPdfError(err.response?.data?.message || "No se pudo cargar el PDF. Inténtalo de nuevo más tarde.");
        } finally {
            setLoadingPdf(false);
        }
    }, []);

    const handleInvoiceUpdate = useCallback(async (buildingId) => {
        if (buildingId) {
            await fetchInvoicesForBuilding(buildingId);
        } else {
            workerConstructions.forEach(construction => fetchInvoicesForBuilding(construction.id));
        }
    }, [fetchInvoicesForBuilding, workerConstructions]);

    const handleInvoiceDelete = useCallback(async (deletedInvoiceId) => {
        let buildingId = null;
        for (const key in invoicesByBuilding) {
            if (invoicesByBuilding[key].some(inv => inv.id === deletedInvoiceId)) {
                buildingId = key;
                break;
            }
        }
        if (buildingId) {
            await fetchInvoicesForBuilding(buildingId);
        } else {
            workerConstructions.forEach(construction => fetchInvoicesForBuilding(construction.id));
        }
    }, [invoicesByBuilding, fetchInvoicesForBuilding, workerConstructions]);

    const handleEventUpdate = useCallback(async (updatedEvent) => {
        const buildingId = updatedEvent.buildingId || (eventsByBuilding[updatedEvent.buildingId] ? updatedEvent.buildingId : null);
        if (buildingId) {
            await fetchEventsForBuilding(buildingId);
        } else {
            workerConstructions.forEach(construction => fetchEventsForBuilding(construction.id));
        }
    }, [fetchEventsForBuilding, workerConstructions, eventsByBuilding]);

    const handleEventDelete = useCallback(async (deletedEventId, buildingId) => {
        if (buildingId) {
            await fetchEventsForBuilding(buildingId);
        } else {
            let buildingIdOfDeletedEvent = null;
            for (const bId in eventsByBuilding) {
                if (eventsByBuilding[bId].some(event => event.id === deletedEventId)) {
                    buildingIdOfDeletedEvent = bId;
                    break;
                }
            }
            if (buildingIdOfDeletedEvent) {
                await fetchEventsForBuilding(buildingIdOfDeletedEvent);
            }
        }
    }, [fetchEventsForBuilding, eventsByBuilding]);

    const handleLegalDocumentUpdate = useCallback(async (buildingId) => {
        if (buildingId) {
            await fetchLegalDocumentsForBuilding(buildingId);
        } else {
            workerConstructions.forEach(construction => fetchLegalDocumentsForBuilding(construction.id));
        }
    }, [fetchLegalDocumentsForBuilding, workerConstructions]);

    const handleLegalDocumentDelete = useCallback(async (deletedDocumentId, buildingId) => {
        if (buildingId) {
            await fetchLegalDocumentsForBuilding(buildingId);
        } else {
            let buildingIdOfDeletedDoc = null;
            for (const key in legalDocumentsByBuilding) {
                if (legalDocumentsByBuilding[key].some(doc => doc.id === deletedDocumentId)) {
                    buildingIdOfDeletedDoc = key;
                    break;
                }
            }
            if (buildingIdOfDeletedDoc) {
                await fetchLegalDocumentsForBuilding(buildingIdOfDeletedDoc);
            }
        }
    }, [legalDocumentsByBuilding, fetchLegalDocumentsForBuilding, workerConstructions]);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentWorkerId = decodedToken.id;
                setWorkerId(currentWorkerId);
                fetchWorkerConstructions(currentWorkerId, token);
            } catch (error) {
                console.error("Error decoding token:", error);
                setErrorConstructions("Error de autenticación.");
                setLoadingConstructions(false);
            }
        } else {
            setErrorConstructions("No se encontró el token.");
            setLoadingConstructions(false);
        }
    }, [fetchWorkerConstructions]);

    const handleClosePdfModal = useCallback(() => {
        if (currentPdfUrl) {
            URL.revokeObjectURL(currentPdfUrl);
            setCurrentPdfUrl(null);
        }
        setPdfError(null);
    }, [currentPdfUrl]);

    return {
        workerId,
        workerConstructions,
        loadingConstructions,
        errorConstructions,
        eventsByBuilding,
        loadingEvents,
        errorEvents,
        invoicesByBuilding,
        loadingInvoices,
        errorInvoices,
        legalDocumentsByBuilding,
        loadingLegalDocuments,
        errorLegalDocuments,
        currentPdfUrl,
        loadingPdf,
        pdfError,
        loadingInvoiceAction,
        invoiceActionError,
        loadingLegalDocAction,
        legalDocActionError,
        fetchEventsForBuilding,
        fetchInvoicesForBuilding,
        fetchLegalDocumentsForBuilding,
        handleViewPdf,
        handleInvoiceUpdate,
        handleInvoiceDelete,
        handleEventUpdate,
        handleEventDelete,
        handleLegalDocumentUpdate,
        handleLegalDocumentDelete,
        handleClosePdfModal,
        setLoadingPdf,
        setPdfError,
        setLoadingInvoiceAction,
        setInvoiceActionError,
        setLoadingLegalDocAction,
        setLegalDocActionError
    };
};

export default useWorkerData;