import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Alert, Spinner } from 'react-bootstrap';


function InvoicesDoc() {
    const location = useLocation();
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

    return (
        <Container className="leg-doc-container">
            <Row>
                <Col>
                    <h1 className="leg-doc-title">Facturas</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {loading && !error && (
                        <p>
                            <Spinner animation="border" size="sm" /> Cargando facturas...
                        </p>
                    )}
                    {pdfDataListWithInfo.length > 0 && (
                        <Table striped bordered hover responsive>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre del Archivo</th>
                                <th>Mes</th>
                                <th>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pdfDataListWithInfo.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.filename}</td>
                                    <td>{item.dateInfo}</td>
                                    <td>
                                        <Button variant="primary" size="sm" onClick={() => window.open(item.url, '_blank')}>
                                            <i className="bi bi-file-pdf-fill mr-2"></i> Abrir
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