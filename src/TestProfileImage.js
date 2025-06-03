import React, { useState, useEffect } from 'react';
import ProfileImage from './ProfileImage';
import { jwtDecode } from 'jwt-decode';

function TestProfileImage() {
    const [loggedInUsername, setLoggedInUsername] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);

                setLoggedInUsername(decodedToken.username || decodedToken.sub || 'Usuario');
            } catch (error) {

                setLoggedInUsername('Usuario'); 
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