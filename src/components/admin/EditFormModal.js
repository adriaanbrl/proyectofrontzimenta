import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const EditFormModal = ({ show, onHide, item, itemType, onSave }) => {
    // Estado local para los datos del formulario, inicializado con el item recibido
    const [formData, setFormData] = useState({});

    // Efecto para actualizar formData cuando el 'item' prop cambia (ej. al editar un nuevo elemento)
    useEffect(() => {
        if (item) {
            // Clonar el item para evitar mutar el estado original directamente
            setFormData({ ...item });
        }
    }, [item]);

    // Manejador de cambios para los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Manejador para el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, itemType); // Llama a la función onSave pasada por props
        onHide(); // Cierra el modal después de guardar
    };

    // Si no hay 'item' (ej. modal abierto sin seleccionar nada), no renderizar
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
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Fecha Inicio</Form.Label>
                            <Col sm="9">
                                <Form.Control
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
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
                                    value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
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
                                    type="text" // Usar 'text' para contacto si puede contener no-números o símbolos
                                    name="contact"
                                    value={formData.contact || ''}
                                    onChange={handleChange}
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
                        {/* La dirección de la obra se muestra, pero no se edita directamente aquí ya que es una relación */}
                        {/* Si quieres editar la obra, necesitarías un selector de obras o una lógica más compleja */}
                        {/* Puedes añadir más campos de Customer aquí si los necesitas */}
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
