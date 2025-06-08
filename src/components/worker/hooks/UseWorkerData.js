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

    const [manualsByBuilding, setManualsByBuilding] = useState({});
    const [loadingManuals, setLoadingManuals] = useState({});
    const [errorManuals, setErrorManuals] = useState({});

    const [currentPdfUrl, setCurrentPdfUrl] = useState(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [pdfError, setPdfError] = useState(null);

    const [loadingInvoiceAction, setLoadingInvoiceAction] = useState(false);
    const [invoiceActionError, setInvoiceActionError] = useState(null);

    const [loadingLegalDocAction, setLoadingLegalDocAction] = useState(false);
    const [legalDocActionError, setLegalDocActionError] = useState(null);

    const [loadingManualAction, setLoadingManualAction] = useState(false);
    const [manualActionError, setManualActionError] = useState(null);

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
            setWorkerConstructions([]);
        } finally {
            setLoadingConstructions(false);
        }
    }, []);

    const fetchEventsForBuilding = useCallback(async (buildingId) => {
        if (!buildingId) {
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
            setEventsByBuilding(prev => ({ ...prev, [buildingId]: [] }));
        } finally {
            setLoadingEvents(prev => ({ ...prev, [buildingId]: false }));
        }
    }, []);

    const fetchInvoicesForBuilding = useCallback(async (buildingId) => {
        if (!buildingId) {
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
            setInvoicesByBuilding(prev => ({ ...prev, [buildingId]: [] }));
        } finally {
            setLoadingInvoices(prev => ({ ...prev, [buildingId]: false }));
        }
    }, []);

    const fetchLegalDocumentsForBuilding = useCallback(async (buildingId) => {
        if (!buildingId) {
            setLoadingLegalDocuments(prev => ({ ...prev, [buildingId]: false }));
            return;
        }
        setLoadingLegalDocuments(prev => ({ ...prev, [buildingId]: true }));
        setErrorLegalDocuments(prev => ({ ...prev, [buildingId]: null }));
        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const response = await axios.get(`http://localhost:8080/api/building/${buildingId}/legal_documentation`, { headers });
            setLegalDocumentsByBuilding(prev => ({ ...prev, [buildingId]: response.data }));
        } catch (err) {
            setErrorLegalDocuments(prev => ({ ...prev, [buildingId]: err.response?.data?.message || "No hay documentos legales para esta construcción" }));
            setLegalDocumentsByBuilding(prev => ({ ...prev, [buildingId]: [] }));
        } finally {
            setLoadingLegalDocuments(prev => ({ ...prev, [buildingId]: false }));
        }
    }, []);

    const fetchManualsForBuilding = useCallback(async (buildingId) => {
        if (!buildingId) {
            setLoadingManuals(prev => ({ ...prev, [buildingId]: false }));
            return;
        }
        setLoadingManuals(prev => ({ ...prev, [buildingId]: true }));
        setErrorManuals(prev => ({ ...prev, [buildingId]: null }));
        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const idsResponse = await axios.get(`http://localhost:8080/auth/building/${buildingId}/manualsIds`, { headers });
            const manualIds = idsResponse.data;

            if (!Array.isArray(manualIds) || manualIds.length === 0) {
                setManualsByBuilding(prev => ({ ...prev, [buildingId]: [] }));
                return;
            }

            const pdfsResponse = await axios.post(`http://localhost:8080/manuals/pdfs`, manualIds, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const pdfDataListFromServer = pdfsResponse.data;

            const processedManuals = pdfDataListFromServer.map((manual) => {
                console.log('Manual object from backend:', manual);

                if (!manual.data) {
                    console.warn(`Manual con ID ${manual.id} no tiene datos PDF. Saltando.`);
                    return null;
                }
                try {
                    const byteString = atob(manual.data);
                    const byteArray = new Uint8Array(byteString.length);
                    for (let i = 0; i < byteString.length; i++) {
                        byteArray[i] = byteString.charCodeAt(i);
                    }
                    const fileBlob = new Blob([byteArray], { type: "application/pdf" });
                    const url = URL.createObjectURL(fileBlob);

                    return {
                        id: manual.id,
                        url: url,
                        backendTitle: manual.title,
                        backendFilename: manual.filename,
                        displayTitle: manual.title || manual.filename || `Manual ${manual.id}`
                    };
                } catch (e) {
                    console.error(`Error al procesar PDF para el manual ID ${manual.id}:`, e);
                    return null;
                }
            }).filter(Boolean);

            setManualsByBuilding(prev => ({ ...prev, [buildingId]: processedManuals }));

        } catch (err) {
            console.error(`Error al obtener manuales para el edificio ${buildingId}:`, err);
            setErrorManuals(prev => ({ ...prev, [buildingId]: err.response?.data?.message || "No hay manuales de usuario para esta construcción" }));
            setManualsByBuilding(prev => ({ ...prev, [buildingId]: [] }));
        } finally {
            setLoadingManuals(prev => ({ ...prev, [buildingId]: false }));
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
            let pdfToDisplay = null;

            if (documentType === 'invoice') {
                urlEndpoint = `http://localhost:8080/api/invoices/pdf/${id}`;
            } else if (documentType === 'legal_documentation') {
                urlEndpoint = `http://localhost:8080/api/legal_documentation/pdf/${id}`;
            } else if (documentType === 'user_manual') {
                for (const buildingId in manualsByBuilding) {
                    const foundManual = manualsByBuilding[buildingId].find(manual => manual.id === id);
                    if (foundManual && foundManual.url) {
                        pdfToDisplay = foundManual.url;
                        break;
                    }
                }
                if (!pdfToDisplay) {
                    throw new Error('Manual PDF no encontrado o no pre-cargado.');
                }
            } else {
                throw new Error('Tipo de documento no soportado para previsualización PDF.');
            }

            if (pdfToDisplay) {
                setCurrentPdfUrl(pdfToDisplay);
            } else {
                const response = await axios.get(urlEndpoint, {
                    headers,
                    responseType: 'blob'
                });
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setCurrentPdfUrl(url);
            }

        } catch (err) {
            console.error("Error al cargar el PDF:", err);
            setPdfError(err.message || err.response?.data?.message || "No se pudo cargar el PDF. Inténtalo de nuevo más tarde.");
        } finally {
            setLoadingPdf(false);
        }
    }, [manualsByBuilding]);

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
        const buildingId = updatedEvent.buildingId;
        if (buildingId) {
            await fetchEventsForBuilding(buildingId);
        } else {
            workerConstructions.forEach(construction => fetchEventsForBuilding(construction.id));
        }
    }, [fetchEventsForBuilding, workerConstructions]);

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

    const handleManualUpdate = useCallback(async (buildingId) => {
        if (buildingId) {
            await fetchManualsForBuilding(buildingId);
        } else {
            workerConstructions.forEach(construction => fetchManualsForBuilding(construction.id));
        }
    }, [fetchManualsForBuilding, workerConstructions]);

    const handleManualDelete = useCallback(async (deletedManualId, buildingId) => {
        if (buildingId) {
            await fetchManualsForBuilding(buildingId);
        } else {
            let buildingIdOfDeletedManual = null;
            for (const key in manualsByBuilding) {
                if (manualsByBuilding[key].some(manual => manual.id === deletedManualId)) {
                    buildingIdOfDeletedManual = key;
                    break;
                }
            }
            if (buildingIdOfDeletedManual) {
                await fetchManualsForBuilding(buildingIdOfDeletedManual);
            }
        }
    }, [manualsByBuilding, fetchManualsForBuilding, workerConstructions]);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentWorkerId = decodedToken.id;
                setWorkerId(currentWorkerId);
                fetchWorkerConstructions(currentWorkerId, token);
            } catch (error) {
                setErrorConstructions("Error de autenticación: Token inválido.");
                setLoadingConstructions(false);
            }
        } else {
            setErrorConstructions("No se encontró el token de autenticación.");
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
        manualsByBuilding,
        loadingManuals,
        errorManuals,
        currentPdfUrl,
        loadingPdf,
        pdfError,
        loadingInvoiceAction,
        invoiceActionError,
        loadingLegalDocAction,
        legalDocActionError,
        loadingManualAction,
        manualActionError,
        fetchEventsForBuilding,
        fetchInvoicesForBuilding,
        fetchLegalDocumentsForBuilding,
        fetchManualsForBuilding,
        handleViewPdf,
        handleInvoiceUpdate,
        handleInvoiceDelete,
        handleEventUpdate,
        handleEventDelete,
        handleLegalDocumentUpdate,
        handleLegalDocumentDelete,
        handleManualUpdate,
        handleManualDelete,
        handleClosePdfModal,
        setLoadingPdf,
        setPdfError,
        setLoadingInvoiceAction,
        setInvoiceActionError,
        setLoadingLegalDocAction,
        setLegalDocActionError,
        setLoadingManualAction,
        setManualActionError
    };
};

export default useWorkerData;
