import React, { useState, useEffect } from 'react';
import ProfileImage from './ProfileImage'; // Asegúrate de que la ruta al componente ProfileImage sea correcta
import { jwtDecode } from 'jwt-decode'; // Importa jwtDecode

function TestProfileImage() {
    const [loggedInUsername, setLoggedInUsername] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);

                setLoggedInUsername(decodedToken.username || decodedToken.sub || 'Usuario');
            } catch (error) {
                console.error('Error decoding JWT:', error);
                setLoggedInUsername('Usuario'); // Fallback username
            }
        } else {
            setLoggedInUsername('Usuario no logueado');
        }
    }, []);

    return (
        <div>
            {loggedInUsername ? (
                <ProfileImage username={loggedInUsername} />
            ) : (
                <p>No hay usuario logueado para mostrar la imagen.</p>
            )}
        </div>
    );
}

export default TestProfileImage;