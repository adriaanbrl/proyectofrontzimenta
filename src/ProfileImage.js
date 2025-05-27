import React, { useState, useEffect } from 'react';
import { PersonCircle } from 'react-bootstrap-icons';

function ProfileImage({ username }) {
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const backendURL = 'http://localhost:8080';
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);   

    useEffect(() => {
        const fetchProfileImage = async () => {
            setLoading(true); 
            setError(null);   
            setProfileImageUrl(''); 

            const token = localStorage.getItem('authToken'); 

            if (!token) {
                console.warn('No authentication token found. Cannot fetch profile image.');
                setError('No autenticación. Inicia sesión.'); 
                setLoading(false);
                return;
            }

            if (!username) {
                console.warn('Username no proporcionado para la imagen de perfil.');
                setError('Usuario no especificado.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${backendURL}/auth/customers/${username}/image`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, 
                    },
                });

                if (response.ok) {
                    const imageBlob = await response.blob();
                    const imageUrl = URL.createObjectURL(imageBlob);
                    setProfileImageUrl(imageUrl);
                } else if (response.status === 404) {
                    console.log('Imagen de perfil no encontrada para este usuario (404).');
                    setProfileImageUrl(''); // Keep it empty to show default icon
                    setError('Imagen no encontrada.');
                } else if (response.status === 401 || response.status === 403) {
                    console.error('Acceso denegado a la imagen de perfil:', response.status);
                    setError('Acceso denegado. Vuelve a iniciar sesión.');
                    // Optionally, redirect to login or clear token if 401/403
                    localStorage.removeItem('authToken');
                }
                else {
                    console.error('Error al cargar la imagen de perfil:', response.status);
                    setError(`Error al cargar la imagen: ${response.status}`);
                }
            } catch (error) {
                console.error('Error de red al cargar la imagen de perfil:', error);
                setError('Error de red. Inténtalo de nuevo.');
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchProfileImage();

    }, [username, backendURL]);

    return (
        <div
            style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #ccc', 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            {loading ? (
                <div className="text-center">Cargando...</div>
            ) : error ? (
                <div className="text-center text-danger" style={{ fontSize: '0.8em' }}>{error}</div> 
            ) : profileImageUrl ? (
                <img
                    src={profileImageUrl}
                    alt="Imagen de perfil"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                />
            ) : (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#f0f0f0', 
                    }}
                >
                    <PersonCircle size={100} color="orange" />
                </div>
            )}
        </div>
    );
}

export default ProfileImage;