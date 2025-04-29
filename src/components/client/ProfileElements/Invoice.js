import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';

function InvoicesDoc() {
    const location = useLocation();
    const [buildingId, setBuildingId] = useState('');
    const [pdfUrls, setPdfUrls] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = 'Facturas';
        if (location.state && location.state.building_id) {
            setBuildingId(location.state.building_id);
        } else {
            setError('No se proporcionó el ID del edificio.');
        }
    }, [location.state]);

    useEffect(() => {
        if (buildingId) {
            fetchInvoices(buildingId);
        }
    }, [buildingId]);

    const fetchInvoices = async (id) => {
        setLoading(true);
        setError(null);
        setPdfUrls([]);

        const token = localStorage.getItem('authToken');

        if (!token) {
            setError('No se encontró el token de autenticación.');
            setLoading(false);
            return;
        }

        try {
            const responseIds = await fetch(`http://localhost:8080/auth/building/${id}/invoicesIds`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!responseIds.ok) {
                throw new Error(`Error al obtener la lista de facturas: ${responseIds.status}`);
            }

            const idList = await responseIds.json();

            if (Array.isArray(idList) && idList.length > 0) {
                const responsePdfs = await fetch(`http://localhost:8080/invoices/pdfs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(idList),
                });

                if (!responsePdfs.ok) {
                    throw new Error(`Error al descargar las facturas: ${responsePdfs.status}`);
                }

                const pdfDataList = await responsePdfs.json();
                const urls = pdfDataList.map(pdfData => { // Changed from forEach to map
                    // Decodificar la cadena Base64 a un string binario
                    const byteString = atob(pdfData.data);

                    // Crear un array de bytes (Uint8Array) a partir del string binario
                    const byteArray = new Uint8Array(byteString.length);
                    for (let i = 0; i < byteString.length; i++) {
                        byteArray[i] = byteString.charCodeAt(i);
                    }

                    const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
                    return URL.createObjectURL(fileBlob); // Return the URL
                });
                setPdfUrls(urls);
                setLoading(false);
            } else if (Array.isArray(idList) && idList.length === 0) {
                setError('No hay facturas disponibles para este edificio.');
                setLoading(false);
            } else {
                setError('Respuesta inesperada del servidor: Se esperaba una lista de IDs.');
                setLoading(false);
            }
        } catch (err) { // Changed err to be more explicit
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            pdfUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [pdfUrls]);

    return (
        <Container className="leg-doc-container">
            <Row>
                <Col>
                    <h1 className="leg-doc-title">Facturas</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {pdfUrls.length > 0 && (
                        <div className="pdfs-grid">
                            {pdfUrls.map((url, index) => (
                                <div key={index} className="pdf-card">
                                    <Button variant="primary" onClick={() => window.open(url, '_blank')}>
                                        Abrir Factura {index + 1}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    {loading && !error && (
                        <p>
                            <Spinner animation="border" size="sm" /> Cargando facturas...
                        </p>
                    )}
                    {!pdfUrls.length && !error && !loading && buildingId && (
                        <p>No hay facturas disponibles para este edificio.</p>
                    )}
                    {!buildingId && !error && <p>Esperando el ID del edificio...</p>}
                </Col>
            </Row>
        </Container>
    );
}

export default InvoicesDoc;
