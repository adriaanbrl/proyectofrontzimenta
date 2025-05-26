import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { File } from 'lucide-react'; // For file icon

// Accept 'buildingDetails' as a prop
const UploadImageModal = ({ show, onHide, buildingId, buildingDetails, onUploadSuccess }) => {
    const [imageFile, setImageFile] = useState(null);
    const [title, setTitle] = useState('');
    const [roomId, setRoomId] = useState('');
    const [estancias, setEstancias] = useState([]); // Rooms for the selected building
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [errorRooms, setErrorRooms] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');

    // Fetch rooms for the specific building when the modal opens
    useEffect(() => {
        if (show && buildingId) {
            const fetchEstancias = async () => {
                setLoadingRooms(true);
                setErrorRooms(null);
                try {
                    const token = localStorage.getItem("authToken");
                    const response = await fetch("http://localhost:8080/api/estancias", {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `Error al cargar las estancias: ${response.statusText}`);
                    }
                    const data = await response.json();
                    setEstancias(data);
                } catch (error) {
                    console.error('Error fetching rooms:', error);
                    setErrorRooms(`Error al cargar las estancias: ${error.message}`);
                } finally {
                    setLoadingRooms(false);
                }
            };
            fetchEstancias();
        } else {
            // Reset states when modal is hidden
            setImageFile(null);
            setTitle('');
            setRoomId('');
            setEstancias([]);
            setLoadingRooms(true);
            setErrorRooms(null);
            setIsSubmitting(false);
            setUploadError('');
            setUploadSuccess('');
        }
    }, [show, buildingId]); // Re-run effect when show or buildingId changes

    const handleImageFileChange = (event) => {
        setImageFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setUploadError('');
        setUploadSuccess('');

        if (!imageFile) {
            setUploadError('Por favor, seleccione una imagen.');
            setIsSubmitting(false);
            return;
        }
        if (!title.trim()) {
            setUploadError('Por favor, ingrese un título para la imagen.');
            setIsSubmitting(false);
            return;
        }
        if (!roomId) {
            setUploadError('Por favor, seleccione una estancia.');
            setIsSubmitting(false);
            return;
        }
        if (!buildingId) {
            setUploadError('ID de edificio no disponible.');
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('title', title.trim());
        formData.append('roomId', parseInt(roomId, 10)); // Ensure it's an integer

        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(
                `http://localhost:8080/api/buildings/${buildingId}/images`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`

                    },
                    body: formData,
                }
            );

            if (response.ok) {
                setUploadSuccess('Imagen subida con éxito!');
                setImageFile(null);
                setTitle('');
                setRoomId('');
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
            } else {
                const errorData = await response.text();
                console.error('Error al subir la imagen:', response.status, errorData);
                setUploadError(`Hubo un error al subir la imagen: ${errorData}`);
            }
        } catch (error) {
            console.error('Error de red al subir la imagen:', error);
            setUploadError('Error de red al subir la imagen.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    Subir Imagen para Obra: {buildingDetails?.title || buildingDetails?.address || 'N/A'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {uploadError && <Alert variant="danger">{uploadError}</Alert>}
                {uploadSuccess && <Alert variant="success">{uploadSuccess}</Alert>}

                {loadingRooms ? (
                    <div className="text-center">
                        <Spinner animation="border" size="sm" /> Cargando estancias...
                    </div>
                ) : errorRooms ? (
                    <Alert variant="warning">{errorRooms}</Alert>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="imageTitle">
                            <Form.Label className="fw-semibold">Título de la Imagen:</Form.Label>
                            <Form.Control
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Ej: Avance de obra, Detalle de instalación"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="roomId">
                            <Form.Label className="fw-semibold">Estancia:</Form.Label>
                            <Form.Control
                                as="select"
                                value={roomId}
                                onChange={(e) => setRoomId(e.target.value)}
                                required
                            >
                                <option value="">Seleccionar estancia</option>
                                {estancias.map((estancia) => (
                                    <option key={estancia.id} value={estancia.id}>{estancia.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="imageFile">
                            <Form.Label className="fw-semibold">Seleccionar Imagen:</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileChange}
                                required
                            />
                            {imageFile && (
                                <div className="mt-2 text-muted small">
                                    <File size={16} className="me-1" />
                                    {imageFile.name}
                                </div>
                            )}
                        </Form.Group>

                        <Button
                            variant="btn btn-outline-custom"
                            type="submit"
                            disabled={isSubmitting || loadingRooms}
                            className="w-100 mt-3"
                        >
                            {isSubmitting ? 'Subiendo...' : 'Subir Imagen'}
                        </Button>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UploadImageModal;