import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const EventDetailModal = ({ show, onHide, eventData, onSave, onDelete }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        if (eventData) {
            setTitle(eventData.title || '');
            setDescription(eventData.description || '');
            setDate(eventData.date ? new Date(eventData.date).toISOString().split('T')[0] : '');
        } else {
            setTitle('');
            setDescription('');
            setDate('');
        }
        setError(null);
        setIsLoading(false);
    }, [eventData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const updatedEvent = {
            ...eventData,
            title,
            description,
            date
        };

        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.put(`http://localhost:8080/auth/building/updateEvents/${eventData.id}`, updatedEvent, { headers });
            onSave(updatedEvent);
        } catch (err) {
            setError(err.response?.data?.message || "Error al guardar el evento.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("authToken");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.delete(`http://localhost:8080/auth/building/deleteEvents/${eventData.id}`, { headers });
            onDelete(eventData.id, eventData.buildingId);
        } catch (err) {
            setError(err.response?.data?.message || "Error al eliminar el evento.");
        } finally {
            setIsLoading(false);
            setShowConfirmModal(false);
        }
    };

    return (
        <>
            <Modal show={show} onHide={onHide} centered>
                <Modal.Header closeButton className="bg-custom text-white py-3">
                    <Modal.Title className="fw-bold fs-5">{eventData?.id ? 'Editar Evento' : 'Detalle del Evento'}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {error && <Alert variant="danger" className="mb-3 text-center">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Título</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Introduce el título del evento"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe el evento"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="fw-semibold">Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            <Button variant="success" type="submit" disabled={isLoading} className="w-48 me-2 d-flex align-items-center justify-content-center">
                                {isLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" /> Guardando...
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </Button>
                            <Button variant="danger" onClick={() => setShowConfirmModal(true)} disabled={isLoading} className="w-48 ms-2 d-flex align-items-center justify-content-center">
                                {isLoading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" /> Eliminando...
                                    </>
                                ) : (
                                    'Eliminar Evento'
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" /> Eliminando...
                            </>
                        ) : (
                            'Eliminar'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default EventDetailModal;