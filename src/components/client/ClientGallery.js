import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

function ClientGallery() {
    const [images, setImages] = useState([]);
    const [buildingIdFromToken, setBuildingIdFromToken] = useState(null);
    const [loadingBuildingId, setLoadingBuildingId] = useState(true);
    const [errorBuildingId, setErrorBuildingId] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setBuildingIdFromToken(decodedToken.building_id || null);
                console.log('building_id del token para la galería:', decodedToken.building_id);
            } catch (error) {
                console.error('Error al decodificar el token para la galería:', error);
                setErrorBuildingId('Error al leer la información del edificio.');
            } finally {
                setLoadingBuildingId(false);
            }
        } else {
            setErrorBuildingId('No se encontró el token de autenticación.');
            setLoadingBuildingId(false);
        }
    }, []);

    useEffect(() => {
        const fetchBuildingImages = async () => {
            if (buildingIdFromToken) {
                try {
                    const url = `http://localhost:8080/api/buildings/${buildingIdFromToken}/images`;
                    const token = localStorage.getItem('authToken');
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`, // Incluye el token en los headers
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    setImages(data);
                    console.log(`Imágenes recibidas para el edificio ${buildingIdFromToken}:`, data);
                } catch (error) {
                    console.error(`Error fetching imágenes del edificio ${buildingIdFromToken}:`, error);
                    setImages([]);
                }
            } else if (errorBuildingId) {
                console.error('Error al obtener el ID del edificio:', errorBuildingId);
                setImages([]);
            } else if (!loadingBuildingId) {
                console.warn('ID del edificio no disponible. No se pueden cargar las imágenes.');
                setImages([]);
            }
        };

        fetchBuildingImages();
    }, [buildingIdFromToken, errorBuildingId, loadingBuildingId]);

    return (
        <div>
            <h1>Galería de Imágenes del Edificio {buildingIdFromToken || 'Cargando ID...'}</h1>
            {loadingBuildingId && <p>Cargando ID del edificio...</p>}
            {errorBuildingId && <p className="error-message">{errorBuildingId}</p>}
            {!loadingBuildingId && !errorBuildingId && (
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {images.map(image => (
                        <div key={image.id} style={{ margin: '10px', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
                            {image.imageBase64 && (
                                <img
                                    src={image.imageBase64}
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
            )}
            {!loadingBuildingId && !errorBuildingId && images.length === 0 && buildingIdFromToken && (
                <p>No hay imágenes para este edificio.</p>
            )}
            {!loadingBuildingId && !errorBuildingId && !buildingIdFromToken && (
                <p>ID del edificio no disponible.</p>
            )}
        </div>
    );
}

export default ClientGallery;