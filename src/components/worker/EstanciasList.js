import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { PencilSquare, Trash, PlusCircle } from 'react-bootstrap-icons'; // Import PlusCircle icon

const EstanciasList = () => {
    const [estancias, setEstancias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [currentEstancia, setCurrentEstancia] = useState(null);
    const [editEstanciaName, setEditEstanciaName] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [estanciaToDeleteId, setEstanciaToDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // New state for adding estancias
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEstanciaName, setNewEstanciaName] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState(null);

    useEffect(() => {
        const fetchEstancias = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError('No se encontró el token de autenticación para cargar las estancias.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:8080/api/estancias', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setEstancias(response.data);
            } catch (err) {
                console.error('Error al cargar las estancias:', err);
                setError('Error al cargar las estancias. Por favor, inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchEstancias();
    }, []);

    const handleEditClick = (estancia) => {
        setCurrentEstancia(estancia);
        setEditEstanciaName(estancia.name);
        setEditError(null);
        setShowEditModal(true);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError(null);
        const token = localStorage.getItem('authToken');

        if (!editEstanciaName.trim()) {
            setEditError("El nombre de la estancia no puede estar vacío.");
            setEditLoading(false);
            return;
        }

        try {
            const response = await axios.put(`http://localhost:8080/api/estancias/${currentEstancia.id}`, { name: editEstanciaName }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Update the estancia in the local state with the response data
            setEstancias(prev => prev.map(est => est.id === currentEstancia.id ? response.data : est));
            setShowEditModal(false);
            setCurrentEstancia(null);
            setEditEstanciaName('');
        } catch (err) {
            console.error('Error al actualizar la estancia:', err);
            setEditError('Error al actualizar la estancia. Inténtalo de nuevo.');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteRequest = (estanciaId) => {
        setEstanciaToDeleteId(estanciaId);
        setDeleteError(null);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setDeleteLoading(true);
        setDeleteError(null);
        const token = localStorage.getItem('authToken');

        try {
            await axios.delete(`http://localhost:8080/api/estancias/${estanciaToDeleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEstancias(prev => prev.filter(est => est.id !== estanciaToDeleteId));
            setShowDeleteModal(false);
            setEstanciaToDeleteId(null);
        } catch (err) {
            console.error('Error al borrar la estancia:', err);
            setDeleteError('Error al borrar la estancia. Inténtalo de nuevo.');
        } finally {
            setDeleteLoading(false);
        }
    };

    // New handler for adding an estancia
    const handleAddEstancia = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError(null);
        const token = localStorage.getItem('authToken');

        if (!newEstanciaName.trim()) {
            setAddError("El nombre de la estancia no puede estar vacío.");
            setAddLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/estancias', { name: newEstanciaName }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEstancias(prev => [...prev, response.data]); // Add the new estancia to the list
            setShowAddModal(false);
            setNewEstanciaName('');
        } catch (err) {
            console.error('Error al crear la estancia:', err);
            setAddError('Error al crear la estancia. Inténtalo de nuevo.');
        } finally {
            setAddLoading(false);
        }
    };

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Estancias Registradas</h5>
                <Button variant="light" size="sm" onClick={() => { setShowAddModal(true); setNewEstanciaName(''); setAddError(null); }}>
                    <PlusCircle className="me-1" /> Añadir Estancia
                </Button>
            </Card.Header>
            <Card.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" size="sm" /> Cargando estancias...
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : estancias.length > 0 ? (
                    <ListGroup variant="flush">
                        {estancias.map(estancia => (
                            <ListGroup.Item
                                key={estancia.id}
                                className="d-flex justify-content-between align-items-center"
                            >
                                {estancia.name}
                                <div className="d-flex">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEditClick(estancia)}
                                    >
                                        <PencilSquare />
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteRequest(estancia.id)}
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <Alert variant="info">No hay estancias registradas.</Alert>
                )}
            </Card.Body>

            {/* Edit Estancia Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Estancia</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editError && <Alert variant="danger">{editError}</Alert>}
                    <Form onSubmit={handleEditSave}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre de la Estancia</Form.Label>
                            <Form.Control
                                type="text"
                                value={editEstanciaName}
                                onChange={(e) => setEditEstanciaName(e.target.value)}
                                required
                                disabled={editLoading}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={() => setShowEditModal(false)} className="me-2" disabled={editLoading}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={editLoading}>
                                {editLoading ? <Spinner animation="border" size="sm" /> : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deleteError && <Alert variant="danger">{deleteError}</Alert>}
                    <p>¿Estás seguro de que quieres borrar esta estancia?</p>
                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="me-2" disabled={deleteLoading}>
                            Cancelar
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                            {deleteLoading ? <Spinner animation="border" size="sm" /> : 'Borrar'}
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Add New Estancia Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Añadir Nueva Estancia</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {addError && <Alert variant="danger">{addError}</Alert>}
                    <Form onSubmit={handleAddEstancia}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre de la Nueva Estancia</Form.Label>
                            <Form.Control
                                type="text"
                                value={newEstanciaName}
                                onChange={(e) => setNewEstanciaName(e.target.value)}
                                required
                                disabled={addLoading}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="me-2" disabled={addLoading}>
                                Cancelar
                            </Button>
                            <Button variant="success" type="submit" disabled={addLoading}>
                                {addLoading ? <Spinner animation="border" size="sm" /> : 'Añadir Estancia'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Card>
    );
};

export default EstanciasList;