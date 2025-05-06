import React, { useState, useEffect } from 'react';

function ClientGallery() {
    const [images, setImages] = useState([]);

    useEffect(() => {
        fetch('/api/images/all')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => setImages(data))
            .catch(error => console.error('Error fetching images:', error));
    }, []);

    return (
        <div>
            <h1>Galería de Imágenes</h1>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {images.map(image => (
                    <div key={image.id} style={{ margin: '10px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                        {image.imageUrl && (
                            <img
                                src={image.imageUrl}
                                alt={image.title || 'Imagen'}
                                style={{ maxWidth: '200px', height: 'auto', display: 'block', marginBottom: '5px' }}
                            />
                        )}
                        {image.title && <h3>{image.title}</h3>}
                        {image.roomId && <p>Room ID: {image.roomId}</p>}
                        {/* Puedes seguir mostrando otros campos si tu entidad los tiene */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ClientGallery;