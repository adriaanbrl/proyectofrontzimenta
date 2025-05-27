import React, { useState, useEffect, useCallback } from 'react';
import { Form, Image, Spinner, Alert } from 'react-bootstrap';
import { PencilSquare, PersonCircle } from 'react-bootstrap-icons';
import { jwtDecode } from 'jwt-decode';

const WorkerProfileImageHandler = () => {
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [workerId, setWorkerId] = useState(null);
    const backendURL = 'http://localhost:8080';

    const fetchProfileImage = useCallback(async (id, token) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${backendURL}/auth/worker/${id}/image`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Get the blob and create a URL
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                setProfileImageUrl(imageUrl);
            } else if (response.status === 404) {
                console.log('Imagen de perfil de trabajador no encontrada (404). Usando imagen por defecto.');
                setProfileImageUrl(null); // Explicitly set to null to show default icon
            } else if (response.status === 401 || response.status === 403) {
                console.error('Acceso denegado a la imagen de perfil del trabajador:', response.status);
                setError('Acceso denegado. Por favor, vuelve a iniciar sesión.');
                localStorage.removeItem('authToken');
                setProfileImageUrl(null);
            } else {
                const errorText = await response.text();
                console.error('Error al cargar la imagen de perfil del trabajador:', response.status, errorText);
                setError(`Error al cargar la imagen: ${response.statusText}`);
                setProfileImageUrl(null);
            }
        } catch (err) {
            console.error('Error de red al cargar la imagen de perfil del trabajador:', err);
            setError('Error de red al cargar la imagen.');
            setProfileImageUrl(null);
        } finally {
            setLoading(false);
        }
    }, [backendURL]);

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('No autenticación. Inicia sesión para subir la imagen.');
            setLoading(false);
            return;
        }
        if (!workerId) {
            setError('ID de trabajador no disponible para subir la imagen.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${backendURL}/auth/worker/${workerId}/image/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                console.log('Imagen de perfil subida exitosamente.');
                // *** IMPORTANT: RE-FETCH THE IMAGE AFTER SUCCESSFUL UPLOAD ***
                await fetchProfileImage(workerId, token);
            } else {
                const errorText = await response.text();
                throw new Error(`Error al subir la imagen: ${response.statusText}. ${errorText}`);
            }
        } catch (err) {
            console.error('Error al subir la imagen:', err);
            setError(err.message || 'Error al subir la imagen.');
        } finally {
            setLoading(false);
            // Clear the file input field after upload attempt to allow re-uploading the same file
            event.target.value = null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentWorkerId = decodedToken.id;
                setWorkerId(currentWorkerId);
                if (currentWorkerId) {
                    fetchProfileImage(currentWorkerId, token);
                } else {
                    setError('ID del trabajador no encontrado en el token.');
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error al decodificar el token:', err);
                setError('Error de autenticación. Por favor, inicie sesión de nuevo.');
                setLoading(false);
            }
        } else {
            setError('No se encontró el token de autenticación.');
            setLoading(false);
        }
    }, [fetchProfileImage]);

    return (
        <div className="position-relative d-inline-block ms-3">
            {loading ? (
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Spinner animation="border" size="sm" />
                </div>
            ) : error ? (
                <div className="text-center text-danger" style={{ fontSize: '0.7em', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid red', borderRadius: '50%' }}>
                    {error.split(' ')[0]}
                </div>
            ) : profileImageUrl ? (
                <Image
                    src={profileImageUrl}
                    alt="Perfil del Trabajador"
                    roundedCircle
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
            ) : (
                <div
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '2px solid #ccc',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f0f0f0',
                    }}
                >
                    <PersonCircle size={80} color="orange" />
                </div>
            )}

            <Form.Group className="position-absolute bottom-0 end-0 mb-1 me-1">
                <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="d-none"
                    id="upload-profile-image"
                />
                <Form.Label htmlFor="upload-profile-image" className="bg-light border rounded-circle p-1" style={{ cursor: 'pointer' }}>
                    <PencilSquare size={16} className="text-secondary" />
                </Form.Label>
            </Form.Group>
        </div>
    );
};

export default WorkerProfileImageHandler;