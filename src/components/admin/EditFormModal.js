import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const EditFormModal = ({ show, onHide, item, itemType, onSave, allRoles }) => {
    const [formData, setFormData] = useState({});
    const [selectedRoleIds, setSelectedRoleIds] = useState(new Set());

    useEffect(() => {
        if (show && item) {
            const newItem = { ...item };

            if (itemType === 'worker') {
                newItem.contact = newItem.contact !== undefined && newItem.contact !== null
                    ? String(newItem.contact)
                    : '';

                if (item.workertypes) {
                    const currentRoleIds = new Set(item.workertypes.map(wt => wt.role?.id).filter(Boolean));
                    setSelectedRoleIds(currentRoleIds);
                } else {
                    setSelectedRoleIds(new Set());
                }
            }

            if (itemType === 'building') {
                newItem.startDate = newItem.startDate ? new Date(newItem.startDate).toISOString().split('T')[0] : '';
                newItem.endDate = newItem.endDate ? new Date(newItem.endDate).toISOString().split('T')[0] : '';
                newItem.title = newItem.title || '';
            }

            setFormData(newItem);
        }
    }, [show, item, itemType]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleRoleChange = (roleId, isChecked) => {
        setSelectedRoleIds(prev => {
            const newSet = new Set(prev);
            if (isChecked) {
                newSet.add(roleId);
            } else {
                newSet.delete(roleId);
            }
            return newSet;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = { ...formData };

        if (itemType === 'worker') {
            dataToSave.contact = dataToSave.contact ? parseInt(dataToSave.contact, 10) : null;

            dataToSave.workertypes = Array.from(selectedRoleIds).map(roleId => {
                const role = allRoles.find(r => r.id === roleId);
                return {
                    role: { id: role.id, name: role.name }
                };
            });
        }

        onSave(dataToSave, itemType);
        onHide();
    };

    if (!item) {
        return null;
    }

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
                                    value={formData.startDate || ''}
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
                                    value={formData.endDate || ''}
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
                        <Form.Group as={Row} className="mb-3">
                            <Form.Label column sm="3">Puestos</Form.Label>
                            <Col sm="9">
                                {allRoles.length > 0 ? (
                                    allRoles.map(role => (
                                        <Form.Check
                                            key={role.id}
                                            type="checkbox"
                                            id={`role-${role.id}`}
                                            label={role.name}
                                            checked={selectedRoleIds.has(role.id)}
                                            onChange={(e) => handleRoleChange(role.id, e.target.checked)}
                                        />
                                    ))
                                ) : (
                                    <p>No hay puestos disponibles.</p>
                                )}
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
