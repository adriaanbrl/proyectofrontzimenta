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
                setError('No autenticación. Inicia sesión.'); 
                setLoading(false);
                return;
            }

            if (!username) {
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

                    setProfileImageUrl(''); 
                    setError('Imagen no encontrada.');
                } else if (response.status === 401 || response.status === 403) {

                    setError('Acceso denegado. Vuelve a iniciar sesión.');

                    localStorage.removeItem('authToken');
                }
                else {
                    setError(`Error al cargar la imagen: ${response.status}`);
                }
            } catch (error) {
                setError('Error de red. Inténtalo de nuevo.');
            } finally {
                setLoading(false);
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