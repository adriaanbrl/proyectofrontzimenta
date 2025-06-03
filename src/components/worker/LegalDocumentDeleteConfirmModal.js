import React from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const LegalDocumentDeleteConfirmModal = ({ show, onHide, documentId, buildingId, onDeleteConfirm, isLoading, error, setLoading, setError }) => {
    const handleDelete = async () => {
        if (!documentId) return;

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.delete(`http://localhost:8080/api/legal_documentation/${documentId}`, { headers });
            onDeleteConfirm(documentId, buildingId); 
            onHide();
        } catch (err) {
            setError(err.response?.data?.message || "Error al borrar el documento legal.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton className="bg-danger text-white py-3">
                <Modal.Title className="fw-bold fs-5">Confirmar Borrado de Documento Legal</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <p>¿Estás seguro de que quieres borrar este documento legal? Esta acción no se puede deshacer.</p>
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

export default LegalDocumentDeleteConfirmModal;