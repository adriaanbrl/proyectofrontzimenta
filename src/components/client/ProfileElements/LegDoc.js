import React, { useEffect, useState } from 'react';
import './LegDoc.css';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Alert, Spinner, Table } from 'react-bootstrap';


function LegDoc() {
    const location = useLocation();
    const [buildingId, setBuildingId] = useState("");
    const [pdfDataList, setPdfDataList] = useState([]);
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
        setPdfDataList([]);


        const token = localStorage.getItem('authToken');


        if (!token) {
            setError("No se encontró el token de autenticación.");
            setLoading(false);
            return;
        }


        try {
            const responseIds = await fetch(`http://localhost:8080/auth/building/${id}/legalDocumentsIds`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });


            if (!responseIds.ok) {
                throw new Error(`Error al obtener la lista de documentos: ${responseIds.status}`);
            }


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


                if (!responsePdfs.ok) {
                    throw new Error(`Error al descargar los documentos: ${responsePdfs.status}`);
                }


                const pdfDataListFromServer = await responsePdfs.json();
                const pdfsWithInfo = pdfDataListFromServer.map(pdfData => {
                    const byteString = atob(pdfData.data);
                    const byteArray = new Uint8Array(byteString.length);
                    for (let i = 0; i < byteString.length; i++) {
                        byteArray[i] = byteString.charCodeAt(i);
                    }
                    const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
                    const url = URL.createObjectURL(fileBlob);
                    return { filename: pdfData.filename, url: url };
                });
                setPdfDataList(pdfsWithInfo);
                setLoading(false);
            } else if (Array.isArray(idList) && idList.length === 0) {
                setError("No hay documentos legales disponibles para este edificio.");
                setLoading(false);
            } else {
                setError("Respuesta inesperada del servidor: Se esperaba una lista de IDs.");
                setLoading(false);
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };


    useEffect(() => {
        return () => {
            pdfDataList.forEach(item => URL.revokeObjectURL(item.url));
        };
    }, [pdfDataList]);


    return (
        <Container className="leg-doc-container">
            <Row>
                <Col>
                    <h1 className="leg-doc-title">Documentación Legal</h1>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {loading && !error && <p><Spinner animation="border" size="sm" /> Cargando documentos...</p>}
                    {pdfDataList.length > 0 && (
                        <Table striped bordered hover responsive>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre del Archivo</th>
                                <th>Acciones</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pdfDataList.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.filename}</td>
                                    <td>
                                        <Button variant="primary" size="sm" onClick={() => window.open(item.url, '_blank')}>
                                            <i className="bi bi-file-pdf-fill mr-2"></i> Abrir Documento
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    )}
                    {!pdfDataList.length && !error && !loading && buildingId && (
                        <p>No hay documentos legales disponibles para este edificio.</p>
                    )}
                    {!buildingId && !error && <p>Esperando el ID del edificio...</p>}
                </Col>
            </Row>
        </Container>
    );
}


export default LegDoc;
