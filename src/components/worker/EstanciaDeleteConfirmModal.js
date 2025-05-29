import React, { useState } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';

const EstanciaDeleteConfirmModal = ({ show, onHide, estanciaId, onDeleteConfirm }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            // Simulate API call to delete estancia
            await new Promise(resolve => setTimeout(resolve, 500));
            onDeleteConfirm(estanciaId);
        } catch (err) {
            setError(err.message || "Error al borrar la estancia.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirmar Eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <p>¿Estás seguro de que quieres borrar esta estancia?</p>
                <div className="d-flex justify-content-end">
                    <Button variant="secondary" onClick={onHide} className="me-2" disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Borrar'}
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default EstanciaDeleteConfirmModal;