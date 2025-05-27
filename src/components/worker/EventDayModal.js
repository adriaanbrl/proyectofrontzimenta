import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

const EventDayModal = ({ show, onHide, buildingId, buildingTitle }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (show) {
            setTitle('');
            setDescription('');
            setDate('');
            setError(null);
            setSuccess(false);
        }
    }, [show, buildingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const eventData = {
            title,
            description,
            date,
            buildingId: parseInt(buildingId, 10)
        };

        console.log("Submitting Event/Day data:", eventData);

        try {
            const token = localStorage.getItem("authToken");

            const response = await fetch('http://localhost:8080/api/events/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify(eventData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error al guardar el evento/día: ${response.statusText}`);
            }

            const result = await response.json();
            console.log("Evento/Día guardado exitosamente:", result);
            setSuccess(true);
        } catch (err) {
            console.error("Error saving event/day:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Añadir Evento o Día para "{buildingTitle}"</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Evento/Día guardado exitosamente!</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="eventTitle">
                        <Form.Label>Título</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Introduce el título del evento"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="eventDescription">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder="Introduce la descripción del evento"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="eventDate">
                        <Form.Label>Fecha</Form.Label>
                        <Form.Control
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="buildingIdDisplay">
                        <Form.Label>ID de Construcción</Form.Label>
                        <Form.Control
                            type="text"
                            value={buildingId}
                            readOnly
                            disabled
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Guardar Evento/Día'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EventDayModal;