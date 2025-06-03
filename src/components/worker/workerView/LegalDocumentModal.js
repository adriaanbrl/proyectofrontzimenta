import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        // Client-side validation for file type
        if (documentFile && documentFile.type !== 'application/pdf') {
            setError('Por favor, sube solo archivos PDF.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', documentTitle);
        formData.append('file', documentFile);
        formData.append('buildingId', parseInt(buildingId, 10));

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
                throw new Error(errorText);
            }

            await response.json();
            setSuccess(true);
            // Optionally, you might want to call onHide() here to close the modal on success
            // onHide();
        } catch (err) {
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
                {success && <Alert variant="success">Documento subido correctamente!</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Título</Form.Label>
                        <Form.Control
                            type="text"
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Archivo</Form.Label>
                        <Form.Control
                            type="file"
                            accept="application/pdf" // <--- This attribute restricts file selection to PDFs
                            onChange={(e) => setDocumentFile(e.target.files[0])}
                            required
                        />
                    </Form.Group>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Subir'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default LegalDocumentModal;
