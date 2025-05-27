import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { File } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

// Helper function to check if a token is expired
const isTokenExpired = (token) => {
    if (!token) {
        console.log("isTokenExpired: Token is null or empty.");
        return true;
    }
    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const expired = decodedToken.exp < currentTime;
        console.log(`isTokenExpired: Token exp: ${decodedToken.exp}, Current time: ${currentTime}, Expired: ${expired}`);
        return expired;
    } catch (error) {
        console.error("isTokenExpired: Error decoding token:", error);
        return true;
    }
};

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
        console.log(`UploadImageModal useEffect triggered. show: ${show}, buildingId: ${buildingId}`);
        if (show && buildingId) {
            const fetchEstancias = async () => {
                setLoadingRooms(true);
                setErrorRooms(null);
                const token = localStorage.getItem("authToken");
                console.log("fetchEstancias: Token from localStorage:", token ? token.substring(0, 30) + '...' : 'null/undefined');

                // Token validation before fetching estancias
                if (!token || isTokenExpired(token)) {
                    console.log("fetchEstancias: Token is invalid or missing. Returning early.");
                    setErrorRooms('Su sesión ha expirado o no está autenticado. Por favor, inicie sesión de nuevo.');
                    setLoadingRooms(false);
                    if (token) localStorage.removeItem("authToken");
                    return;
                }
                console.log("fetchEstancias: Token is valid. Proceeding with fetch request.");

                try {
                    const response = await fetch("http://localhost:8080/api/estancias", {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('fetchEstancias: Backend response not OK:', response.status, errorData);
                        // Handle specific auth errors if needed
                        if (response.status === 401 || response.status === 403) {
                            localStorage.removeItem("authToken");
                            setErrorRooms('Acceso denegado a las estancias. Su sesión ha expirado.');
                        } else {
                            throw new Error(errorData.message || `Error al cargar las estancias: ${response.statusText}`);
                        }
                    }
                    const data = await response.json();
                    setEstancias(data);
                    console.log("fetchEstancias: Estancias loaded successfully:", data);
                } catch (error) {
                    console.error('fetchEstancias: Error during fetch operation:', error);
                    setErrorRooms(`Error al cargar las estancias: ${error.message}`);
                } finally {
                    setLoadingRooms(false);
                }
            };
            fetchEstancias();
        } else {
            console.log("UploadImageModal useEffect: Modal is hidden or buildingId is missing. Resetting states.");
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
    }, [show, buildingId]);

    const handleImageFileChange = (event) => {
        setImageFile(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setUploadError('');
        setUploadSuccess('');

        const token = localStorage.getItem("authToken");
        console.log("handleSubmit: Token from localStorage:", token ? token.substring(0, 30) + '...' : 'null/undefined');

        // Token validation before submitting image
        if (!token || isTokenExpired(token)) {
            console.log("handleSubmit: Token is invalid or missing. Preventing upload.");
            setUploadError('Su sesión ha expirado o no está autenticado. Por favor, inicie sesión de nuevo.');
            setIsSubmitting(false);
            if (token) localStorage.removeItem("authToken");
            return;
        }

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
            console.log(`handleSubmit: Sending image upload request for building ${buildingId}...`);
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
                // Clear the file input field after successful upload
                event.target.elements.imageFile.value = '';
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
                console.log("handleSubmit: Image uploaded successfully.");
            } else {
                const errorText = await response.text();
                console.error('handleSubmit: Error al subir la imagen:', response.status, errorText);
                // Handle specific auth errors during upload
                if (response.status === 401 || response.status === 403) {
                    localStorage.removeItem("authToken");
                    setUploadError('Acceso denegado al subir la imagen. Su sesión ha expirado.');
                } else {
                    setUploadError(`Hubo un error al subir la imagen: ${errorText}`);
                }
            }
        } catch (error) {
            console.error('handleSubmit: Error de red al subir la imagen:', error);
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