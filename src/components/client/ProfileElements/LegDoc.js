import React, { useEffect, useState } from 'react';
import './LegDoc.css';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';

function LegDoc() {
    const location = useLocation();
    const [buildingId, setBuildingId] = useState("");
    const [pdfUrls, setPdfUrls] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Documentación Legal";
        if (location.state && location.state.building_id) {
            setBuildingId(location.state.building_id);
        } else {
            setError("No se proporcionó el ID del edificio.");
        }
    }, [location.state]);

    useEffect(() => {
        if (buildingId) {
            fetchLegalDocuments(buildingId);
        }
    }, [buildingId]);

    const fetchLegalDocuments = async (id) => {
        setLoading(true);
        setError(null);
        setPdfUrls([]);

        const token = localStorage.getItem('authToken');

        if (!token) {
            setError("No se encontró el token de autenticación.");
            setLoading(false);
            return;
        }

        const responseIds = await fetch(`http://localhost:8080/auth/building/${id}/legalDocumentsIds`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (responseIds.ok) {
            const idList = await responseIds.json();

            if (Array.isArray(idList) && idList.length > 0) {
                const responsePdfs = await fetch(`http://localhost:8080/legaldocuments/pdfs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(idList),
                });

                if (responsePdfs.ok) {
                    const pdfDataList = await responsePdfs.json();
                    const urls = [];
                    pdfDataList.forEach(pdfData => {
                        const byteArray = new Uint8Array(pdfData.data);
                        const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
                        const url = URL.createObjectURL(fileBlob);
                        urls.push(url);
                    });
                    setPdfUrls(urls);
                    setLoading(false);
                } else {
                    setError(`Error al descargar los documentos: ${responsePdfs.status}`);
                    setLoading(false);
                }
            } else if (Array.isArray(idList) && idList.length === 0) {
                setError("No hay documentos legales disponibles para este edificio.");
                setLoading(false);
            } else {
                setError("Respuesta inesperada del servidor: Se esperaba una lista de IDs.");
                setLoading(false);
            }
        } else {
            setError(`Error al obtener la lista de documentos: ${responseIds.status}`);
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
                    <h1 className="leg-doc-title">Documentación Legal</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {pdfUrls.length > 0 && (
                        <div className="pdfs-grid">
                            {pdfUrls.map((url, index) => (
                                <div key={index} className="pdf-card">
                                    <Button variant="primary" onClick={() => window.open(url, '_blank')}>
                                        Abrir Documento {index + 1}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    {loading && !error && <p><Spinner animation="border" size="sm" /> Cargando documentos...</p>}
                    {!pdfUrls.length && !error && !loading && buildingId && (
                        <p>No hay documentos disponibles para este edificio.</p>
                    )}
                    {!buildingId && !error && <p>Esperando el ID del edificio...</p>}
                </Col>
            </Row>
        </Container>
    );
}

export default LegDoc;