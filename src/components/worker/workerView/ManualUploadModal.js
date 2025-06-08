import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';

const ManualUploadModal = ({ show, onHide, buildingId, buildingTitle, onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [title, setTitle] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        if (!selectedFile) {
            setError('Por favor, selecciona un archivo PDF.');
            return;
        }

        if (!title.trim()) {
            setError('Por favor, ingresa un título para el manual.');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file', selectedFile);
        formData.append('buildingId', buildingId);

        try {
            const response = await fetch('http://localhost:8080/api/manuals/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al subir el manual.');
            }

            setSuccess(true);
            setSelectedFile(null);
            setTitle('');
            onUploadSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Subir Manual de Usuario para {buildingTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Manual subido exitosamente!</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="manualTitle" className="mb-3">
                        <Form.Label>Título del Manual</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduce el título del manual"
                            value={title}
                            onChange={handleTitleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="manualFile" className="mb-3">
                        <Form.Label>Seleccionar archivo PDF</Form.Label>
                        <Form.Control
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                                {' Subiendo...'}
                            </>
                        ) : (
                            'Subir Manual'
                        )}
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ManualUploadModal;