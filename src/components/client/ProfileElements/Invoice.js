import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Alert, Spinner } from 'react-bootstrap';
import { ChevronLeft, File } from 'lucide-react';

function InvoicesDoc() {
    const location = useLocation();
    const navigate = useNavigate();
    const [buildingId, setBuildingId] = useState('');
    const [pdfDataListWithInfo, setPdfDataListWithInfo] = useState([]);
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
        setPdfDataListWithInfo([]);

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
                const pdfsWithInfo = pdfDataList.map(pdfData => {
                    const byteString = atob(pdfData.data);
                    const byteArray = new Uint8Array(byteString.length);
                    for (let i = 0; i < byteString.length; i++) {
                        byteArray[i] = byteString.charCodeAt(i);
                    }
                    const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
                    const url = URL.createObjectURL(fileBlob);
                    return { filename: pdfData.filename, url: url, dateInfo: pdfData.dateInfo };
                });
                setPdfDataListWithInfo(pdfsWithInfo);
                setLoading(false);
            } else if (Array.isArray(idList) && idList.length === 0) {
                setError('No hay facturas disponibles para este edificio.');
                setLoading(false);
            } else {
                setError('Respuesta inesperada del servidor: Se esperaba una lista de IDs.');
                setLoading(false);
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            pdfDataListWithInfo.forEach(item => URL.revokeObjectURL(item.url));
        };
    }, [pdfDataListWithInfo]);

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <Container className="leg-doc-container">
            <Row>
                <Col>
                    <div className="d-flex align-items-center mb-3">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Button
                                variant="link"
                                onClick={handleGoBack}
                                className="back-button"
                                aria-label="Volver atrás"
                                style={{ padding: 0 }}
                            >
                                <ChevronLeft size={20} color="orange" />
                            </Button>
                            <h1 className="leg-doc-title text-center" style={{ margin: '0 auto' }}>Facturas</h1>
                            <div style={{ visibility: 'hidden', width: 'auto' }}>
                                {/* Este div invisible ocupa el espacio del botón para centrar */}
                                <ChevronLeft size={20} color="transparent" />
                            </div>
                        </div>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <div style={{ width: 'auto' }}></div> {/* Spacer div */}
                    </div>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {loading && !error && (
                        <>
                        <p> Cargando facturas...</p>
                        <Spinner animation="border" size="sm" />
                        </>
                    )}
                    {pdfDataListWithInfo.length > 0 && (
                        <Table striped bordered hover responsive>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre del Archivo</th>
                                <th>Mes</th>
                                <th className="text-center">Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pdfDataListWithInfo.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.filename}</td>
                                    <td>{item.dateInfo}</td>
                                    <td className="text-center">
                                        <Button variant="primary" size="sm" onClick={() => window.open(item.url, '_blank')}>
                                            <File className="mr-2" size={16} /> Abrir
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                    {!pdfDataListWithInfo.length && !error && !loading && buildingId && (
                        <p>No hay facturas disponibles para este edificio.</p>
                    )}
                    {!buildingId && !error && <p>Esperando el ID del edificio...</p>}
                </Col>
            </Row>
        </Container>
    );
}

export default InvoicesDoc;
