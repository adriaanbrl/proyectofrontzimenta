import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

const LegalDocumentModal = ({ show, onHide, buildingId, buildingTitle }) => {
    const [documentTitle, setDocumentTitle] = useState('');
    const [documentFile, setDocumentFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (show) {
            setDocumentTitle('');
            setDocumentFile(null);
            setError(null);
            setSuccess(false);
        }
    }, [show, buildingId]);

    const handleFileChange = (e) => {
        setDocumentFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (!documentFile) {
            setError("Por favor, selecciona un archivo.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', documentTitle);
        formData.append('file', documentFile);
        formData.append('buildingId', parseInt(buildingId, 10));

        console.log("Submitting Legal Document data:", {
            documentTitle,
            documentFileName: documentFile.name,
            buildingId
        });

        try {
            const token = localStorage.getItem("authToken");

            const response = await fetch('http://localhost:8080/api/legal-documents/upload', {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Error al subir el documento legal: ${response.statusText}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log("Documento legal subido exitosamente:", result);
            setSuccess(true);
            // Optionally, call a callback to update parent state or refresh data
            // onDocumentUploadSuccess();
        } catch (err) {
            console.error("Error uploading legal document:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Subir Documento Legal para "{buildingTitle}"</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Documento legal subido exitosamente!</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="documentTitle">
                        <Form.Label>Título del Documento</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduce el título del documento"
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="documentFile">
                        <Form.Label>Seleccionar Archivo</Form.Label>
                        <Form.Control
                            type="file"
                            onChange={handleFileChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="buildingIdDisplayLegal">
                        <Form.Label>ID de Construcción</Form.Label>
                        <Form.Control
                            type="text"
                            value={buildingId}
                            readOnly
                            disabled
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Subir Documento Legal'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default LegalDocumentModal;