import React, { useState, useEffect, useCallback } from 'react';
import {Card, Spinner, Alert, Row, Col, Button, Modal, Image, Container, Form} from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt, FaUpload } from 'react-icons/fa';
import planPlaceholderImage from '../client/planos.jpg';


const BuildingImagesList = ({ buildingId }) => {
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(true);
    const [errorImages, setErrorImages] = useState(null);

    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [imageToEdit, setImageToEdit] = useState(null);
    const [editRoomId, setEditRoomId] = useState('');
    const [editTitle, setEditTitle] = useState('');
    const [selectedFileForEdit, setSelectedFileForEdit] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [errorRooms, setErrorRooms] = useState(null);
    const [savingChanges, setSavingChanges] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [deletingImage, setDeletingImage] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    const [buildingPlanUrl, setBuildingPlanUrl] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [errorPlan, setErrorPlan] = useState(null);
    const [planFetched, setPlanFetched] = useState(false);

    const [showPlanEditModal, setShowPlanEditModal] = useState(false);
    const [selectedPlanFile, setSelectedPlanFile] = useState(null);
    const [uploadingPlan, setUploadingPlan] = useState(false);
    const [uploadPlanError, setUploadPlanError] = useState(null);
    const [planTitle, setPlanTitle] = useState('');

    const [showPlanDeleteConfirmModal, setShowPlanDeleteConfirmModal] = useState(false);
    const [deletingPlan, setDeletingPlan] = useState(false);
    const [deletePlanError, setDeletePlanError] = useState(null);


    const navigate = useNavigate();

    const getAuthToken = useCallback(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            setErrorImages("No se encontró el token de autenticación.");
            setTimeout(() => navigate('/login'), 1000);
            return null;
        }
        try {
            jwtDecode(token);
            return token;
        } catch (err) {
            setErrorImages("Error de autenticación. Token inválido o expirado.");
            localStorage.removeItem("authToken");
            setTimeout(() => navigate('/login'), 2000);
            return null;
        }
    }, [navigate]);

    const fetchImagesMetadataForBuilding = useCallback(async (id) => {
        setLoadingImages(true);
        setErrorImages(null);
        const token = getAuthToken();
        if (!token) return;

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
            const response = await fetch(`http://localhost:8080/api/buildings/${id}/images`, { headers });

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error("Acceso denegado o sesión expirada al cargar metadatos de imágenes. Por favor, inicie sesión de nuevo.");
                }
                throw new Error(`Error al cargar metadatos de imágenes: ${response.statusText}`);
            }
            const data = await response.json();

            const sortedData = data.sort((a, b) => {
                const titleA = (a.title || '').toLowerCase();
                const titleB = (b.title || '').toLowerCase();
                if (titleA < titleB) return -1;
                if (titleA > titleB) return 1;
                return 0;
            });
            setImages(sortedData);

        } catch (err) {
            setErrorImages(err.message);
            if (err.message.includes("Acceso denegado") || err.message.includes("sesión expirada")) {
                localStorage.removeItem("authToken");
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setLoadingImages(false);
        }
    }, [navigate, getAuthToken]);

    const fetchRoomsForBuilding = useCallback(async (id) => {
        setLoadingRooms(true);
        setErrorRooms(null);
        const token = getAuthToken();
        if (!token) return;

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };
            const response = await fetch(`http://localhost:8080/api/estancias`, { headers });

            if (!response.ok) {
                throw new Error(`Error al cargar habitaciones: ${response.statusText}`);
            }
            const data = await response.json();
            setRooms(data);
        } catch (err) {
            setErrorRooms(err.message);
        } finally {
            setLoadingRooms(false);
        }
    }, [getAuthToken]);

    const getBuildingPlanUrl = useCallback(async (id) => {
        setLoadingPlan(true);
        setErrorPlan(null);
        const token = getAuthToken();
        if (!token) {
            setLoadingPlan(false);
            return;
        }

        try {
            const url = `http://localhost:8080/api/buildings/${id}/planos`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setBuildingPlanUrl(url);
                setPlanFetched(true);
            } else if (response.status === 404) {
                setBuildingPlanUrl(null);
                setPlanFetched(true);
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error fetching plan URL for building ${id}:`, error);
            setErrorPlan("Error al obtener la URL del plano.");
            setBuildingPlanUrl(null);
            setPlanFetched(true);
        } finally {
            setLoadingPlan(false);
        }
    }, [getAuthToken]);


    useEffect(() => {
        if (buildingId) {
            fetchImagesMetadataForBuilding(buildingId);
            fetchRoomsForBuilding(buildingId);
            getBuildingPlanUrl(buildingId);
        }
    }, [buildingId, fetchImagesMetadataForBuilding, fetchRoomsForBuilding, getBuildingPlanUrl]);

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setShowImageModal(true);
    };

    const handleCloseImageModal = () => {
        setShowImageModal(false);
        setSelectedImage(null);
    };

    const handleEditClick = (image) => {
        setImageToEdit(image);
        setEditRoomId(image.roomId || '');
        setEditTitle(image.title || '');
        setSelectedFileForEdit(null);
        setShowEditModal(true);
        setSaveError(null);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setImageToEdit(null);
        setEditRoomId('');
        setEditTitle('');
        setSelectedFileForEdit(null);
        setSaveError(null);
    };

    const handleFileChangeForEdit = (e) => {
        setSelectedFileForEdit(e.target.files[0]);
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setSavingChanges(true);
        setSaveError(null);
        const token = getAuthToken();
        if (!token || !imageToEdit) {
            setSavingChanges(false);
            return;
        }

        try {
            let response;
            if (selectedFileForEdit) {
                const formData = new FormData();
                formData.append('file', selectedFileForEdit);
                formData.append('title', editTitle);
                formData.append('roomId', editRoomId || '');

                response = await fetch(`http://localhost:8080/api/images/${imageToEdit.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData,
                });
            } else {
                const updatedData = {
                    roomId: editRoomId || null,
                    title: editTitle
                };

                response = await fetch(`http://localhost:8080/api/images/${imageToEdit.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedData),
                });
            }


            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error("Acceso denegado o sesión expirada al actualizar imagen.");
                }
                throw new Error(`Error al actualizar imagen: ${response.statusText}`);
            }

            await fetchImagesMetadataForBuilding(buildingId);
            handleCloseEditModal();
        } catch (err) {
            setSaveError(err.message);
            if (err.message.includes("Acceso denegado") || err.message.includes("sesión expirada")) {
                localStorage.removeItem("authToken");
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setSavingChanges(false);
        }
    };

    const handleDeleteClick = (image) => {
        setImageToDelete(image);
        setShowDeleteConfirmModal(true);
        setDeleteError(null);
    };

    const handleCloseDeleteConfirmModal = () => {
        setShowDeleteConfirmModal(false);
        setImageToDelete(null);
        setDeleteError(null);
    };

    const handleConfirmDelete = async () => {
        setDeletingImage(true);
        setDeleteError(null);
        const token = getAuthToken();
        if (!token || !imageToDelete) {
            setDeletingImage(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/images/${imageToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error("Acceso denegado o sesión expirada al eliminar imagen.");
                }
                throw new Error(`Error al eliminar imagen: ${response.statusText}`);
            }

            setImages(prevImages => {
                const updatedImages = prevImages.filter(img => img.id !== imageToDelete.id);
                return updatedImages.sort((a, b) => {
                    const titleA = (a.title || '').toLowerCase();
                    const titleB = (b.title || '').toLowerCase();
                    if (titleA < titleB) return -1;
                    if (titleA > titleB) return 1;
                    return 0;
                });
            });
            handleCloseDeleteConfirmModal();
        } catch (err) {
            setDeleteError(err.message);
            if (err.message.includes("Acceso denegado") || err.message.includes("sesión expirada")) {
                localStorage.removeItem("authToken");
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setDeletingImage(false);
        }
    };

    const handlePlanClick = async () => {
        const token = getAuthToken();
        if (!token) return;

        if (!planFetched || errorPlan) {
            await getBuildingPlanUrl(buildingId);
        }

        if (buildingPlanUrl) {
            setLoadingPlan(true);
            setErrorPlan(null);
            try {
                const response = await fetch(buildingPlanUrl, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const urlCreator = window.URL || window.webkitURL;
                    const pdfUrl = urlCreator.createObjectURL(blob);
                    window.open(pdfUrl, "_blank");
                } else if (response.status === 403) {
                    setErrorPlan("No tienes permiso para ver este plano.");
                } else if (response.status === 404) {
                    setErrorPlan("El plano del edificio no se encontró.");
                    setBuildingPlanUrl(null);
                    setPlanFetched(true);
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            } catch (error) {
                console.error(`Error fetching plano del edificio:`, error);
                setErrorPlan("Error al cargar el plano.");
                setBuildingPlanUrl(null);
                setPlanFetched(true);
            } finally {
                setLoadingPlan(false);
            }
        } else if (planFetched && !buildingPlanUrl) {
            setErrorPlan("No hay plano disponible para este edificio.");
        }
    };

    const handleEditPlanClick = () => {
        setSelectedPlanFile(null);
        setPlanTitle('');
        setUploadPlanError(null);
        setShowPlanEditModal(true);
    };

    const handleClosePlanEditModal = () => {
        setShowPlanEditModal(false);
        setSelectedPlanFile(null);
        setUploadPlanError(null);
        setPlanTitle('');
    };

    const handlePlanFileChange = (e) => {
        setSelectedPlanFile(e.target.files[0]);
        setUploadPlanError(null);
    };

    const handlePlanTitleChange = (e) => {
        setPlanTitle(e.target.value);
    };


    const handleUploadPlan = async (e) => {
        e.preventDefault();
        if (!selectedPlanFile) {
            setUploadPlanError("Por favor, selecciona un archivo PDF para subir.");
            return;
        }
        if (selectedPlanFile.type !== 'application/pdf') {
            setUploadPlanError("Solo se permiten archivos PDF.");
            return;
        }
        if (!planTitle.trim()) {
            setUploadPlanError("Por favor, introduce un título para el plano.");
            return;
        }


        setUploadingPlan(true);
        setUploadPlanError(null);
        const token = getAuthToken();
        if (!token) {
            setUploadingPlan(false);
            return;
        }

        const formData = new FormData();
        formData.append('plan', selectedPlanFile);
        formData.append('titulo', planTitle);
        // AÑADIDO: Incluir buildingId en el FormData
        formData.append('buildingId', buildingId);

        try {
            const method = buildingPlanUrl ? 'PUT' : 'POST';
            const url = `http://localhost:8080/api/buildings/${buildingId}/planos`;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error("Acceso denegado o sesión expirada al subir/actualizar el plano.");
                }
                const errorData = await response.text();
                throw new Error(`Error al subir/actualizar el plano: ${response.status} - ${errorData || response.statusText}`);
            }

            await getBuildingPlanUrl(buildingId);
            handleClosePlanEditModal();
        } catch (err) {
            setUploadPlanError(err.message);
            if (err.message.includes("Acceso denegado") || err.message.includes("sesión expirada")) {
                localStorage.removeItem("authToken");
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setUploadingPlan(false);
        }
    };

    const handleDeletePlanClick = () => {
        setDeletePlanError(null);
        setShowPlanDeleteConfirmModal(true);
    };

    const handleClosePlanDeleteConfirmModal = () => {
        setShowPlanDeleteConfirmModal(false);
        setDeletePlanError(null);
    };

    const handleConfirmDeletePlan = async () => {
        setDeletingPlan(true);
        setDeletePlanError(null);
        const token = getAuthToken();
        if (!token) {
            setDeletingPlan(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/buildings/${buildingId}/planos`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    throw new Error("Acceso denegado o sesión expirada al eliminar el plano.");
                }
                throw new Error(`Error al eliminar el plano: ${response.statusText}`);
            }

            setBuildingPlanUrl(null);
            setPlanFetched(true);
            handleClosePlanDeleteConfirmModal();
        } catch (err) {
            setDeletePlanError(err.message);
            if (err.message.includes("Acceso denegado") || err.message.includes("sesión expirada")) {
                localStorage.removeItem("authToken");
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setDeletingPlan(false);
        }
    };


    return (
        <Container className="client-gallery-container">
            <h2 className="text-center mb-4 mt-5 fw-bold fs-2" style={{ color: "#f5922c" }}>
                Galería de Imágenes del Edificio
            </h2>
            <hr />

            {loadingImages ? (
                <div className="text-center my-3">
                    <Spinner animation="border" size="sm" /> Cargando imágenes...
                </div>
            ) : errorImages ? (
                <Alert variant="danger">{errorImages}</Alert>
            ) : (
                <>
                    {images.length > 0 ? (
                        <Row xs={1} md={2} lg={3} className="g-4 image-list-grid">
                            {images.map((image) => (
                                <Col key={image.id}>
                                    <Card className="h-100 shadow-sm image-card">
                                        <div
                                            className="card-image-container"
                                            style={{
                                                backgroundImage: `url(data:image/jpeg;base64,${image.imageBase64})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center",
                                                height: "200px",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => handleImageClick(image)}
                                        ></div>
                                        <Card.Body>
                                            <Card.Title className="mb-1">
                                                {image.title || `Imagen ${image.id}`}
                                            </Card.Title>
                                            <Card.Text className="text-muted small">
                                                Habitación: {image.roomName || 'Sin habitación asignada'}
                                            </Card.Text>
                                            <div className="d-flex justify-content-end gap-2 mt-2">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleEditClick(image)}
                                                    title="Editar imagen"
                                                >
                                                    <FaEdit /> Editar
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(image)}
                                                    title="Eliminar imagen"
                                                >
                                                    <FaTrashAlt /> Eliminar
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Alert variant="info" className="text-center my-4">
                            No hay imágenes registradas para esta construcción.
                        </Alert>
                    )}
                </>
            )}

            <hr className="my-5" />

            <h2 className="text-center mb-4 fw-bold fs-2" style={{ color: "#f5922c" }}>
                Plano del Edificio
            </h2>
            <Row className="justify-content-center mb-5">
                <Col xs={12} md={6} lg={4}>
                    <Card
                        className="h-100 shadow-sm image-card text-center"
                    >
                        <div
                            style={{ cursor: 'pointer' }}
                            onClick={handlePlanClick}
                        >
                            <Card.Img
                                variant="top"
                                src={planPlaceholderImage}
                                style={{ height: "180px", objectFit: "cover" }}
                            />
                            <Card.Body className="py-2">
                                <Card.Title className="mb-0 small">Ver Plano del Edificio</Card.Title>
                                {loadingPlan ? (
                                    <Card.Text className="text-muted">Cargando...</Card.Text>
                                ) : errorPlan ? (
                                    <Card.Text className="text-danger">{errorPlan}</Card.Text>
                                ) : buildingPlanUrl ? (
                                    <Card.Text className="text-success">Plano disponible. Haz clic para ver.</Card.Text>
                                ) : (
                                    <Card.Text className="text-muted">No hay plano disponible. Haz clic para subir.</Card.Text>
                                )}
                            </Card.Body>
                        </div>
                        <Card.Footer className="d-flex justify-content-center gap-2 py-2">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={handleEditPlanClick}
                                title="Subir o actualizar plano"
                                disabled={loadingPlan || uploadingPlan}
                            >
                                <FaUpload /> {buildingPlanUrl ? 'Actualizar' : 'Subir'} Plano
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={handleDeletePlanClick}
                                title="Eliminar plano"
                                disabled={!buildingPlanUrl || loadingPlan || deletingPlan}
                            >
                                <FaTrashAlt /> Eliminar Plano
                            </Button>
                        </Card.Footer>
                    </Card>
                </Col>
            </Row>

            <Modal show={showImageModal} onHide={handleCloseImageModal} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{selectedImage?.title || `Imagen ${selectedImage?.id}`}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {selectedImage?.imageBase64 ? (
                        <Image
                            src={`data:image/jpeg;base64,${selectedImage.imageBase64}`}
                            fluid
                            alt={selectedImage.title || 'Imagen grande'}
                        />
                    ) : (
                        <Spinner animation="border" />
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseImageModal}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Imagen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {savingChanges && <div className="text-center"><Spinner animation="border" size="sm" /> Guardando...</div>}
                    {saveError && <Alert variant="danger">{saveError}</Alert>}
                    <Form onSubmit={handleSaveChanges}>
                        <Form.Group className="mb-3">
                            <Form.Label>Título de la Imagen</Form.Label>
                            <Form.Control
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Introduce un título para la imagen"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Habitación</Form.Label>
                            {loadingRooms ? (
                                <div className="text-center"><Spinner animation="border" size="sm" /> Cargando habitaciones...</div>
                            ) : errorRooms ? (
                                <Alert variant="warning" className="small">{errorRooms}</Alert>
                            ) : (
                                <Form.Select
                                    value={editRoomId}
                                    onChange={(e) => setEditRoomId(e.target.value)}
                                >
                                    <option value="">Selecciona una habitación (Opcional)</option>
                                    {rooms.map((room) => (
                                        <option key={room.id} value={room.id}>
                                            {room.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            )}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cambiar Imagen (Opcional)</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleFileChangeForEdit}
                            />
                            {selectedFileForEdit && (
                                <Form.Text className="text-muted mt-2">
                                    Archivo seleccionado: {selectedFileForEdit.name}
                                </Form.Text>
                            )}
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={handleCloseEditModal} className="me-2">
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={savingChanges}>
                                Guardar Cambios
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showDeleteConfirmModal} onHide={handleCloseDeleteConfirmModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deletingImage && <div className="text-center"><Spinner animation="border" size="sm" /> Eliminando...</div>}
                    {deleteError && <Alert variant="danger">{deleteError}</Alert>}
                    <p>¿Estás seguro de que quieres eliminar la imagen "{imageToDelete?.title || `ID: ${imageToDelete?.id}`}?"</p>
                    <Alert variant="warning" className="small">Esta acción no se puede deshacer.</Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteConfirmModal} disabled={deletingImage}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete} disabled={deletingImage}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showPlanEditModal} onHide={handleClosePlanEditModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{buildingPlanUrl ? 'Actualizar Plano del Edificio' : 'Subir Plano del Edificio'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {uploadingPlan && <div className="text-center"><Spinner animation="border" size="sm" /> Subiendo plano...</div>}
                    {uploadPlanError && <Alert variant="danger">{uploadPlanError}</Alert>}
                    <Form onSubmit={handleUploadPlan}>
                        <Form.Group className="mb-3">
                            <Form.Label>Título del Plano</Form.Label>
                            <Form.Control
                                type="text"
                                value={planTitle}
                                onChange={handlePlanTitleChange}
                                placeholder="Introduce un título para el plano"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Seleccionar archivo PDF</Form.Label>
                            <Form.Control
                                type="file"
                                accept="application/pdf"
                                onChange={handlePlanFileChange}
                                required
                            />
                            {selectedPlanFile && (
                                <Form.Text className="text-muted mt-2">
                                    Archivo seleccionado: {selectedPlanFile.name}
                                </Form.Text>
                            )}
                        </Form.Group>
                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={handleClosePlanEditModal} className="me-2">
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={uploadingPlan}>
                                <FaUpload /> {buildingPlanUrl ? 'Actualizar' : 'Subir'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            <Modal show={showPlanDeleteConfirmModal} onHide={handleClosePlanDeleteConfirmModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación del Plano</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {deletingPlan && <div className="text-center"><Spinner animation="border" size="sm" /> Eliminando plano...</div>}
                    {deletePlanError && <Alert variant="danger">{deletePlanError}</Alert>}
                    <p>¿Estás seguro de que quieres eliminar el plano del edificio?</p>
                    <Alert variant="warning" className="small">Esta acción no se puede deshacer.</Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClosePlanDeleteConfirmModal} disabled={deletingPlan}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDeletePlan} disabled={deletingPlan}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default BuildingImagesList;