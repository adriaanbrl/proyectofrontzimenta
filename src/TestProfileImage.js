import React from 'react';
import ProfileImage from './ProfileImage'; // Asegúrate de que la ruta al componente ProfileImage sea correcta

function TestProfileImage() {
    // Aquí puedes simular el username de un usuario logueado
    const sampleUsername = 'ana.g123';


    return (
        <div>
            <h1>Prueba del Componente ProfileImage</h1>
            <ProfileImage username={sampleUsername} />


        </div>
    );
}

export default TestProfileImage;
