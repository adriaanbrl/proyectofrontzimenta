import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const InvoiceEditModal = ({ show, onHide, invoiceData, onSave, isLoading, error, setLoading, setError }) => {
    const [formData, setFormData] = useState({
        amount: '',
        date: '',
        title: '',
        documentBase64: null
    });

    useEffect(() => {
        if (invoiceData) {
            setFormData({
                amount: invoiceData.amount || '',
                date: invoiceData.date ? new Date(invoiceData.date).toISOString().split('T')[0] : '',
                title: invoiceData.title || '',
                documentBase64: null // Reset file input
            });
        }
    }, [invoiceData]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file' && files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    documentBase64: reader.result.split(',')[1]
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
        if (!invoiceData) return;

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const payload = {
                amount: parseFloat(formData.amount),
                date: formData.date,
                title: formData.title,
                documentBase64: formData.documentBase64
            };

            await axios.put(`http://localhost:8080/api/invoices/${invoiceData.id}`, payload, {
                headers: {
                    ...headers,
                    'Content-Type': 'application/json'
                }
            });
            onSave(invoiceData.buildingId); // Pass buildingId to refresh
            onHide();
        } catch (err) {
            console.error("Error al actualizar la factura:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Error al actualizar la factura.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-primary text-white py-3">
                <Modal.Title className="fw-bold fs-5">Editar Factura</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {invoiceData && (
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Monto</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Título</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Documento PDF</Form.Label>
                            <Form.Control
                                type="file"
                                name="documentFile"
                                onChange={handleChange}
                                accept="application/pdf"
                            />
                            <Form.Text className="text-muted">
                                Selecciona un nuevo PDF para reemplazar el documento actual.
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

export default InvoiceEditModal;