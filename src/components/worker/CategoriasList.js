import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { PencilSquare, Trash, PlusCircle } from 'react-bootstrap-icons'; // Import PlusCircle icon

const CategoriasList = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [currentCategoria, setCurrentCategoria] = useState(null);
    const [editCategoriaName, setEditCategoriaName] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoriaToDeleteId, setCategoriaToDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    // New state for adding categories
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategoriaName, setNewCategoriaName] = useState('');
    const [addLoading, setAddLoading] = useState(false);
    const [addError, setAddError] = useState(null);

    useEffect(() => {
        const fetchCategorias = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');

            if (!token) {
                setError('No se encontró el token de autenticación para cargar las categorías.');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get('http://localhost:8080/api/categorias', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setCategorias(response.data);
            } catch (err) {
                console.error('Error al cargar las categorías:', err);
                setError('Error al cargar las categorías. Por favor, inténtalo de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchCategorias();
    }, []);

    const handleEditClick = (categoria) => {
        setCurrentCategoria(categoria);
        setEditCategoriaName(categoria.name);
        setEditError(null);
        setShowEditModal(true);
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditError(null);
        const token = localStorage.getItem('authToken');

        if (!editCategoriaName.trim()) {
            setEditError("El nombre de la categoría no puede estar vacío.");
            setEditLoading(false);
            return;
        }

        try {
            const response = await axios.put(`http://localhost:8080/api/categorias/${currentCategoria.id}`, { name: editCategoriaName }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Update the category in the local state with the response data (if your backend returns the updated object)
            setCategorias(prev => prev.map(cat => cat.id === currentCategoria.id ? response.data : cat));
            setShowEditModal(false);
            setCurrentCategoria(null);
            setEditCategoriaName('');
        } catch (err) {
            console.error('Error al actualizar la categoría:', err);
            setEditError('Error al actualizar la categoría. Inténtalo de nuevo.');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteRequest = (categoriaId) => {
        setCategoriaToDeleteId(categoriaId);
        setDeleteError(null);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setDeleteLoading(true);
        setDeleteError(null);
        const token = localStorage.getItem('authToken');

        try {
            await axios.delete(`http://localhost:8080/api/categorias/${categoriaToDeleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCategorias(prev => prev.filter(cat => cat.id !== categoriaToDeleteId));
            setShowDeleteModal(false);
            setCategoriaToDeleteId(null);
        } catch (err) {
            console.error('Error al borrar la categoría:', err);
            setDeleteError('Error al borrar la categoría. Inténtalo de nuevo.');
        } finally {
            setDeleteLoading(false);
        }
    };

    // New handler for adding a category
    const handleAddCategoria = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddError(null);
        const token = localStorage.getItem('authToken');

        if (!newCategoriaName.trim()) {
            setAddError("El nombre de la categoría no puede estar vacío.");
            setAddLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/categorias', { name: newCategoriaName }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCategorias(prev => [...prev, response.data]); // Add the new category to the list
            setShowAddModal(false);
            setNewCategoriaName('');
        } catch (err) {
            console.error('Error al crear la categoría:', err);
            setAddError('Error al crear la categoría. Inténtalo de nuevo.');
        } finally {
            setAddLoading(false);
        }
    };

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Categorías Registradas</h5>
                <Button variant="light" size="sm" onClick={() => { setShowAddModal(true); setNewCategoriaName(''); setAddError(null); }}>
                    <PlusCircle className="me-1" /> Añadir Categoría
                </Button>
            </Card.Header>
            <Card.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" size="sm" /> Cargando categorías...
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : categorias.length > 0 ? (
                    <ListGroup variant="flush">
                        {categorias.map(categoria => (
                            <ListGroup.Item
                                key={categoria.id}
                                className="d-flex justify-content-between align-items-center"
                            >
                                {categoria.name}
                                <div className="d-flex">
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => handleEditClick(categoria)}
                                    >
                                        <PencilSquare />
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleDeleteRequest(categoria.id)}
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ) : (
                    <Alert variant="info">No hay categorías registradas.</Alert>
                )}
            </Card.Body>

            {/* Edit Category Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Categoría</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {editError && <Alert variant="danger">{editError}</Alert>}
                    <Form onSubmit={handleEditSave}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre de la Categoría</Form.Label>
                            <Form.Control
                                type="text"
                                value={editCategoriaName}
                                onChange={(e) => setEditCategoriaName(e.target.value)}
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
                    <p>¿Estás seguro de que quieres borrar esta categoría?</p>
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

            {/* Add New Category Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Añadir Nueva Categoría</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {addError && <Alert variant="danger">{addError}</Alert>}
                    <Form onSubmit={handleAddCategoria}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre de la Nueva Categoría</Form.Label>
                            <Form.Control
                                type="text"
                                value={newCategoriaName}
                                onChange={(e) => setNewCategoriaName(e.target.value)}
                                required
                                disabled={addLoading}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={() => setShowAddModal(false)} className="me-2" disabled={addLoading}>
                                Cancelar
                            </Button>
                            <Button variant="success" type="submit" disabled={addLoading}>
                                {addLoading ? <Spinner animation="border" size="sm" /> : 'Añadir Categoría'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </Card>
    );
};

export default CategoriasList;