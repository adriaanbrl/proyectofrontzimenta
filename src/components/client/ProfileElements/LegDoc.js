import React, { useEffect, useState } from 'react';
import './LegDoc.css'; // Manteniendo tu CSS personalizado
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';

function LegDoc() {
    const location = useLocation();
    const [buildingId, setBuildingId] = useState("");
    const [pdfUrl, setPdfUrl] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "Documentación Legal";
        // Intenta obtener el buildingId del estado de la ubicación al montar el componente
        if (location.state && location.state.building_id) {
            setBuildingId(location.state.building_id);
        } else {
            setError("No se proporcionó el ID del edificio.");
        }
    }, [location.state]); // Dependencia en location.state para reaccionar a cambios de navegación

    useEffect(() => {
        if (buildingId) {
            fetchDocumentacionLegal(buildingId);
        }
    }, [buildingId]);

    const fetchDocumentacionLegal = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError("No se encontró el token de autenticación.");
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:8080/auth/building/${id}/documentacionLegal`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } else {
                setError(`Error al cargar el documento: ${response.status}`);
            }
        } catch (error) {
            setError(`Error de red: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="leg-doc-container">
            <Row>
                <Col>
                    <h1 className="leg-doc-title">Documentación Legal</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {pdfUrl && (
                        <div className="pdf-card">
                            <Button variant="primary" onClick={() => window.open(pdfUrl, '_blank')}>
                                Abrir Documento Legal
                            </Button>
                        </div>
                    )}
                    {loading && !error && <p><Spinner animation="border" size="sm" /> Cargando documento...</p>}
                    {!pdfUrl && !error && !loading && buildingId && <p>Documento no disponible.</p>}
                </Col>
            </Row>
        </Container>
    );
}

export default LegDoc;