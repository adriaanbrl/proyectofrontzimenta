import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

const InvoiceUploadModal = ({ show, onHide, buildingId, buildingTitle }) => {
    const [invoiceTitle, setInvoiceTitle] = useState('');
    const [invoiceDate, setInvoiceDate] = useState('');
    const [invoiceAmount, setInvoiceAmount] = useState('');
    const [invoiceFile, setInvoiceFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (show) {
            setInvoiceTitle('');
            setInvoiceDate('');
            setInvoiceAmount('');
            setInvoiceFile(null);
            setError(null);
            setSuccess(false);
        }
    }, [show, buildingId]);

    const handleFileChange = (e) => {
        setInvoiceFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        if (!invoiceFile) {
            setError("Por favor, selecciona un archivo de factura.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('title', invoiceTitle);
        formData.append('date', invoiceDate); // Assuming date format "YYYY-MM-DD"
        formData.append('amount', parseFloat(invoiceAmount)); // Ensure amount is a number
        formData.append('file', invoiceFile);
        formData.append('buildingId', parseInt(buildingId, 10));

        console.log("Submitting Invoice data:", {
            invoiceTitle,
            invoiceDate,
            invoiceAmount,
            invoiceFileName: invoiceFile.name,
            buildingId
        });

        try {
            const token = localStorage.getItem("authToken");

            const response = await fetch('http://localhost:8080/api/invoices/upload', {
                method: 'POST',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Error al subir la factura: ${response.statusText}`;
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    errorMessage = errorText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log("Factura subida exitosamente:", result);
            setSuccess(true);
            // onInvoiceUploadSuccess();
        } catch (err) {
            console.error("Error uploading invoice:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Subir Factura para "{buildingTitle}"</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Factura subida exitosamente!</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="invoiceTitle">
                        <Form.Label>Título de la Factura</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduce el título de la factura"
                            value={invoiceTitle}
                            onChange={(e) => setInvoiceTitle(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="invoiceDate">
                        <Form.Label>Fecha de la Factura</Form.Label>
                        <Form.Control
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="invoiceAmount">
                        <Form.Label>Monto</Form.Label>
                        <Form.Control
                            type="number"
                            step="0.01"
                            placeholder="Introduce el monto de la factura"
                            value={invoiceAmount}
                            onChange={(e) => setInvoiceAmount(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="invoiceFile">
                        <Form.Label>Seleccionar Archivo PDF</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="buildingIdDisplayInvoice">
                        <Form.Label>ID de Construcción</Form.Label>
                        <Form.Control
                            type="text"
                            value={buildingId}
                            readOnly
                            disabled
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Subir Factura'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default InvoiceUploadModal;