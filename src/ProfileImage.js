import React, { useState, useEffect } from 'react';


function ProfileImage({ username }) {
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const backendURL = 'http://localhost:8080'; // Reemplaza con la URL de tu backend


    useEffect(() => {
        const fetchProfileImage = async () => {
            try {
                const response = await fetch(`${backendURL}/auth/customers/${username}/image`);
                if (response.ok) {
                    const imageBlob = await response.blob();
                    const imageUrl = URL.createObjectURL(imageBlob);
                    setProfileImageUrl(imageUrl);
                } else if (response.status === 404) {
                    console.log('Imagen de perfil no encontrada para este usuario.');
                    // Puedes establecer una imagen por defecto aquí si lo deseas
                    // setProfileImageUrl('/ruta/a/imagen-por-defecto.png');
                } else {
                    console.error('Error al cargar la imagen de perfil:', response.status);
                }
            } catch (error) {
                console.error('Error de red al cargar la imagen de perfil:', error);
            }
        };


        if (username) {
            fetchProfileImage();
        }
    }, [username, backendURL]);


    return (
        <div
            style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #ccc', // Opcional: borde circular
            }}
        >
            {profileImageUrl ? (
                <img
                    src={profileImageUrl}
                    alt="Imagen de perfil"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover', // Para que la imagen cubra el círculo sin deformarse
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
                        backgroundColor: '#f0f0f0', // Opcional: color de fondo si no hay imagen
                    }}
                >
                    {/* Puedes mostrar un icono o texto indicando que no hay imagen */}
                    Sin imagen
                </div>
            )}
        </div>
    );
}


export default ProfileImage;