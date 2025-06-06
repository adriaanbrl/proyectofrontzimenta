import React from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const InvoiceDeleteConfirmModal = ({ show, onHide, invoiceId, onDeleteConfirm, isLoading, error, setLoading, setError }) => {
    const handleDelete = async () => {
        if (!invoiceId) return;

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.delete(`http://localhost:8080/api/invoices/${invoiceId}`, { headers });
            onDeleteConfirm(invoiceId); 
            onHide();
        } catch (err) {
            console.error("Error al borrar la factura:", err);
            setError(err.response?.data?.message || "Error al borrar la factura.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-danger text-white py-3">
                <Modal.Title className="fw-bold fs-5">Confirmar Borrado de Factura</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <p>¿Estás seguro de que quieres borrar esta factura? Esta acción no se puede deshacer.</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={isLoading}>
                    Cancelar
                </Button>
                <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
                    {isLoading ? <Spinner animation="border" size="sm" /> : 'Borrar'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default InvoiceDeleteConfirmModal;