import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';

const EditManualModal = ({ show, onHide, manual, onEditSuccess }) => {
    const [title, setTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (manual) {
            setTitle(manual.title || '');
            setSelectedFile(null);
            setError(null);
            setSuccess(false);
        }
    }, [manual]);

    const handleTitleChange = (event) => {
        setTitle(event.target.value);
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        if (!title.trim()) {
            setError('El título del manual no puede estar vacío.');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('title', title);
        if (selectedFile) {
            formData.append('file', selectedFile);
        }
        formData.append('manualId', manual.id);

        try {
            const response = await fetch(`http://localhost:8080/api/manuals/${manual.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el manual.');
            }

            setSuccess(true);
            onEditSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar Manual: {manual?.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Manual actualizado exitosamente!</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="editManualTitle" className="mb-3">
                        <Form.Label>Título del Manual</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduce el nuevo título del manual"
                            value={title}
                            onChange={handleTitleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="editManualFile" className="mb-3">
                        <Form.Label>Cambiar archivo PDF (opcional)</Form.Label>
                        <Form.Control
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                        />
                        {selectedFile && <Form.Text muted>Archivo seleccionado: {selectedFile.name}</Form.Text>}
                        {!selectedFile && manual?.filename && <Form.Text muted>Archivo actual: {manual.filename}</Form.Text>}
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
                                {' Actualizando...'}
                            </>
                        ) : (
                            'Actualizar Manual'
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

export default EditManualModal;