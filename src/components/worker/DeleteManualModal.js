import React, { useState } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';

const DeleteManualModal = ({ show, onHide, manual, onDeleteSuccess }) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleDelete = async () => {
        setError(null);
        setSuccess(false);
        setLoading(true);
        const token = localStorage.getItem('authToken');

        try {
            const response = await fetch(`http://localhost:8080/api/manuals/${manual.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el manual.');
            }

            setSuccess(true);
            onDeleteSuccess();
            onHide();
        } catch (err) {
            setError(err.message);
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
                {success && <Alert variant="success">Manual eliminado exitosamente!</Alert>}
                {!success && manual && (
                    <p>¿Estás seguro de que quieres eliminar el manual "**{manual.title}**"? Esta acción no se puede deshacer.</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>Cancelar</Button>
                <Button variant="danger" onClick={handleDelete} disabled={loading}>
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                            {' Eliminando...'}
                        </>
                    ) : (
                        'Eliminar'
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteManualModal;