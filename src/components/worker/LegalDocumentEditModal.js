import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const LegalDocumentEditModal = ({ show, onHide, documentData, onSave, isLoading, error, setLoading, setError }) => {
    const [formData, setFormData] = useState({
        title: '',
        building_id: '',
        documentBase64: null // Initialize documentBase64 in formData
    });

    // Removed selectedFile state as file will be handled as base64 in formData

    useEffect(() => {
        if (show && documentData) {
            setFormData({
                title: documentData.title || '',
                building_id: documentData.building_id || '',
                documentBase64: null // Reset file input when modal opens
            });
            setError(null);
            setLoading(false);
        }
    }, [show, documentData, setError, setLoading]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file' && files && files[0]) {
            const file = files[0];
            // No client-side PDF type check here, relying on 'accept' attribute and backend validation
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    documentBase64: reader.result.split(',')[1] // Store base64 string
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async () => {
        if (!documentData || !documentData.id) {
            setError("No se pudo obtener la información del documento para actualizar.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Construct payload similar to InvoiceEditModal
            const payload = {
                title: formData.title,
                documentBase64: formData.documentBase64, // Send base64 string
                // Include buildingId if your backend requires it for updates
                buildingId: parseInt(formData.building_id, 10)
            };

            // Make the PUT request with application/json content type
            await axios.put(
                `http://localhost:8080/api/legal_documentation/${documentData.id}`,
                payload,
                {
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json' // Explicitly set for JSON payload
                    }
                }
            );

            onSave(documentData.building_id);
            onHide();
        } catch (err) {
            console.error("Error al actualizar el documento legal:", err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || "Error al actualizar el documento legal.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-custom text-white py-3">
                <Modal.Title className="fw-bold fs-5">Editar Documento Legal</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {documentData && (
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Título</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Introduce el título del documento"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Documento PDF</Form.Label>
                            <Form.Control
                                type="file"
                                name="documentFile"
                                onChange={handleChange}
                                accept="application/pdf"
                            />
                            <Form.Text className="text-muted">
                                Selecciona un nuevo PDF para reemplazar el documento actual (opcional).
                            </Form.Text>
                        </Form.Group>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : 'Guardar Cambios'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default LegalDocumentEditModal;
