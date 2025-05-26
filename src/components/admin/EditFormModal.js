import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const EditFormModal = ({ show, onHide, item, itemType, onSave }) => {
    // Estado local para los datos del formulario, inicializado con el item recibido
    const [formData, setFormData] = useState({});

    // Efecto para actualizar formData cuando el 'item' prop cambia (ej. al editar un nuevo elemento)
    useEffect(() => {
        if (item) {
            // Clonar el item para evitar mutar el estado original directamente
            const newItem = { ...item };

            // Manejo específico para el tipo 'worker'
            if (itemType === 'worker') {
                // Asegurar que 'contact' sea un string para el input
                newItem.contact = newItem.contact !== undefined && newItem.contact !== null
                    ? String(newItem.contact)
                    : '';

                // If 'rol' is the old direct role, it might be removed or handled differently
                // Based on recent changes, worker.rol is now permissionRol, and worker.workertypes handles positions.
                // For editing, we generally only send back primitive fields unless specific relations are editable here.
                // Assuming 'rol' here refers to the old direct field that's no longer part of the update.
                delete newItem.rol; // Remove old 'rol' if it's not part of the editable fields
            }

            // Manejo específico para fechas y AÑADIDO 'title' en 'building'
            if (itemType === 'building') {
                newItem.startDate = newItem.startDate ? new Date(newItem.startDate).toISOString().split('T')[0] : '';
                newItem.endDate = newItem.endDate ? new Date(newItem.endDate).toISOString().split('T')[0] : '';
                newItem.title = newItem.title || ''; // Initialize title field
            }

            setFormData(newItem);
        }
    }, [item, itemType]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };

        if (itemType === 'worker') {
            // Convert contact back to integer if it's a number string
            dataToSave.contact = dataToSave.contact ? parseInt(dataToSave.contact, 10) : null;
        }

        onSave(dataToSave, itemType);
    };


    if (!item) {
        return null;
    }

    // Renderizado condicional del formulario según el tipo de elemento
    const renderFormFields = () => {
        switch (itemType) {
            case 'building':
                return (
                    <>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Dirección</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Form.Group>
                        {/* ADDED: Form Group for Title */}
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Título</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={formData.title || ''}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Fecha Inicio</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate || ''} // Ya pre-procesado en useEffect
                                    onChange={handleChange}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Fecha Fin</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate || ''} // Ya pre-procesado en useEffect
                                    onChange={handleChange}
                                />
                            </Col>
                        </Form.Group>
                    </>
                );
            case 'worker':
                return (
                    <>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Nombre</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Apellido</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="text"
                                    name="surname"
                                    value={formData.surname || ''}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Contacto</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="text"
                                    name="contact"
                                    value={formData.contact || ''}
                                    onChange={handleChange}
                                    maxLength={9}
                                    pattern="[0-9]*"
                                />
                            </Col>
                        </Form.Group>
                    </>
                );
            case 'customer':
                return (
                    <>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Nombre</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Apellido</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="text"
                                    name="surname"
                                    value={formData.surname || ''}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Email</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Username</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={formData.username || ''}
                                    onChange={handleChange}
                                />
                            </Col>
                        </Form.Group>
                    </>
                );
            default:
                return <p>No hay campos de formulario definidos para este tipo de elemento.</p>;
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar {itemType === 'building' ? 'Construcción' : itemType === 'worker' ? 'Trabajador' : 'Cliente'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {renderFormFields()}
                    <div className="d-flex justify-content-end mt-4">
                        <Button variant="secondary" onClick={onHide} className="me-2">
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit">
                            Guardar Cambios
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditFormModal;
